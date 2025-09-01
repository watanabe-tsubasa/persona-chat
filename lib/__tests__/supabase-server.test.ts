// File: lib/__tests__/supabase-server.test.ts
// Role: Tests Supabase server client construction (service role)
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn(() => ({ mocked: true }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}));

describe("lib/supabase-server", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  it("creates server client with service role and edge-friendly options", async () => {
    const { supabaseServer } = await import("../supabase-server");
    const client = supabaseServer();

    expect(client).toEqual({ mocked: true });
    expect(createClientMock).toHaveBeenCalledTimes(1);
    const [url, key, opts] = createClientMock.mock.calls[0];
    expect(url).toBe("https://example.supabase.co");
    expect(key).toBe("service-role-key");
    expect(opts).toMatchObject({
      auth: { persistSession: false },
      global: { fetch: expect.any(Function) },
    });
  });
});
