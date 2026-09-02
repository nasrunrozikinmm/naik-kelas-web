import React from "react";
import AuthGuard from "@/components/auth/AuthGuard";

export default function TalentDashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard allowedRoles={["talent", "superadministrator"]}>{children}</AuthGuard>;
}

