import { z } from "zod";

const serverEnvSchema = z.object({
  appOrigin: z.string().url(),
  isDevelopment: z.boolean(),
  siteOwnerGitHubUsername: z.string().trim().min(1),
  supabasePublishableKey: z.string().trim().min(1),
  supabaseUrl: z.string().url(),
});

const cloudinaryEnvSchema = z.object({
  cloudinaryApiKey: z.string().trim().min(1),
  cloudinaryApiSecret: z.string().trim().min(1),
  cloudinaryCloudName: z.string().trim().min(1),
  cloudinaryMomentsFolder: z.string().trim().min(1),
});

const mediaCleanupWorkerEnvSchema = z.object({
  supabaseServiceRoleKey: z.string().trim().min(1),
});

const mediaCleanupEndpointEnvSchema = z.object({
  mediaCleanupSecret: z.string().trim().min(32),
});

type EnvInput = Record<string, string | undefined>;

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;
let cachedCloudinaryEnv: z.infer<typeof cloudinaryEnvSchema> | null = null;
let cachedMediaCleanupWorkerEnv: z.infer<
  typeof mediaCleanupWorkerEnvSchema
> | null = null;
let cachedMediaCleanupEndpointEnv: z.infer<
  typeof mediaCleanupEndpointEnvSchema
> | null = null;

function parseCloudinaryUrl(cloudinaryUrl: string | undefined) {
  if (!cloudinaryUrl) {
    return null;
  }

  const parsed = new URL(cloudinaryUrl);

  if (parsed.protocol !== "cloudinary:") {
    throw new Error("CLOUDINARY_URL must use the cloudinary:// protocol");
  }

  return {
    apiKey: decodeURIComponent(parsed.username),
    apiSecret: decodeURIComponent(parsed.password),
    cloudName: parsed.hostname,
  };
}

export function parseServerEnv(input: EnvInput) {
  const siteOwnerGitHubUsername =
    input.SITE_OWNER_GITHUB_USERNAME ??
    input.INTERVIEW_OWNER_GITHUB_USERNAME ??
    "site-owner";

  return serverEnvSchema.parse({
    appOrigin: input.APP_ORIGIN ?? "https://vodinhquan.dev",
    isDevelopment: input.NODE_ENV === "development",
    siteOwnerGitHubUsername,
    supabasePublishableKey: input.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    supabaseUrl: input.NEXT_PUBLIC_SUPABASE_URL,
  });
}

export function parseCloudinaryEnv(input: EnvInput) {
  const urlConfig = parseCloudinaryUrl(input.CLOUDINARY_URL);

  return cloudinaryEnvSchema.parse({
    cloudinaryApiKey: input.CLOUDINARY_API_KEY ?? urlConfig?.apiKey,
    cloudinaryApiSecret:
      input.CLOUDINARY_API_SECRET ?? urlConfig?.apiSecret,
    cloudinaryCloudName:
      input.CLOUDINARY_CLOUD_NAME ?? urlConfig?.cloudName,
    cloudinaryMomentsFolder:
      input.CLOUDINARY_MOMENTS_FOLDER ?? "moments",
  });
}

export function parseMediaCleanupWorkerEnv(input: EnvInput) {
  return mediaCleanupWorkerEnvSchema.parse({
    supabaseServiceRoleKey: input.SUPABASE_SERVICE_ROLE_KEY,
  });
}

export function parseMediaCleanupEndpointEnv(input: EnvInput) {
  return mediaCleanupEndpointEnvSchema.parse({
    mediaCleanupSecret: input.MEDIA_CLEANUP_SECRET,
  });
}

export function getServerEnv() {
  cachedServerEnv ??= parseServerEnv(process.env);
  return cachedServerEnv;
}

export function getCloudinaryEnv() {
  cachedCloudinaryEnv ??= parseCloudinaryEnv(process.env);
  return cachedCloudinaryEnv;
}

export function getMediaCleanupWorkerEnv() {
  cachedMediaCleanupWorkerEnv ??= parseMediaCleanupWorkerEnv(process.env);
  return cachedMediaCleanupWorkerEnv;
}

export function getMediaCleanupEndpointEnv() {
  cachedMediaCleanupEndpointEnv ??= parseMediaCleanupEndpointEnv(process.env);
  return cachedMediaCleanupEndpointEnv;
}
