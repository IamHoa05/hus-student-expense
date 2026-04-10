"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

// Hàm lấy chữ cái đầu (giữ nguyên)
const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default function TopBar() {
  const userName = "A";

  // 1. Khởi tạo state cho số lượng thông báo
  const [notiCount, setNotiCount] = useState<number>(0);

  // 2. useEffect để gọi API khi component mount
  useEffect(() => {
    const fetchNotiCount = async () => {
      try {
        // Thay url này bằng endpoint thật của bạn
        const response = await fetch("/api/notifications/count");
        const data = await response.json();

        // Giả sử API trả về { count: 5 }
        setNotiCount(data.count || 0);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
        setNotiCount(0); // Mặc định về 0 nếu lỗi
      }
    };

    fetchNotiCount();

    // Nếu muốn cập nhật liên tục, bạn có thể dùng setInterval ở đây
  }, []);

  return (
    <nav className="w-full sticky top-0 z-40 bg-[#f9f9fe]/90 backdrop-blur-md flex justify-between items-center py-4 mb-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e0e2f1] flex items-center justify-center border-2 border-[#dde1ff] hover:scale-105 transition-transform active:scale-95 shadow-sm">
          <span className="text-sm font-black font-headline text-[#4b5b9a]">
            {getInitials(userName)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[#94A3E8] font-headline font-extrabold text-lg tracking-tight leading-none">
            Chào, {userName}
          </span>
          {/* <span className="text-[10px] text-[#767681] font-bold uppercase tracking-widest mt-0.5">
            TIÊU TỈNH
          </span> */}
        </div>
      </div>

      <Link
        href="/notifications"
        className="relative text-[#94A3E8] hover:text-[#4b5b9a] transition-colors p-2 active:scale-95 duration-200"
      >
        <span className="material-symbols-outlined text-2xl block">
          notifications
        </span>

        {/* 3. Chỉ hiển thị Badge nếu số lượng thông báo > 0 */}
        {notiCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#f9f9fe] shadow-sm z-10 animate-in zoom-in duration-300">
            {notiCount > 99 ? "99+" : notiCount}
          </span>
        )}
      </Link>
    </nav>
  );
}
