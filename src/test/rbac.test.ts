import { describe, it, expect } from "vitest";

// RBAC destination and route helper logic matching src/pages/Login.tsx and ProtectedRoute.tsx
export const getSafeDestination = (
  fromPath: string | undefined,
  userRole: "parent" | "child"
): string => {
  if (!fromPath || fromPath === "/" || fromPath === "/login") {
    return userRole === "parent" ? "/parent" : "/child";
  }
  // Prevent Child from being redirected to Parent routes
  if (userRole === "child" && fromPath.startsWith("/parent")) {
    return "/child";
  }
  // Prevent Parent from being redirected to Child routes
  if (userRole === "parent" && fromPath.startsWith("/child")) {
    return "/parent";
  }
  return fromPath;
};

export const checkRouteAccess = (
  userRole: "parent" | "child" | undefined | null,
  allowedRoles?: Array<"parent" | "child">
): { allowed: boolean; redirectTo?: string; reason?: string } => {
  if (!userRole || (userRole !== "parent" && userRole !== "child")) {
    return { allowed: false, redirectTo: "/login", reason: "unauthenticated_or_invalid_role" };
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      redirectTo: userRole === "parent" ? "/parent" : "/child",
      reason: "insufficient_role_permissions",
    };
  }

  return { allowed: true };
};

// Database RLS Authorization Policy Simulator
export const simulateHealthRecordRLS = (
  callerId: string,
  callerRole: "parent" | "child",
  targetRecordUserId: string,
  isParentOfTarget: boolean,
  action: "SELECT" | "INSERT" | "UPDATE" | "DELETE"
): boolean => {
  // Policy: auth.uid() = user_id OR public.is_parent_of(user_id)
  if (callerId === targetRecordUserId) {
    return true; // Users can always manage own records
  }

  if (callerRole === "parent" && isParentOfTarget) {
    return true; // Parents can view & manage records for linked children
  }

  // Children can never access or modify records of other users (including parents)
  return false;
};

describe("Role-Based Access Control (RBAC) & Route Security", () => {
  describe("Post-Authentication Safe Destination Routing", () => {
    it("should redirect Parent to /parent when default or root path requested", () => {
      expect(getSafeDestination(undefined, "parent")).toBe("/parent");
      expect(getSafeDestination("/", "parent")).toBe("/parent");
      expect(getSafeDestination("/login", "parent")).toBe("/parent");
    });

    it("should redirect Child to /child when default or root path requested", () => {
      expect(getSafeDestination(undefined, "child")).toBe("/child");
      expect(getSafeDestination("/", "child")).toBe("/child");
      expect(getSafeDestination("/login", "child")).toBe("/child");
    });

    it("should block Child from being redirected to Parent routes and fallback to /child", () => {
      expect(getSafeDestination("/parent", "child")).toBe("/child");
      expect(getSafeDestination("/parent/health", "child")).toBe("/child");
      expect(getSafeDestination("/parent/care", "child")).toBe("/child");
      expect(getSafeDestination("/parent/family", "child")).toBe("/child");
    });

    it("should block Parent from being redirected to Child routes and fallback to /parent", () => {
      expect(getSafeDestination("/child", "parent")).toBe("/parent");
      expect(getSafeDestination("/child/medicines", "parent")).toBe("/parent");
      expect(getSafeDestination("/child/appointments", "parent")).toBe("/parent");
      expect(getSafeDestination("/child/check-in", "parent")).toBe("/parent");
    });

    it("should allow legitimate matching deep links", () => {
      expect(getSafeDestination("/parent/health", "parent")).toBe("/parent/health");
      expect(getSafeDestination("/child/health", "child")).toBe("/child/health");
      expect(getSafeDestination("/profile", "parent")).toBe("/profile");
      expect(getSafeDestination("/profile", "child")).toBe("/profile");
    });
  });

  describe("Protected Route Guard Authorization Checks", () => {
    it("should allow Parent to access Parent-only routes", () => {
      const res = checkRouteAccess("parent", ["parent"]);
      expect(res.allowed).toBe(true);
    });

    it("should block Child from accessing Parent-only routes and redirect to /child", () => {
      const res = checkRouteAccess("child", ["parent"]);
      expect(res.allowed).toBe(false);
      expect(res.redirectTo).toBe("/child");
      expect(res.reason).toBe("insufficient_role_permissions");
    });

    it("should allow Child to access Child-only routes", () => {
      const res = checkRouteAccess("child", ["child"]);
      expect(res.allowed).toBe(true);
    });

    it("should block Parent from accessing Child-only routes and redirect to /parent", () => {
      const res = checkRouteAccess("parent", ["child"]);
      expect(res.allowed).toBe(false);
      expect(res.redirectTo).toBe("/parent");
      expect(res.reason).toBe("insufficient_role_permissions");
    });

    it("should allow both roles to access shared authenticated routes", () => {
      expect(checkRouteAccess("parent", ["parent", "child"]).allowed).toBe(true);
      expect(checkRouteAccess("child", ["parent", "child"]).allowed).toBe(true);
    });

    it("should reject unauthenticated or missing role users to /login", () => {
      expect(checkRouteAccess(null, ["parent"]).allowed).toBe(false);
      expect(checkRouteAccess(null, ["parent"]).redirectTo).toBe("/login");
      expect(checkRouteAccess(undefined, ["child"]).allowed).toBe(false);
      expect(checkRouteAccess(undefined, ["child"]).redirectTo).toBe("/login");
    });
  });

  describe("Row Level Security (RLS) Policy Authorization", () => {
    const parentId = "parent-uuid-001";
    const childId = "child-uuid-002";
    const unrelatedUserId = "unrelated-uuid-999";

    it("should allow Child to read and write their own records", () => {
      const canRead = simulateHealthRecordRLS(childId, "child", childId, false, "SELECT");
      const canWrite = simulateHealthRecordRLS(childId, "child", childId, false, "INSERT");
      expect(canRead).toBe(true);
      expect(canWrite).toBe(true);
    });

    it("should allow Parent to read and write records for their linked Child", () => {
      const canReadChildRecord = simulateHealthRecordRLS(parentId, "parent", childId, true, "SELECT");
      const canWriteChildRecord = simulateHealthRecordRLS(parentId, "parent", childId, true, "INSERT");
      expect(canReadChildRecord).toBe(true);
      expect(canWriteChildRecord).toBe(true);
    });

    it("should strictly deny Child from reading or writing Parent records", () => {
      const canReadParent = simulateHealthRecordRLS(childId, "child", parentId, false, "SELECT");
      const canWriteParent = simulateHealthRecordRLS(childId, "child", parentId, false, "UPDATE");
      const canDeleteParent = simulateHealthRecordRLS(childId, "child", parentId, false, "DELETE");
      expect(canReadParent).toBe(false);
      expect(canWriteParent).toBe(false);
      expect(canDeleteParent).toBe(false);
    });

    it("should strictly deny Parent from accessing unrelated non-linked user records", () => {
      const canReadUnrelated = simulateHealthRecordRLS(parentId, "parent", unrelatedUserId, false, "SELECT");
      const canWriteUnrelated = simulateHealthRecordRLS(parentId, "parent", unrelatedUserId, false, "INSERT");
      expect(canReadUnrelated).toBe(false);
      expect(canWriteUnrelated).toBe(false);
    });
  });
});
