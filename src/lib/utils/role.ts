import type { UserRole } from "@/types/domain";

export function getRoleDashboardUrl(role: UserRole | string | null | undefined): string {
  switch (role) {
    case "superadministrator":
      return "/admin/dashboard";
    case "talent":
      return "/talent/dashboard";
    case "student":
    default:
      return "/student/dashboard";
  }
}

export function getRoleLabel(role: UserRole | string | null | undefined): string {
  switch (role) {
    case "superadministrator":
      return "Super Administrator";
    case "talent":
      return "Talent / Mentor";
    case "student":
      return "Student";
    default:
      return "Pengguna";
  }
}

export function getRoleBadgeColor(role: UserRole | string | null | undefined): "primary" | "secondary" | "default" | "error" {
  switch (role) {
    case "superadministrator":
      return "error";
    case "talent":
      return "secondary";
    case "student":
      return "primary";
    default:
      return "default";
  }
}

export function hasRole(roles: (string | UserRole)[] | undefined, targetRole: UserRole): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.includes(targetRole);
}
