"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getOwnerAuthUser } from "@/features/auth/lib/get-owner-auth-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  cloudinaryUploadResultSchema,
  momentFormSchema,
} from "../lib/moment-schema";
import { createMomentSlug } from "../lib/moment-slug";

type ServerSupabaseClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

export type MomentActionResult =
  | { ok: true; reason: null }
  | { ok: false; reason: string };

const uuidSchema = z.string().uuid();

const addMomentAssetInputSchema = z.object({
  momentId: uuidSchema,
  upload: cloudinaryUploadResultSchema,
});

const momentAssetFormSchema = z.object({
  alt: z.string().trim().transform(nullableFormString),
  caption: z.string().trim().transform(nullableFormString),
  sortOrder: z.coerce.number().int().min(0).catch(0),
});

function nullableFormString(value: string) {
  return value.length > 0 ? value : null;
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function parseMomentFormData(formData: FormData) {
  return momentFormSchema.parse({
    description: readFormString(formData, "description"),
    location: readFormString(formData, "location"),
    noteMarkdown: readFormString(formData, "noteMarkdown"),
    occurredAt: readFormString(formData, "occurredAt"),
    slug: readFormString(formData, "slug"),
    title: readFormString(formData, "title"),
  });
}

function parseMomentAssetFormData(formData: FormData) {
  return momentAssetFormSchema.parse({
    alt: readFormString(formData, "alt"),
    caption: readFormString(formData, "caption"),
    sortOrder: readFormString(formData, "sortOrder"),
  });
}

async function getOwnerPersistenceContext() {
  const user = await getOwnerAuthUser();

  if (!user) {
    return null;
  }

  return {
    supabase: await createSupabaseServerClient(),
    userId: user.id,
  };
}

async function getUniqueMomentSlug(
  supabase: ServerSupabaseClient,
  desiredSlug: string,
  currentMomentId?: string
) {
  for (let suffix = 1; suffix <= 50; suffix += 1) {
    const candidate =
      suffix === 1 ? desiredSlug : `${desiredSlug}-${suffix}`;
    const { data, error } = await supabase
      .from("moments")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.id === currentMomentId) {
      return candidate;
    }
  }

  return `${desiredSlug}-${Date.now()}`;
}

