"use client";
import { useEffect } from 'react';
import { tokenManager } from '@/lib/tokenManager';

export default function TokenAutoRefresh() {
  useEffect(() => {
    // Khởi tạo auto refresh token khi app load
    tokenManager.initAutoRefresh();
  }, []);

  return null;
}
