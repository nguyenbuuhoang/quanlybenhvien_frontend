"use client";

import { useEffect, useState } from "react";
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSlider from "@/components/hero-slider"
import { getCurrentUser } from "@/lib/userApi";
import { isAuthenticated, logout } from "@/lib/auth";
import { User, Settings, LogOut } from "lucide-react";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsAuth(authStatus);
      
      if (authStatus) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/90 backdrop-blur shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between px-4 py-2 gap-2">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Image
              src="/images/logo.png"
              alt="Logo bệnh viện"
              width={48}
              height={48}
              className="rounded-full border shadow-md bg-white p-1"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-primary tracking-wide">Bệnh viện Mắt-TMH-RHM AN GIANG</span>
              <span className="text-xs sm:text-sm text-muted-foreground">Kỹ thuật cao - chất lượng cao - hiệu quả cao</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 mt-2 sm:mt-0">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Trang chủ</Link>
            <Link href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Giới thiệu</Link>
            <Link href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Liên hệ</Link>
            
            {isAuth && user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Xin chào, <strong>{user.fullname}</strong></span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login">Đăng nhập</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Slider */}
      <HeroSlider />
    </main>
  )
}
