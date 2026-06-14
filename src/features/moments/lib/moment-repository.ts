import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabasePublicServerClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  mapMomentDetail,
  mapMomentSummary,
  mapOwnerMoment,
} from "./moment-mapper";
import { MomentRepositoryError } from "./moment-repository-error";
import type { Database } from "@/lib/supabase/types";

type MomentRow = Database["public"]["Tables"]["moments"]["Row"];
type MomentAssetRow =
  Database["public"]["Tables"]["moment_media_assets"]["Row"];
type MomentSupabaseClient = SupabaseClient<Database>;

function groupAssetsByMomentId(assets: MomentAssetRow[]) {
  return assets.reduce<Record<string, MomentAssetRow[]>>((groups, asset) => {
    if (!asset.moment_id) {
      return groups;
    }

    groups[asset.moment_id] ??= [];
    groups[asset.moment_id].push(asset);
    return groups;
  }, {});
}

async function getAssetsForMoments(
  supabase: MomentSupabaseClient,
  momentIds: string[]
) {
  if (momentIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("moment_media_assets")
    .select("*")
    .in("moment_id", momentIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new MomentRepositoryError(error.message, error.code);
  }

  return groupAssetsByMomentId(data ?? []);
}

export async function getPublishedMomentSummaries() {
  const supabase = createSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("status", "published")
    .eq("visibility", "public")
    .order("sort_key", { ascending: false });

  if (error) {
    throw new MomentRepositoryError(error.message, error.code);
  }

  const moments = (data ?? []) as MomentRow[];
  const assetsByMomentId = await getAssetsForMoments(
    supabase,
    moments.map((moment) => moment.id)
  );

  return moments.map((moment) =>
    mapMomentSummary(moment, assetsByMomentId[moment.id] ?? [])
  );
}

export async function getPublishedMomentBySlug(slug: string) {
  const supabase = createSupabasePublicServerClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error) {
    throw new MomentRepositoryError(error.message, error.code);
  }

  if (!data) {
    return null;
  }

  const assetsByMomentId = await getAssetsForMoments(supabase, [data.id]);

  return mapMomentDetail(data, assetsByMomentId[data.id] ?? []);
}

export async function getOwnerMomentSummaries() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new MomentRepositoryError(error.message, error.code);
  }

  const moments = (data ?? []) as MomentRow[];
  const assetsByMomentId = await getAssetsForMoments(
    supabase,
    moments.map((moment) => moment.id)
  );

  return moments.map((moment) =>
    mapOwnerMoment(moment, assetsByMomentId[moment.id] ?? [])
  );
}

export async function getOwnerMomentById(momentId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("moments")
    .select("*")
    .eq("id", momentId)
    .maybeSingle();

  if (error) {
    throw new MomentRepositoryError(error.message, error.code);
  }

  if (!data) {
    return null;
  }

  const assetsByMomentId = await getAssetsForMoments(supabase, [data.id]);

  return mapOwnerMoment(data, assetsByMomentId[data.id] ?? []);
}
