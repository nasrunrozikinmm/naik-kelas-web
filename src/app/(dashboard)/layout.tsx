import { DashboardShell } from "@/components/DashboardShell";
import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
