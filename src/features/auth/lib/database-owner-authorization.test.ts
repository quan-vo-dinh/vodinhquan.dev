import { describe, expect, it, vi } from "vitest";

import { checkDatabaseOwner } from "./database-owner-authorization";

describe("database owner authorization", () => {
  it("uses the site owner predicate when it is available", async () => {
    const callOwnerRpc = vi.fn().mockResolvedValue({
      data: true,
      error: null,
    });

    await expect(checkDatabaseOwner(callOwnerRpc)).resolves.toBe(true);
    expect(callOwnerRpc).toHaveBeenCalledOnce();
    expect(callOwnerRpc).toHaveBeenCalledWith("is_site_owner");
  });

  it("falls back to the legacy owner predicate when the new RPC is missing", async () => {
    const callOwnerRpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: null,
        error: { code: "PGRST202" },
      })
      .mockResolvedValueOnce({
        data: true,
        error: null,
      });

    await expect(checkDatabaseOwner(callOwnerRpc)).resolves.toBe(true);
    expect(callOwnerRpc).toHaveBeenNthCalledWith(1, "is_site_owner");
    expect(callOwnerRpc).toHaveBeenNthCalledWith(2, "is_owner");
  });

  it("does not bypass unexpected database errors", async () => {
    const callOwnerRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "42501" },
    });

    await expect(checkDatabaseOwner(callOwnerRpc)).resolves.toBe(false);
    expect(callOwnerRpc).toHaveBeenCalledOnce();
  });
});
