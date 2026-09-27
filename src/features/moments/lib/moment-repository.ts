import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { createSupabasePublicServerClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  mapMomentDetail,
  mapMomentSummary,
  mapOwnerMoment,
} from "./moment-mapper";
import {
  PUBLIC_MOMENTS_CACHE_TAG,
  PUBLIC_MOMENTS_REVALIDATE_SECONDS,
} from "./moment-cache";
import {
  createMomentCursorFilter,
  decodeMomentCursor,
  encodeMomentCursor,
} from "./moment-cursor";
import { MomentRepositoryError } from "./moment-repository-error";
import type { Database } from "@/lib/supabase/types";
import type { MomentFeedPage } from "../types";

type MomentRow = Database["public"]["Tables"]["moments"]["Row"];
type MomentAssetRow =
  Database["public"]["Tables"]["moment_media_assets"]["Row"];
type MomentAssetListRow = Pick<
  MomentAssetRow,
  | "alt"
  | "caption"
  | "created_at"
  | "height"
  | "id"
  | "moment_id"
  | "secure_url"
  | "sort_order"
  | "width"
>;
type MomentAssetIndexRow = Pick<
  MomentAssetRow,
  "created_at" | "id" | "moment_id" | "sort_order"
>;
type MomentAssetCoverRow = Pick<
  MomentAssetRow,
  | "alt"
  | "caption"
  | "height"
  | "id"
  | "moment_id"
  | "secure_url"
  | "width"
>;
type PublishedMomentFeedRow = Pick<
  MomentRow,
  | "cover_asset_id"
  | "description"
  | "id"
  | "location"
  | "occurred_at"
  | "published_at"
  | "slug"
  | "sort_key"
  | "title"
>;
type MomentSupabaseClient = SupabaseClient<Database>;

const PUBLIC_MOMENTS_PAGE_SIZE = 12;
const PUBLISHED_MOMENT_FEED_FIELDS =
  "id, slug, title, description, location, occurred_at, published_at, cover_asset_id, sort_key";
const MOMENT_ASSET_LIST_FIELDS =
  "id, moment_id, secure_url, alt, caption, width, height, sort_order, created_at";
const MOMENT_ASSET_INDEX_FIELDS = "id, moment_id, sort_order, created_at";
const MOMENT_ASSET_COVER_FIELDS =
  "id, moment_id, secure_url, alt, caption, width, height";

