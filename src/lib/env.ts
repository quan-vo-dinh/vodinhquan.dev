import { z } from "zod";

const serverEnvSchema = z.object({
  appOrigin: z.string().url(),
  interviewOwnerGitHubUsername: z.string().trim().min(1),
  isDevelopment: z.boolean(),
  supabasePublishableKey: z.string().trim().min(1),
  supabaseUrl: z.string().url(),
});

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  cachedServerEnv ??= serverEnvSchema.parse({
    appOrigin: process.env.APP_ORIGIN ?? "https://vodinhquan.dev",
    interviewOwnerGitHubUsername:
      process.env.INTERVIEW_OWNER_GITHUB_USERNAME ?? "vodinhquan",
    isDevelopment: process.env.NODE_ENV === "development",
    supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  return cachedServerEnv;
}
