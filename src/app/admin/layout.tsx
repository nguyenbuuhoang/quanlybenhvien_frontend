import type React from "react";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminContent } from "@/components/admin/admin-content";
import AdminAuthGuard from "./AdminAuthGuard";
import AdminRoleGuard from "./AdminRoleGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthGuard>
      <AdminRoleGuard>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <AdminContent>{children}</AdminContent>
        </div>
      </AdminRoleGuard>
    </AdminAuthGuard>
  )
}
