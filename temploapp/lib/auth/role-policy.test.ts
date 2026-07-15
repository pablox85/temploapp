import { describe, expect, it } from "vitest";
import { evaluateRoleChange } from "@/lib/auth/role-policy";
import { profileRoleChangeSchema } from "@/lib/validation";

const profileId = "6d3f878d-0a5b-4d9e-9d86-8d1c9340da7b";

describe("role change policy", () => {
  it("allows an admin to promote a user", () => {
    expect(evaluateRoleChange({ actorRole: "admin", targetRole: "user", newRole: "admin", adminCount: 1 }))
      .toEqual({ allowed: true, changed: true });
  });

  it("allows an admin to demote another admin when one remains", () => {
    expect(evaluateRoleChange({ actorRole: "admin", targetRole: "admin", newRole: "user", adminCount: 2 }))
      .toEqual({ allowed: true, changed: true });
  });

  it("rejects demoting the last admin", () => {
    expect(evaluateRoleChange({ actorRole: "admin", targetRole: "admin", newRole: "user", adminCount: 1 }))
      .toEqual({ allowed: false, reason: "last_admin" });
  });

  it("rejects role changes from a regular user", () => {
    expect(evaluateRoleChange({ actorRole: "user", targetRole: "user", newRole: "admin", adminCount: 1 }))
      .toEqual({ allowed: false, reason: "forbidden" });
  });

  it("rejects invalid roles through Zod", () => {
    expect(profileRoleChangeSchema.safeParse({ profileId, role: "owner" }).success).toBe(false);
  });

  it("rejects a missing profile", () => {
    expect(evaluateRoleChange({ actorRole: "admin", targetRole: null, newRole: "user", adminCount: 1 }))
      .toEqual({ allowed: false, reason: "not_found" });
  });

  it("does not request an update when the role is unchanged", () => {
    expect(evaluateRoleChange({ actorRole: "admin", targetRole: "user", newRole: "user", adminCount: 1 }))
      .toEqual({ allowed: true, changed: false });
  });
});
