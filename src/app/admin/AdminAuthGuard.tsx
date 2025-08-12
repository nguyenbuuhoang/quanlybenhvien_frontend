"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Loading from "@/components/Loading";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      if (!authStatus) {
        router.replace("/login");
      } else {
        setAuthenticated(true);
      }
      setIsChecking(false);
    };

    //Delay để đảm bảo localStorage có sẵn
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (isChecking) {
    return <Loading message="Đang kiểm tra xác thực..." />;
  }

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
