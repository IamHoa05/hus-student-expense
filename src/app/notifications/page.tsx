"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// =======================================================================
// 1. Định nghĩa kiểu dữ liệu (Giúp TypeScript không báo lỗi đỏ)
// =======================================================================
interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: string;
  iconColor: string;
  bgColor: string;
  groupId?: string; // Tùy chọn (chỉ có ở thông báo mời vào nhóm)
}

// =======================================================================
// 2. MOCK DATA: Danh sách thông báo
// =======================================================================
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  // {
  //   id: "n5",
  //   type: "group_invite",
  //   title: "Lời mời tham gia nhóm",
  //   message: "Lê Anh Quân (u789) đã mời bạn tham gia nhóm 'Nhóm dự án AI'.",
  //   time: "Vừa xong",
  //   isRead: false,
  //   icon: "group_add",
  //   iconColor: "text-[#10b981]",
  //   bgColor: "bg-[#d1f4e0]",
  //   groupId: "g3", // ID của nhóm để gọi API
  // },
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

// =======================================================================
// 3. COMPONENT CHÍNH
// =======================================================================
export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  // Đánh dấu tất cả là đã đọc
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  // Logic: Chấp nhận lời mời nhóm
  const handleAcceptInvite = (notificationId: string, groupId?: string) => {
    if (!groupId) return; // Bảo vệ an toàn nếu thiếu ID nhóm
    alert(`Bạn đã tham gia nhóm thành công! (Mã nhóm: ${groupId})`);
    // Xóa thông báo lời mời đi sau khi thao tác
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  // Logic: Từ chối lời mời nhóm
  const handleDeclineInvite = (notificationId: string) => {
    // Xóa thông báo lời mời đi
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    // SỬ DỤNG KHUNG CHUẨN CỦA TRANG PHÂN TÍCH
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-4 pb-32 relative min-h-screen bg-[#f9f9fe] font-body text-[#1a1c1f]">
      {/* HEADER NẰM TRONG DÒNG CHẢY (KHÔNG FIXED) */}
      <header className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95 flex items-center justify-center focus:outline-none outline-none"
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
            className="text-xs font-bold text-[#4b5b9a] bg-[#dde1ff] px-3 py-1.5 rounded-full hover:bg-[#c4caff] transition-colors active:scale-95 focus:outline-none outline-none"
          >
            Đã đọc tất cả
          </button>
        )}
      </header>

      {/* VÙNG NỘI DUNG CHÍNH */}
      <div className="space-y-4 pt-2">
        {/* Tiêu đề & Couter Mới nhất */}
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-headline font-bold text-lg text-[#1a1c1f]">
            Mới nhất
          </h2>
          {unreadCount > 0 && (
            <span className="bg-[#ba1a1a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
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
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-[#1a1c1f]">
                      {note.title}
                    </h3>
                    <span className="text-[9px] text-[#767681] whitespace-nowrap mt-0.5 font-medium">
                      {note.time}
                    </span>
                  </div>
                  <p className="text-xs text-[#454650] mt-1 leading-relaxed">
                    {note.message}
                  </p>

                  {/* CÁC NÚT TƯƠNG TÁC CHO LỜI MỜI NHÓM */}
                  {/* {note.type === "group_invite" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#e2e2e7]/50">
                      <button
                        onClick={() =>
                          handleAcceptInvite(note.id, note.groupId)
                        }
                        className="flex-1 bg-[#10b981] text-white text-[11px] font-bold py-2.5 rounded-xl hover:bg-[#059669] active:scale-95 transition-all shadow-sm shadow-[#10b981]/20 focus:outline-none outline-none"
                      >
                        Chấp nhận
                      </button>
                      <button
                        onClick={() => handleDeclineInvite(note.id)}
                        className="flex-1 bg-[#f3f3f8] text-[#616470] text-[11px] font-bold py-2.5 rounded-xl hover:bg-[#e2e2e7] hover:text-[#ba1a1a] active:scale-95 transition-all focus:outline-none outline-none"
                      >
                        Từ chối
                      </button>
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* TRẠNG THÁI RỖNG (Khi không có thông báo nào) */}
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 opacity-50 text-center animate-in fade-in duration-500">
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
