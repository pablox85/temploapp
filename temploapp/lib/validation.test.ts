import { describe, expect, it } from "vitest";
import { tenantIdSchema } from "@/lib/validation";

describe("tenantIdSchema", () => {
  it("accepts the seeded PostgreSQL tenant UUID", () => {
    expect(
      tenantIdSchema.safeParse("00000000-0000-0000-0000-000000000001")
        .success,
    ).toBe(true);
  });

  it("accepts generated RFC UUIDs", () => {
    expect(
      tenantIdSchema.safeParse("38cb75b8-4f59-4434-8a11-b87cfc3f41cf")
        .success,
    ).toBe(true);
  });

  it("rejects malformed tenant identifiers", () => {
    expect(tenantIdSchema.safeParse("not-a-uuid").success).toBe(false);
  });
});
