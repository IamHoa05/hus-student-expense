"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Avatar lấy 2 chữ giống profile
const getInitials = (name: string) => {
  if (!name.trim()) return "U";

  const names = name.trim().split(" ");

  return names.length >= 2
    ? (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    : name.charAt(0).toUpperCase();
};

export default function TopBar() {
  const [userName, setUserName] = useState("...");
  const [notiCount, setNotiCount] = useState(0);
  // 1. THÊM STATE QUẢN LÝ ẢNH ĐẠI DIỆN
  const [avtUrl, setAvtUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotiCount = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setNotiCount(data.unread_count || 0);
        }
      } catch (error) {
        console.error("Lỗi khi lấy đếm thông báo:", error);
      }
    };

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // lấy full name luôn
          const fullName = data.full_name || data.name || "Người dùng";
          setUserName(fullName);

          // 2. LẤY LINK ẢNH VÀ BỎ QUA CHỮ "string" MẶC ĐỊNH
          if (data.avt_url && data.avt_url !== "string") {
            setAvtUrl(data.avt_url);
          } else {
            setAvtUrl(null);
          }
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
      {/* GẮN LINK SANG TRANG PROFILE TẠI ĐÂY */}
      <Link
        href="/profile"
        className="flex items-center gap-3 group active:scale-95 transition-all outline-none"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e0e2f1] flex items-center justify-center border-2 border-[#dde1ff] group-hover:scale-105 transition-transform shadow-sm">
          {/* 3. HIỂN THỊ ẢNH HOẶC CHỮ CÁI ĐẦU */}
          {avtUrl ? (
            <img
              src={avtUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-black font-headline text-[#4b5b9a]">
              {getInitials(userName)}
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-[#94A3E8] font-headline font-extrabold text-lg tracking-tight leading-none group-hover:text-[#4b5b9a] transition-colors">
            Chào, {userName}
          </span>
        </div>
      </Link>

      {/* CHUÔNG THÔNG BÁO CHUYỂN SANG TRANG NOTIFICATIONS */}
      <Link
        href="/notifications"
        className="relative text-[#94A3E8] hover:text-[#4b5b9a] transition-colors p-2 active:scale-95 duration-200 outline-none"
      >
        <span className="material-symbols-outlined text-2xl block">
          notifications
        </span>

        {notiCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#f9f9fe] shadow-sm z-10 animate-in zoom-in duration-300">
            {notiCount > 99 ? "99+" : notiCount}
          </span>
        )}
      </Link>
    </nav>
  );
}
