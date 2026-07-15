import type { AppRole } from "@/lib/types/database";

export type RoleChangeDecision =
  | { allowed: true; changed: boolean }
  | { allowed: false; reason: "forbidden" | "not_found" | "last_admin" };

export function evaluateRoleChange({
  actorRole,
  targetRole,
  newRole,
  adminCount,
}: {
  actorRole: AppRole | null;
  targetRole: AppRole | null;
  newRole: AppRole;
  adminCount: number;
}): RoleChangeDecision {
  if (actorRole !== "admin") return { allowed: false, reason: "forbidden" };
  if (!targetRole) return { allowed: false, reason: "not_found" };
  if (targetRole === newRole) return { allowed: true, changed: false };
  if (targetRole === "admin" && newRole === "user" && adminCount <= 1) {
    return { allowed: false, reason: "last_admin" };
  }
  return { allowed: true, changed: true };
}
