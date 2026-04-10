"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Danh sách các biểu tượng mục tiêu
const GOAL_ICONS = [
  { id: "icon_phone", icon: "smartphone" },
  { id: "icon_car", icon: "directions_car" },
  { id: "icon_flight", icon: "flight" },
  { id: "icon_home", icon: "home" },
  { id: "icon_laptop", icon: "laptop_mac" },
];

// Hàm hỗ trợ format tiền tệ khi nhập
const formatNumber = (numStr: string | number) => {
  if (!numStr) return "";
  const num =
    typeof numStr === "string"
      ? parseInt(numStr.replace(/\D/g, ""), 10)
      : numStr;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default function AddGoalPage() {
  const router = useRouter();

  // States quản lý form
  const [selectedIcon, setSelectedIcon] = useState<string>(""); // Rỗng = Không chọn
  const [goalName, setGoalName] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");

  // =========================================
  // STATE: Quản lý thông báo Popup
  // =========================================
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const showNotification = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "success", message: "" });
    }, 3000); // Ẩn sau 3s
  };

  // Xử lý khi nhập tiền vào ô input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setTargetAmount(rawValue);
  };

  // Toggle chọn icon (bấm lại icon đang chọn thì sẽ bỏ chọn)
  const handleToggleIcon = (id: string) => {
    if (selectedIcon === id) {
      setSelectedIcon(""); // Bỏ chọn
    } else {
      setSelectedIcon(id); // Chọn icon mới
    }
  };

  // Xử lý lưu mục tiêu
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || !targetAmount.trim() || !targetDate) {
      showNotification(
        "error",
        "Vui lòng điền đủ tên, số tiền và ngày dự kiến!"
      );
      return;
    }

    // Báo thành công
    showNotification(
      "success",
      `Đã tạo mục tiêu "${goalName}" thành công! Cố lên nhé!`
    );

    // Đợi 2s để đọc thông báo rồi chuyển trang
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  // Tính toán mẹo tự động (Giả sử chia nhỏ ra 10 tuần)
  const targetNum = targetAmount
    ? parseInt(targetAmount.replace(/\D/g, ""), 10)
    : 0;
  const weeklyAmount = targetNum > 0 ? Math.round(targetNum / 10) : 0;

  return (
    <main className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-[100dvh] flex flex-col relative overflow-x-hidden">
      {/* =========================================
          THÔNG BÁO - Nổi giữa màn hình
          ========================================= */}
      {notification.show && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-[280px] pointer-events-none px-4">
          <div
            className={`animate-in fade-in zoom-in-95 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white rounded-3xl p-5 flex flex-col items-center justify-center text-center border ${
              notification.type === "success"
                ? "border-[#059669]/20" // Xanh lá
                : notification.type === "error"
                ? "border-[#ba1a1a]/20" // Đỏ
                : "border-[#856404]/20"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                notification.type === "success"
                  ? "bg-[#d1fae5] text-[#059669]" // Nền/Icon Xanh lá
                  : notification.type === "error"
                  ? "bg-[#ffdad6] text-[#ba1a1a]"
                  : "bg-[#fff3cd] text-[#856404]"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {notification.type === "success"
                  ? "check_circle"
                  : notification.type === "error"
                  ? "error"
                  : "warning"}
              </span>
            </div>
            <span
              className={`font-headline font-bold text-sm leading-relaxed px-2 ${
                notification.type === "success"
                  ? "text-[#059669]" // Chữ Xanh lá
                  : notification.type === "error"
                  ? "text-[#ba1a1a]"
                  : "text-[#856404]"
              }`}
            >
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9fe]/80 backdrop-blur-xl flex justify-between items-center px-5 py-3 border-b border-[#e2e2e7]/30 max-w-md mx-auto left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-lg tracking-tight text-[#4b5b9a]">
            Mục tiêu mới
          </h1>
        </div>
      </header>

      {/* Vùng Wrapper thu hẹp lại các khối bên dưới (max-w-[340px]) */}
      <div className="pt-16 pb-12 space-y-6 max-w-[340px] mx-auto w-full flex-1 flex flex-col">
        {/* Visual Hero Section - Thu gọn */}
        <section className="mt-4 text-center">
          <div className="inline-block p-6 rounded-full bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] shadow-lg shadow-[#4b5b9a]/20 mb-4">
            <span
              className="material-symbols-outlined text-5xl text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              savings
            </span>
          </div>
          <h2 className="font-headline text-2xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">
            Ước mơ tiếp theo?
          </h2>
          <p className="text-[#616470] leading-relaxed text-[11px] px-4">
            Momentum sẽ đồng hành cùng bạn trên hành trình chinh phục cột mốc
            mới.
          </p>
        </section>

        {/* Goal Form */}
        <form
          onSubmit={handleSaveGoal}
          className="space-y-6 flex-1 flex flex-col"
        >
          {/* Icon Selection (Tùy chọn) */}
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#616470]">
                Biểu tượng
              </label>
              <span className="text-[9px] text-[#767681] font-medium">
                (Tùy chọn)
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {GOAL_ICONS.map((item) => {
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleIcon(item.id)}
                    className={`aspect-square flex items-center justify-center rounded-xl transition-all active:scale-95 ${
                      isSelected
                        ? "bg-[#94a3e8] text-white shadow-md shadow-[#94a3e8]/30"
                        : "bg-[#f3f3f8] text-[#767681] hover:bg-[#e2e2e7]"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={
                        isSelected ? { fontVariationSettings: "'FILL' 1" } : {}
                      }
                    >
                      {item.icon}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            {/* Goal Name */}
            <div className="space-y-1.5">
              <label
                className="font-headline font-bold text-xs px-1 text-[#1a1c1f]"
                htmlFor="goal_name"
              >
                Tên mục tiêu
              </label>
              <div className="relative">
                <input
                  id="goal_name"
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Ví dụ: Mua iPhone 16"
                  className="w-full bg-[#f3f3f8] border border-[#e2e2e7]/50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#4b5b9a]/40 focus:border-[#4b5b9a] transition-all text-sm font-medium placeholder:text-[#c6c5d1] text-[#1a1c1f] outline-none"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div className="space-y-1.5">
              <label
                className="font-headline font-bold text-xs px-1 text-[#1a1c1f]"
                htmlFor="target_amount"
              >
                Số tiền cần tiết kiệm
              </label>
              <div className="relative flex items-center">
                <input
                  id="target_amount"
                  type="text"
                  inputMode="numeric"
                  value={formatNumber(targetAmount)}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-[#f3f3f8] border border-[#e2e2e7]/50 rounded-xl pl-4 pr-14 py-3.5 focus:ring-2 focus:ring-[#4b5b9a]/40 focus:border-[#4b5b9a] transition-all font-headline text-lg font-bold text-[#1a1c1f] placeholder:text-[#c6c5d1] outline-none"
                />
                <span className="absolute right-4 font-headline text-sm font-bold text-[#4b5b9a]">
                  VND
                </span>
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-1.5">
              <label
                className="font-headline font-bold text-xs px-1 text-[#1a1c1f]"
                htmlFor="target_date"
              >
                Ngày dự kiến đạt được
              </label>
              <div className="relative">
                <input
                  id="target_date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#f3f3f8] border border-[#e2e2e7]/50 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#4b5b9a]/40 focus:border-[#4b5b9a] transition-all text-sm font-medium text-[#1a1c1f] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Button (Đẩy sát xuống dưới cùng nếu màn hình dài) */}
          <div className="pt-4 mt-auto">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-bold text-base py-4 rounded-xl shadow-lg shadow-[#4b5b9a]/20 active:scale-95 transition-transform flex justify-center items-center gap-2"
            >
              <span>Tạo mục tiêu</span>
              <span className="material-symbols-outlined text-xl">
                rocket_launch
              </span>
            </button>
            <p className="text-center text-[9px] text-[#767681] mt-3 px-4 leading-relaxed uppercase tracking-wider">
              Bắt đầu hành trình kỷ luật tài chính
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
