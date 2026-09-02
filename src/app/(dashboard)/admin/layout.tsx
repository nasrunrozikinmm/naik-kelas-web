import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["superadministrator"]}>{children}</AuthGuard>;
}

