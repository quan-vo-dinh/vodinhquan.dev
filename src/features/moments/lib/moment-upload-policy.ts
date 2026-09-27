export const MOMENT_UPLOAD_ACCEPTED_TYPES = [
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MOMENT_UPLOAD_ALLOWED_FORMATS = [
  "avif",
  "jpeg",
  "jpg",
  "png",
  "webp",
] as const;

export const MOMENT_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const MOMENT_UPLOAD_MAX_FILES = 12;
export const MOMENT_UPLOAD_CONCURRENCY = 3;

export type MomentUploadFileLike = {
  size: number;
  type: string;
};

export type MomentUploadFileError = "file-too-large" | "unsupported-file-type";

export function getMomentUploadFileError(
  file: MomentUploadFileLike
): MomentUploadFileError | null {
  if (!MOMENT_UPLOAD_ACCEPTED_TYPES.includes(file.type as never)) {
    return "unsupported-file-type";
  }

  if (file.size > MOMENT_UPLOAD_MAX_BYTES) {
    return "file-too-large";
  }

  return null;
}

export function isAllowedMomentUploadFormat(format: string) {
  return MOMENT_UPLOAD_ALLOWED_FORMATS.includes(
    format.toLowerCase() as never
  );
}
