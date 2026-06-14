import type {
  MomentAssetView,
  MomentDetailView,
  MomentSummaryView,
  OwnerMomentView,
} from "../types";

type MomentLike = {
  cover_asset_id: string | null;
  description: string | null;
  id: string;
  location: string | null;
  note_markdown?: string | null;
  occurred_at: string | null;
  published_at: string | null;
  slug: string;
  status?: "draft" | "published" | "archived";
  title: string;
  visibility?: "public" | "private";
};

type AssetLike = {
  alt: string | null;
  caption: string | null;
  height: number | null;
  id: string;
  secure_url: string;
  width: number | null;
};

export function mapMomentAsset(asset: AssetLike): MomentAssetView {
  return {
    alt: asset.alt,
    caption: asset.caption,
    height: asset.height,
    id: asset.id,
    secureUrl: asset.secure_url,
    width: asset.width,
  };
}

export function mapMomentSummary(
  moment: Omit<MomentLike, "note_markdown">,
  assets: AssetLike[]
): MomentSummaryView {
  const mappedAssets = assets.map(mapMomentAsset);
  const cover =
    mappedAssets.find((asset) => asset.id === moment.cover_asset_id) ??
    mappedAssets[0] ??
    null;

  return {
    cover,
    description: moment.description,
    location: moment.location,
    occurredAt: moment.occurred_at,
    photoCount: mappedAssets.length,
    publishedAt: moment.published_at,
    slug: moment.slug,
    title: moment.title,
  };
}

export function mapMomentDetail(
  moment: MomentLike,
  assets: AssetLike[]
): MomentDetailView {
  return {
    ...mapMomentSummary(moment, assets),
    assets: assets.map(mapMomentAsset),
    id: moment.id,
    noteMarkdown: moment.note_markdown ?? null,
  };
}

export function mapOwnerMoment(
  moment: Required<Pick<MomentLike, "status" | "visibility">> & MomentLike,
  assets: AssetLike[]
): OwnerMomentView {
  return {
    ...mapMomentDetail(moment, assets),
    coverAssetId: moment.cover_asset_id,
    status: moment.status,
    visibility: moment.visibility,
  };
}
