import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["student", "superadministrator"]}>{children}</AuthGuard>;
}

