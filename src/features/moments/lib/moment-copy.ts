import type { Dictionary } from "@/i18n/dictionaries";

export function formatPhotoCount(
  count: number,
  common: Dictionary["common"],
) {
  const label = count === 1 ? common.photo : common.photos;

  return `${count} ${label}`;
}
