import "server-only";

import { v2 as cloudinary } from "cloudinary";

import type { getCloudinaryEnv } from "@/lib/env";

import {
  cloudinaryUploadResultSchema,
  type CloudinaryUploadResult,
} from "./moment-schema";
import {
  MOMENT_UPLOAD_MAX_BYTES,
  isAllowedMomentUploadFormat,
} from "./moment-upload-policy";

type CloudinaryEnv = ReturnType<typeof getCloudinaryEnv>;
type CloudinaryResourceReader = (publicId: string) => Promise<unknown>;

function configureCloudinary(env: CloudinaryEnv) {
  cloudinary.config({
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    cloud_name: env.cloudinaryCloudName,
    secure: true,
  });
}

function normalizeFolder(folder: string) {
  return folder.replace(/^\/+|\/+$/g, "");
}

export function isMomentCloudinaryPublicId(
  publicId: string,
  momentsFolder: string
) {
  const folder = normalizeFolder(momentsFolder);

  return publicId === folder || publicId.startsWith(`${folder}/`);
}

function assertMomentUploadPolicy(upload: CloudinaryUploadResult) {
  if (upload.resource_type !== "image") {
    throw new Error("Moment uploads must be images.");
  }

  if (!isAllowedMomentUploadFormat(upload.format)) {
    throw new Error("Moment upload format is not allowed.");
  }

  if (upload.bytes > MOMENT_UPLOAD_MAX_BYTES) {
    throw new Error("Moment upload exceeds the byte limit.");
  }
}

function getVerifiedUpload(
  resource: unknown,
  originalFilename?: string
): CloudinaryUploadResult {
  const parsed = cloudinaryUploadResultSchema.parse(resource);

  if (
    !resource ||
    typeof resource !== "object" ||
    ("type" in resource && resource.type !== "upload")
  ) {
    throw new Error("Cloudinary resource is not an upload asset.");
  }

  return {
    ...parsed,
    ...(originalFilename ? { original_filename: originalFilename } : {}),
  };
}

export async function verifyMomentCloudinaryUpload(
  value: unknown,
  {
    env,
    readResource,
  }: {
    env: CloudinaryEnv;
    readResource?: CloudinaryResourceReader;
  }
): Promise<CloudinaryUploadResult> {
  const submittedUpload = cloudinaryUploadResultSchema.parse(value);
  const reader =
    readResource ??
    (async (publicId: string) => {
      configureCloudinary(env);
      return cloudinary.api.resource(publicId, { resource_type: "image" });
    });
  const resource = await reader(submittedUpload.public_id);
  const verifiedUpload = getVerifiedUpload(
    resource,
    submittedUpload.original_filename
  );

  if (!isMomentCloudinaryPublicId(verifiedUpload.public_id, env.cloudinaryMomentsFolder)) {
    throw new Error("Cloudinary asset is outside the Moments folder.");
  }

  if (verifiedUpload.public_id !== submittedUpload.public_id) {
    throw new Error("Cloudinary public ID did not match the submitted upload.");
  }

  if (
    submittedUpload.asset_id &&
    verifiedUpload.asset_id !== submittedUpload.asset_id
  ) {
    throw new Error("Cloudinary asset ID did not match the submitted upload.");
  }

  assertMomentUploadPolicy(verifiedUpload);
  return verifiedUpload;
}

export async function destroyMomentCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "raw" | "video"
) {
  const { getCloudinaryEnv } = await import("@/lib/env");
  configureCloudinary(getCloudinaryEnv());

  return cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: resourceType,
  });
}