async function getMomentSlugById(
  supabase: ServerSupabaseClient,
  momentId: string
) {
  const { data, error } = await supabase
    .from("moments")
    .select("slug")
    .eq("id", momentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.slug ?? null;
}

function revalidateMomentPaths(slug?: string | null) {
  revalidatePath("/moments");
  revalidatePath("/studio/moments");

  if (slug) {
    revalidatePath(`/moments/${slug}`);
  }
}

export async function createMomentAction(formData: FormData) {
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const values = parseMomentFormData(formData);
  const desiredSlug = values.slug ?? createMomentSlug(values.title);
  const slug = await getUniqueMomentSlug(context.supabase, desiredSlug);
  const now = new Date().toISOString();
  const { data, error } = await context.supabase
    .from("moments")
    .insert({
      created_by: context.userId,
      description: values.description,
      location: values.location,
      note_markdown: values.noteMarkdown,
      occurred_at: values.occurredAt,
      published_at: null,
      slug,
      sort_key: now,
      status: "draft",
      title: values.title,
      visibility: "public",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateMomentPaths(slug);
  redirect(`/studio/moments/${data.id}/edit`);
}

export async function updateMomentAction(
  momentId: string,
  formData: FormData
) {
  const parsedMomentId = uuidSchema.parse(momentId);
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const values = parseMomentFormData(formData);
  const desiredSlug = values.slug ?? createMomentSlug(values.title);
  const slug = await getUniqueMomentSlug(
    context.supabase,
    desiredSlug,
    parsedMomentId
  );
  const { error } = await context.supabase
    .from("moments")
    .update({
      description: values.description,
      location: values.location,
      note_markdown: values.noteMarkdown,
      occurred_at: values.occurredAt,
      slug,
      title: values.title,
    })
    .eq("id", parsedMomentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateMomentPaths(slug);
  redirect(`/studio/moments/${parsedMomentId}/edit`);
}

export async function publishMomentAction(momentId: string) {
  const parsedMomentId = uuidSchema.parse(momentId);
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const now = new Date().toISOString();
  const { data, error } = await context.supabase
    .from("moments")
    .update({
      published_at: now,
      sort_key: now,
      status: "published",
      visibility: "public",
    })
    .eq("id", parsedMomentId)
    .select("slug")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateMomentPaths(data.slug);
  redirect(`/studio/moments/${parsedMomentId}/edit`);
}

export async function archiveMomentAction(momentId: string) {
  const parsedMomentId = uuidSchema.parse(momentId);
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const { data, error } = await context.supabase
    .from("moments")
    .update({ status: "archived" })
    .eq("id", parsedMomentId)
    .select("slug")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateMomentPaths(data.slug);
  redirect(`/studio/moments/${parsedMomentId}/edit`);
}

export async function deleteMomentAction(momentId: string) {
  const parsedMomentId = uuidSchema.parse(momentId);
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const slug = await getMomentSlugById(context.supabase, parsedMomentId);
  const { error } = await context.supabase
    .from("moments")
    .delete()
    .eq("id", parsedMomentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateMomentPaths(slug);
  redirect("/studio/moments");
}

export async function addMomentAssetAction(
  input: unknown
): Promise<MomentActionResult> {
  const parsed = addMomentAssetInputSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, reason: "invalid-upload" };
  }

  const context = await getOwnerPersistenceContext();

  if (!context) {
    return { ok: false, reason: "unauthorized" };
  }

  const { momentId, upload } = parsed.data;
  const [momentResult, lastAssetResult] = await Promise.all([
    context.supabase
      .from("moments")
      .select("cover_asset_id, slug")
      .eq("id", momentId)
      .maybeSingle(),
    context.supabase
      .from("moment_media_assets")
      .select("sort_order")
      .eq("moment_id", momentId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (momentResult.error || !momentResult.data) {
    return { ok: false, reason: "moment-not-found" };
  }

  if (lastAssetResult.error) {
    return { ok: false, reason: "asset-order-unavailable" };
  }

  const nextSortOrder = (lastAssetResult.data?.sort_order ?? -1) + 1;
  const { data: asset, error } = await context.supabase
    .from("moment_media_assets")
    .insert({
      alt: upload.original_filename ?? null,
      bytes: upload.bytes,
      cloudinary_asset_id: upload.asset_id ?? null,
      cloudinary_public_id: upload.public_id,
      created_by: context.userId,
      format: upload.format,
      height: upload.height,
      moment_id: momentId,
      resource_type: upload.resource_type,
      secure_url: upload.secure_url,
      sort_order: nextSortOrder,
      width: upload.width,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, reason: error.message };
  }

  if (!momentResult.data.cover_asset_id) {
    await context.supabase
      .from("moments")
      .update({ cover_asset_id: asset.id })
      .eq("id", momentId);
  }

  revalidateMomentPaths(momentResult.data.slug);
  return { ok: true, reason: null };
}

export async function updateMomentAssetAction(
  momentId: string,
  assetId: string,
  formData: FormData
) {
  const parsedMomentId = uuidSchema.parse(momentId);
  const parsedAssetId = uuidSchema.parse(assetId);
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const values = parseMomentAssetFormData(formData);
  const { data, error } = await context.supabase
    .from("moment_media_assets")
    .update({
      alt: values.alt,
      caption: values.caption,
      sort_order: values.sortOrder,
    })
    .eq("id", parsedAssetId)
    .eq("moment_id", parsedMomentId)
    .select("moment_id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Moment asset not found.");
  }

  const slug = await getMomentSlugById(context.supabase, parsedMomentId);
  revalidateMomentPaths(slug);
  redirect(`/studio/moments/${parsedMomentId}/edit`);
}

export async function setMomentCoverAction(momentId: string, assetId: string) {
  const parsedMomentId = uuidSchema.parse(momentId);
  const parsedAssetId = uuidSchema.parse(assetId);
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const { data: asset, error: assetError } = await context.supabase
    .from("moment_media_assets")
    .select("id")
    .eq("id", parsedAssetId)
    .eq("moment_id", parsedMomentId)
    .maybeSingle();

  if (assetError || !asset) {
    throw new Error(assetError?.message ?? "Moment asset not found.");
  }

  const { data, error } = await context.supabase
    .from("moments")
    .update({ cover_asset_id: parsedAssetId })
    .eq("id", parsedMomentId)
    .select("slug")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidateMomentPaths(data.slug);
  redirect(`/studio/moments/${parsedMomentId}/edit`);
}

export async function deleteMomentAssetAction(
  momentId: string,
  assetId: string
) {
  const parsedMomentId = uuidSchema.parse(momentId);
  const parsedAssetId = uuidSchema.parse(assetId);
  const context = await getOwnerPersistenceContext();

  if (!context) {
    redirect("/auth/sign-in/github?next=/studio/moments");
  }

  const slug = await getMomentSlugById(context.supabase, parsedMomentId);

  await context.supabase
    .from("moments")
    .update({ cover_asset_id: null })
    .eq("id", parsedMomentId)
    .eq("cover_asset_id", parsedAssetId);

  const { error } = await context.supabase
    .from("moment_media_assets")
    .delete()
    .eq("id", parsedAssetId)
    .eq("moment_id", parsedMomentId);

  if (error) {
    throw new Error(error.message);
  }

  revalidateMomentPaths(slug);
  redirect(`/studio/moments/${parsedMomentId}/edit`);
}
