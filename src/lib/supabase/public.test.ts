import { beforeEach, describe, expect, it, vi } from "vitest";

const createClient = vi.fn(() => ({}));

vi.mock("server-only", () => ({}));

vi.mock("@supabase/supabase-js", () => ({
  createClient,
}));

vi.mock("@/lib/env", () => ({
  getServerEnv: () => ({
    supabasePublishableKey: "publishable-key",
    supabaseUrl: "https://example.supabase.co",
  }),
}));

describe("createSupabasePublicServerClient", () => {
  beforeEach(() => {
    createClient.mockClear();
  });

  it("creates an anonymous server client without session persistence", async () => {
    const { createSupabasePublicServerClient } = await import("./public");

    createSupabasePublicServerClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "publishable-key",
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      }
    );
  });
});
