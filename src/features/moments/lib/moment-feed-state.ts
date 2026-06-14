import type {
  MomentDetailView,
  MomentSummaryView,
  OwnerMomentView,
} from "../types";
import { isMomentsSchemaMissing } from "./moment-repository-error";

export type MomentFeedState =
  | {
      moments: MomentSummaryView[];
      status: "ready";
    }
  | {
      moments: [];
      status: "unavailable";
    };

export async function loadMomentFeedState(
  loadMoments: () => Promise<MomentSummaryView[]>
): Promise<MomentFeedState> {
  try {
    return {
      moments: await loadMoments(),
      status: "ready",
    };
  } catch {
    return {
      moments: [],
      status: "unavailable",
    };
  }
}

export type MomentDetailState =
  | {
      moment: MomentDetailView;
      status: "ready";
    }
  | {
      moment: null;
      status: "not-found";
    }
  | {
      moment: null;
      status: "unavailable";
    };

export async function loadMomentDetailState(
  loadMoment: () => Promise<MomentDetailView | null>
): Promise<MomentDetailState> {
  try {
    const moment = await loadMoment();

    return moment
      ? { moment, status: "ready" }
      : { moment: null, status: "not-found" };
  } catch {
    return {
      moment: null,
      status: "unavailable",
    };
  }
}

export type OwnerMomentFeedState =
  | {
      moments: OwnerMomentView[];
      status: "ready";
    }
  | {
      moments: [];
      status: "setup-required" | "unavailable";
    };

export async function loadOwnerMomentFeedState(
  loadMoments: () => Promise<OwnerMomentView[]>
): Promise<OwnerMomentFeedState> {
  try {
    return {
      moments: await loadMoments(),
      status: "ready",
    };
  } catch (error) {
    return {
      moments: [],
      status: isMomentsSchemaMissing(error)
        ? "setup-required"
        : "unavailable",
    };
  }
}
