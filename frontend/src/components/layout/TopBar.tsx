"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Hàm lấy chữ cái đầu cho Avatar
const getInitials = (name: string) => {
  if (!name) return "U"; // Mặc định nếu chưa load kịp
  const names = name.split(" ");
  if (names.length >= 2) {
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default function TopBar() {
  // 1. Thay vì gán tĩnh, dùng state để lưu tên người dùng
  const [userName, setUserName] = useState<string>("...");
  const [notiCount, setNotiCount] = useState<number>(0);

  // 2. useEffect gọi API lấy cả thông báo lẫn thông tin user
  useEffect(() => {
    // API Lấy số thông báo
    const fetchNotiCount = async () => {
      try {
        // Tạm comment API thông báo để tránh gọi service không cần thiết
        // const response = await fetch("/api/notifications/count");
        // if (response.ok) {
        //   const data = await response.json();
        //   setNotiCount(data.count || 0);
        // }
        // Đặt mặc định 0
        setNotiCount(0);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };

    // API Lấy thông tin user đăng nhập
    const fetchUserInfo = async () => {
      try {
        // GỌI API BACKEND: Đổi "/users/me" thành endpoint thực tế của bạn
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // Rất quan trọng để đính kèm Cookie Token xác thực
        });

        if (response.ok) {
          const data = await response.json();

          // Giả sử API trả về data.full_name = "Chu Thị Mỹ Duyên"
          const fullName = data.full_name || data.name || "Người dùng";

          // Logic tách chữ cuối cùng làm tên hiển thị cho gọn (vd: "Duyên")
          const nameParts = fullName.trim().split(" ");
          const shortName = nameParts[nameParts.length - 1];

          setUserName(shortName);
        } else {
          setUserName("Khách");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
        setUserName("Khách");
      }
    };

    fetchNotiCount();
    fetchUserInfo();
  }, []);

  return (
    <nav className="w-full sticky top-0 z-40 bg-[#f9f9fe]/90 backdrop-blur-md flex justify-between items-center py-4 mb-2">
      <div className="flex items-center gap-3">
        {/* Link bọc ngoài Avatar để chuyển hướng */}
        {/* <Link href="/profile" className="block"> */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e0e2f1] flex items-center justify-center border-2 border-[#dde1ff] hover:scale-105 transition-transform active:scale-95 shadow-sm">
          <span className="text-sm font-black font-headline text-[#4b5b9a]">
            {getInitials(userName)}
          </span>
        </div>
        {/* </Link> */}

        <div className="flex flex-col">
          <span className="text-[#94A3E8] font-headline font-extrabold text-lg tracking-tight leading-none">
            Chào, {userName}
          </span>
          {/* Subtitle "TIÊU TỈNH" đang được comment lại từ giao diện bản 2 */}
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

        {/* Chỉ hiển thị Badge nếu số lượng thông báo > 0 */}
        {notiCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#f9f9fe] shadow-sm z-10 animate-in zoom-in duration-300">
            {notiCount > 99 ? "99+" : notiCount}
          </span>
        )}
      </Link>
    </nav>
  );
}
