"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// =======================================================================
// MOCK DATA: Danh sách thông báo
// =======================================================================
const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    type: "alert",
    title: "Cảnh báo hạn mức Ăn uống!",
    message:
      "Bạn đã tiêu 4.200.000đ (84%) hạn mức tháng này. Chỉ còn 800.000đ cho 6 ngày tới.",
    time: "2 giờ trước",
    isRead: false,
    icon: "warning",
    iconColor: "text-[#ba1a1a]",
    bgColor: "bg-[#ffdad6]/40",
  },
  {
    id: "n2",
    type: "warning",
    title: "Mua sắm sắp vượt giới hạn",
    message:
      "Hạng mục Mua sắm đã đạt 90% (1.800.000đ/2.000.000đ). Hãy cân nhắc trước khi chi tiêu thêm nhé!",
    time: "Hôm qua",
    isRead: false,
    icon: "shopping_bag",
    iconColor: "text-[#755b00]",
    bgColor: "bg-[#ffdf90]/30",
  },
  {
    id: "n3",
    type: "info",
    title: "Bắt đầu chu kỳ tháng mới 🚀",
    message:
      "Hạn mức của bạn đã được làm mới. Chúc bạn một tháng quản lý tài chính hiệu quả!",
    time: "01/10/2026",
    isRead: true,
    icon: "calendar_month",
    iconColor: "text-[#4b5b9a]",
    bgColor: "bg-[#dde1ff]/30",
  },
  {
    id: "n4",
    type: "room",
    title: "Nhắc nhở quỹ phòng",
    message:
      "Hà Vy vừa tạo yêu cầu chia hóa đơn 'Tiền điện tháng 9'. Số tiền của bạn: 416.666đ.",
    time: "28/09/2026",
    isRead: true,
    icon: "receipt_long",
    iconColor: "text-[#4b5b9a]",
    bgColor: "bg-[#f3f3f8]",
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="flex-grow w-full max-w-md mx-auto bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen pb-32">
      {/* Top AppBar - Cần thêm max-w-md để nó không bị dài ngoằng ra hai bên */}
      <header className="fixed top-0 w-full max-w-md z-50 bg-[#f9f9fe]/90 backdrop-blur-xl border-b border-[#e2e2e7]/30">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">
                arrow_back
              </span>
            </button>
            <h1 className="font-headline font-bold text-xl tracking-tight text-[#4b5b9a]">
              Thông báo
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-bold text-[#4b5b9a] bg-[#dde1ff] px-3 py-1.5 rounded-full"
            >
              Đã đọc tất cả
            </button>
          )}
        </div>
      </header>

      {/* 2. Đảm bảo container chứa list cũng nằm trong padding-x chuẩn */}
      <div className="pt-24 px-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-headline font-bold text-lg text-[#1a1c1f]">
            Mới nhất
          </h2>
          {unreadCount > 0 && (
            <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Danh sách thông báo */}
        <div className="space-y-3">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-2xl border transition-all ${
                note.isRead
                  ? "bg-white border-[#e2e2e7]/50"
                  : "bg-white border-[#94a3e8]/40 shadow-sm"
              }`}
            >
              {/* Nội dung thông báo (giữ nguyên logic cũ) */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${note.bgColor}`}
                >
                  <span
                    className={`material-symbols-outlined ${note.iconColor}`}
                  >
                    {note.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{note.title}</h3>
                  <p className="text-xs text-[#454650] mt-1">{note.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State - Phần bạn đang bị tràn */}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-50 text-center">
            <span className="material-symbols-outlined text-6xl text-[#616470] mb-4">
              notifications_off
            </span>
            <p className="font-headline font-semibold text-[#454650]">
              Không có thông báo nào!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
