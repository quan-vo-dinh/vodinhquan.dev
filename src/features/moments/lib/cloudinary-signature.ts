import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import type { getCloudinaryEnv } from "@/lib/env";

const UPLOAD_TAGS = "moments,owner-studio";

type CloudinaryEnv = ReturnType<typeof getCloudinaryEnv>;

type CloudinaryUploadParams = {
  context?: string;
  folder: string;
  public_id?: string;
  tags: string;
  timestamp: number;
};

type SignUploadParams = (
  params: CloudinaryUploadParams,
  env: CloudinaryEnv
) => string;

export const momentUploadSignatureInputSchema = z
  .object({
    context: z.string().trim().min(1).max(512).optional(),
    publicId: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[A-Za-z0-9/_-]+$/)
      .optional(),
  })
  .strict();

export type MomentUploadSignatureInput = z.infer<
  typeof momentUploadSignatureInputSchema
>;

export function buildMomentUploadSignatureParams(
  input: MomentUploadSignatureInput,
  env: CloudinaryEnv,
  now = new Date()
): CloudinaryUploadParams {
  return {
    ...(input.context ? { context: input.context } : {}),
    folder: env.cloudinaryMomentsFolder,
    ...(input.publicId ? { public_id: input.publicId } : {}),
    tags: UPLOAD_TAGS,
    timestamp: Math.floor(now.getTime() / 1000),
  };
}

function signCloudinaryUploadParams(
  params: CloudinaryUploadParams,
  env: CloudinaryEnv
) {
  return cloudinary.utils.sign_request(params, {
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    signature_algorithm: "sha256",
  }).signature;
}

export function createMomentUploadSignature(
  input: MomentUploadSignatureInput,
  env: CloudinaryEnv,
  now = new Date(),
  sign: SignUploadParams = signCloudinaryUploadParams
) {
  const params = buildMomentUploadSignatureParams(input, env, now);

  return {
    apiKey: env.cloudinaryApiKey,
    cloudName: env.cloudinaryCloudName,
    params,
    signature: sign(params, env),
  };
}