function groupAssetsByMomentId(assets: MomentAssetListRow[]) {
  return assets.reduce<Record<string, MomentAssetListRow[]>>((groups, asset) => {
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
    .select(MOMENT_ASSET_LIST_FIELDS)
    .in("moment_id", momentIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new MomentRepositoryError(error.message, error.code);
  }

  return groupAssetsByMomentId((data ?? []) as MomentAssetListRow[]);
}

async function getPublicFeedAssets(
  supabase: MomentSupabaseClient,
  moments: PublishedMomentFeedRow[]
) {
  const momentIds = moments.map((moment) => moment.id);
  if (momentIds.length === 0) {
    return {
      coversByMomentId: {} as Record<string, MomentAssetCoverRow[]>,
      photoCountsByMomentId: {} as Record<string, number>,
    };
  }

  const { data: assetIndexRows, error: assetIndexError } = await supabase
    .from("moment_media_assets")
    .select(MOMENT_ASSET_INDEX_FIELDS)
    .in("moment_id", momentIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (assetIndexError) {
    throw new MomentRepositoryError(
      assetIndexError.message,
      assetIndexError.code
    );
  }

  const assetsByMomentId = (assetIndexRows ?? []).reduce<
    Record<string, MomentAssetIndexRow[]>
  >((groups, asset) => {
    if (asset.moment_id) {
      groups[asset.moment_id] ??= [];
      groups[asset.moment_id].push(asset as MomentAssetIndexRow);
    }
    return groups;
  }, {});
  const photoCountsByMomentId = Object.fromEntries(
    momentIds.map((momentId) => [
      momentId,
      assetsByMomentId[momentId]?.length ?? 0,
    ])
  ) as Record<string, number>;
  const coverAssetIds = Array.from(
    new Set(
      moments.flatMap((moment) => {
        const fallbackAssetId = assetsByMomentId[moment.id]?.[0]?.id;
        const assetId = moment.cover_asset_id ?? fallbackAssetId;
        return assetId ? [assetId] : [];
      })
    )
  );

  if (coverAssetIds.length === 0) {
    return {
      coversByMomentId: {} as Record<string, MomentAssetCoverRow[]>,
      photoCountsByMomentId,
    };
  }

  const { data: coverRows, error: coverError } = await supabase
    .from("moment_media_assets")
    .select(MOMENT_ASSET_COVER_FIELDS)
    .in("id", coverAssetIds);

  if (coverError) {
    throw new MomentRepositoryError(coverError.message, coverError.code);
  }

  const coverById = new Map(
    ((coverRows ?? []) as MomentAssetCoverRow[]).map((asset) => [
      asset.id,
      asset,
    ])
  );
  const coversByMomentId = moments.reduce<
    Record<string, MomentAssetCoverRow[]>
  >((covers, moment) => {
    const fallbackAssetId = assetsByMomentId[moment.id]?.[0]?.id;
    const assetId = moment.cover_asset_id ?? fallbackAssetId;
    const cover = assetId ? coverById.get(assetId) : null;
    if (cover) {
      covers[moment.id] = [cover];
    }
    return covers;
  }, {});

  return { coversByMomentId, photoCountsByMomentId };
}

async function getUncachedPublishedMomentPage(
  cursorValue: string | null
): Promise<MomentFeedPage> {
  const supabase = createSupabasePublicServerClient();
  const cursor = decodeMomentCursor(cursorValue);
  let query = supabase
    .from("moments")
    .select(PUBLISHED_MOMENT_FEED_FIELDS)
    .eq("status", "published")
    .eq("visibility", "public")
    .order("sort_key", { ascending: false })
    .order("id", { ascending: false })
    .limit(PUBLIC_MOMENTS_PAGE_SIZE + 1);

  if (cursor) {
    query = query.or(createMomentCursorFilter(cursor));
  }

  const { data, error } = await query;

  if (error) {
    throw new MomentRepositoryError(error.message, error.code);
  }

  const feedRows = (data ?? []) as PublishedMomentFeedRow[];
  const hasNextPage = feedRows.length > PUBLIC_MOMENTS_PAGE_SIZE;
  const moments = feedRows.slice(0, PUBLIC_MOMENTS_PAGE_SIZE);
  const { coversByMomentId, photoCountsByMomentId } =
    await getPublicFeedAssets(supabase, moments);

  return {
    moments: moments.map((moment) =>
      mapMomentSummary(
        moment,
        coversByMomentId[moment.id] ?? [],
        photoCountsByMomentId[moment.id] ?? 0
      )
    ),
    nextCursor:
      hasNextPage && moments.length > 0
        ? encodeMomentCursor({
            id: moments[moments.length - 1].id,
            sortKey: moments[moments.length - 1].sort_key,
          })
        : null,
  };
}

/**
 * Public Moment records are independent of cookies and viewer identity, so they
 * can safely be reused across requests. Owner and studio queries stay uncached.
 */
export const getPublishedMomentPage = unstable_cache(
  getUncachedPublishedMomentPage,
  ["moments", "public", "feed", "v1"],
  {
    revalidate: PUBLIC_MOMENTS_REVALIDATE_SECONDS,
    tags: [PUBLIC_MOMENTS_CACHE_TAG],
  }
);

export async function getPublishedMomentSummaries() {
  return (await getPublishedMomentPage(null)).moments;
}

async function getUncachedPublishedMomentBySlug(slug: string) {
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

const getCachedPublishedMomentBySlug = unstable_cache(
  getUncachedPublishedMomentBySlug,
  ["moments", "public", "detail", "v1"],
  {
    revalidate: PUBLIC_MOMENTS_REVALIDATE_SECONDS,
    tags: [PUBLIC_MOMENTS_CACHE_TAG],
  }
);

export const getPublishedMomentBySlug = cache(
  getCachedPublishedMomentBySlug
);

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
