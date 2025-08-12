"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/userApi";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Loading";
import { logout } from "@/lib/auth";
  const handleLogout = () => {
    logout();
  };
export default function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkRole() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError("Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.");
        } else if (user.role !== "admin") {
          setError("Bạn không có quyền truy cập vào trang quản trị. Chỉ quản trị viên mới có thể truy cập.");
        } else {
          setHasAccess(true);
        }
      } catch (err) {
        console.error("Error checking role:", err);
        setError("Có lỗi xảy ra khi kiểm tra quyền truy cập. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
    checkRole();
  }, []);

  if (loading) {
    return <Loading message="Đang kiểm tra quyền truy cập..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link href="/">Về trang chủ</Link>
              </Button>
              <Button onClick={handleLogout}>Đăng xuất</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}
