import { describe, expect, it } from "vitest";

import {
  createMomentCursorFilter,
  decodeMomentCursor,
  encodeMomentCursor,
} from "./moment-cursor";

const cursor = {
  id: "9c1097f0-bef9-4f85-94d4-9a16c1c53f3e",
  sortKey: "2026-09-24T10:30:00.000Z",
};

describe("Moment cursor", () => {
  it("round-trips a validated cursor", () => {
    expect(decodeMomentCursor(encodeMomentCursor(cursor))).toEqual(cursor);
  });

  it("rejects malformed cursor input before it reaches a PostgREST filter", () => {
    expect(decodeMomentCursor("not-a-cursor")).toBeNull();
  });

  it("uses timestamp and id as the keyset boundary", () => {
    expect(createMomentCursorFilter(cursor)).toBe(
      "sort_key.lt.2026-09-24T10:30:00.000Z,and(sort_key.eq.2026-09-24T10:30:00.000Z,id.lt.9c1097f0-bef9-4f85-94d4-9a16c1c53f3e)"
    );
  });
});
