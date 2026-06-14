export type MomentAssetView = {
  alt: string | null;
  caption: string | null;
  height: number | null;
  id: string;
  secureUrl: string;
  width: number | null;
};

export type MomentSummaryView = {
  cover: MomentAssetView | null;
  description: string | null;
  location: string | null;
  occurredAt: string | null;
  photoCount: number;
  publishedAt: string | null;
  slug: string;
  title: string;
};

export type MomentDetailView = MomentSummaryView & {
  assets: MomentAssetView[];
  id: string;
  noteMarkdown: string | null;
};

export type OwnerMomentView = MomentDetailView & {
  coverAssetId: string | null;
  status: "draft" | "published" | "archived";
  visibility: "public" | "private";
};
