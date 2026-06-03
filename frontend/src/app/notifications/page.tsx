"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Notification {
  notification_id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  ref_id: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications?page=1&limit=20`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT", // Hoặc POST tùy backend
        credentials: "include",
      });
      // Đánh dấu toàn bộ mảng là đã đọc trên UI
      setNotifications((prev) =>
        prev.map((noti) => ({ ...noti, is_read: true }))
      );
    } catch (err) {
      console.error("Lỗi read-all:", err);
    }
  };

  const handleReadSingle = async (id: number, isRead: boolean) => {
    if (isRead) return; // Đã đọc rồi thì không gọi API nữa
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT", // Hoặc POST tùy backend
        credentials: "include",
      });
      // Đánh dấu item này là đã đọc trên UI
      setNotifications((prev) =>
        prev.map((noti) =>
          noti.notification_id === id ? { ...noti, is_read: true } : noti
        )
      );
    } catch (err) {
      console.error("Lỗi read-single:", err);
    }
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} • ${d.toLocaleDateString("vi-VN")}`;
  };

  return (
    <main className="w-full max-w-md mx-auto min-h-screen bg-[#f9f9fe] pb-24 relative">
      <header className="sticky top-0 bg-[#f9f9fe]/90 backdrop-blur-md border-b border-[#e2e2e7]/30 flex items-center justify-between px-5 py-4 z-40">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[#4b5b9a] hover:bg-[#e2e2e7] rounded-full transition-all outline-none"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-lg text-[#4b5b9a] ml-2">
            Thông báo
          </h1>
        </div>

        <button
          onClick={handleReadAll}
          className="text-[10px] font-bold text-[#4b5b9a] underline outline-none"
        >
          Đọc tất cả
        </button>
      </header>

      <div className="px-5 pt-4 space-y-3">
        {loading ? (
          <div className="text-center text-xs text-[#767681] py-10">
            Đang tải...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-[#767681] py-10">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#dde1ff]">
              notifications_off
            </span>
            <p className="text-xs font-medium">Bạn chưa có thông báo nào.</p>
          </div>
        ) : (
          notifications.map((noti) => (
            <div
              key={noti.notification_id}
              onClick={() =>
                handleReadSingle(noti.notification_id, noti.is_read)
              }
              className={`p-4 rounded-xl border flex gap-3 transition-all cursor-pointer ${
                noti.is_read
                  ? "bg-[#f3f3f8] border-transparent opacity-70"
                  : "bg-white border-[#e2e2e7]/50 shadow-sm"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#dde1ff] flex items-center justify-center text-[#4b5b9a] shrink-0">
                <span className="material-symbols-outlined text-xl">
                  {noti.type === "transaction" ? "payments" : "notifications"}
                </span>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4
                    className={`text-xs truncate ${
                      noti.is_read
                        ? "font-bold text-[#454650]"
                        : "font-black text-[#1a1c1f]"
                    }`}
                  >
                    {noti.title}
                  </h4>
                  {!noti.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a] mt-1 shrink-0"></span>
                  )}
                </div>
                <p className="text-[11px] text-[#454650] leading-relaxed">
                  {noti.body}
                </p>
                <p className="text-[9px] text-[#767681] mt-2 font-medium">
                  {formatTime(noti.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
