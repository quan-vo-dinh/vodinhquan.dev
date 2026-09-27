type MomentCursor = {
  id: string;
  sortKey: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BASE64_URL_PATTERN = /^[A-Za-z0-9_-]+$/;

function isMomentCursor(value: unknown): value is MomentCursor {
  if (!value || typeof value !== "object") {
    return false;
  }

  const cursor = value as Record<string, unknown>;
  return (
    typeof cursor.id === "string" &&
    UUID_PATTERN.test(cursor.id) &&
    typeof cursor.sortKey === "string" &&
    cursor.sortKey.length <= 64 &&
    Number.isFinite(Date.parse(cursor.sortKey))
  );
}

export function encodeMomentCursor(cursor: MomentCursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeMomentCursor(value: string | undefined | null) {
  if (
    !value ||
    value.length > 512 ||
    !BASE64_URL_PATTERN.test(value)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8")
    );
    return isMomentCursor(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function createMomentCursorFilter(cursor: MomentCursor) {
  return `sort_key.lt.${cursor.sortKey},and(sort_key.eq.${cursor.sortKey},id.lt.${cursor.id})`;
}
