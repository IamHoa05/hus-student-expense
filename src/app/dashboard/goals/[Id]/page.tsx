"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =======================================================================
// MOCK DATA (Dữ liệu giả lập cho mục tiêu hiện tại)
// =======================================================================
const GOAL_DATA = {
  id: "sony-headphone",
  title: "Mua Tai Nghe Sony WH-1000XM5",
  deadline: "24 Tháng 12, 2026",
  currentAmount: 6450000,
  targetAmount: 8500000,
  icon: "headphones",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBHNefiO4pwTCWFIeM4xWlzrZSwdc6_K9k-jEdOX64p8-T0YLLBJ8iFiWLKEk2LjwEXvri5N-YDesETu9dccwT2cEXRegO3e8ioW7rsjXCSmJa7wQIGMpg-NsOcWw5DxEV_Rymc0T4EEFw1mzZSXdXbcoJ4CV-gbC_SqwR5XvR8VuPXNsMClEk7Lt3bTdOSK5a1D73mrOxtKB7hJLNU6bOw54v0z8340Y7hiVPA0bJQTndCR-Uyk9Fpmqpl3ZLHgBmSIz1V97dCpzE",
};

// Hàm hỗ trợ format tiền tệ
const formatNumber = (numStr: string | number) => {
  if (numStr === "") return "";
  const num =
    typeof numStr === "string"
      ? parseInt(numStr.replace(/\D/g, ""), 10)
      : numStr;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default function AddContributionPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // State quản lý số tiền đóng góp
  const [contribution, setContribution] = useState<string>("");

  // State để xử lý khi bàn phím ảo xuất hiện
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

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
    }, 3000); // Tự ẩn sau 3s
  };

  // Xử lý bàn phím ảo trên mobile
  useEffect(() => {
    const handleResize = () => {
      // Kiểm tra nếu chiều cao window thay đổi đáng kể (bàn phím xuất hiện)
      const isKeyboard = window.visualViewport
        ? window.visualViewport.height < window.innerHeight * 0.8
        : window.innerHeight < 700;

      setIsKeyboardVisible(isKeyboard);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      } else {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Focus vào input khi component mount
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setContribution(rawValue);
  };

  const handleQuickAdd = (amountToAdd: number) => {
    const currentNum = contribution ? parseInt(contribution, 10) : 0;
    const newTotal = currentNum + amountToAdd;
    setContribution(newTotal.toString());
    inputRef.current?.focus();
  };

  const contributionNum = contribution ? parseInt(contribution, 10) : 0;
  const projectedTotal = Math.min(
    GOAL_DATA.currentAmount + contributionNum,
    GOAL_DATA.targetAmount
  );
  const currentPercentage = Math.round(
    (GOAL_DATA.currentAmount / GOAL_DATA.targetAmount) * 100
  );
  const projectedPercentage = Math.round(
    (projectedTotal / GOAL_DATA.targetAmount) * 100
  );
  const amountLeft = Math.max(GOAL_DATA.targetAmount - projectedTotal, 0);

  // =========================================
  // HANDLER: Lưu đóng góp
  // =========================================
  const handleSave = () => {
    if (!contribution || contributionNum === 0) {
      showNotification("error", "Vui lòng nhập số tiền bạn muốn đóng góp!");
      return;
    }

    showNotification(
      "success",
      `Đã gửi thành công ${formatNumber(contributionNum)}đ vào mục tiêu: ${
        GOAL_DATA.title
      }`
    );

    // Đợi 2s để người dùng đọc thông báo rồi chuyển trang
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

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

      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-[#f9f9fe]/90 backdrop-blur-xl flex items-center justify-between px-5 py-3 border-b border-[#e2e2e7]/30 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-lg text-[#4b5b9a] tracking-tight">
            Đóng góp
          </h1>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#dde1ff]">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBShFxPd7VYZuza-IE15xTejXrLagn3KYBfCcCLaxIdXDlwSDzT_i4MC7n4qKIgl-aeYH-pUcAIofpILeLn1jGozJXkcTkwqQA-l3KZU5YsJwM32AXJX6rRXT6GLFUlwpKxg0c0_Bql0KZ8LXfhbLQlROZT8T8xuHCu1DOd11vUq47sioUb4Lillsxa6Jaau3JTCl630-TC39DvfQ029_N60Sn7JVx_0GIzy0d6Sbrw9-Ubz_7n16invqEoksgGJChLUgOVA_RlgQo"
            alt="Avatar"
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        </div>
      </header>

      {/* Content */}
      <div className="px-5 pt-4 space-y-5 max-w-md mx-auto w-full flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-5 text-white shadow-lg shadow-[#4b5b9a]/20">
          <div className="relative z-10">
            <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold mb-3 tracking-widest uppercase border border-white/10">
              Mục tiêu hiện tại
            </span>
            <h2 className="text-xl font-extrabold font-headline mb-2 leading-tight">
              {GOAL_DATA.title}
            </h2>
            <p className="text-white/80 text-xs font-medium">
              Hạn chót: {GOAL_DATA.deadline}
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 opacity-20 transform rotate-12">
            <span
              className="material-symbols-outlined text-[120px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {GOAL_DATA.icon}
            </span>
          </div>
        </section>

        {/* Momentum Tracker */}
        <section className="bg-white border border-[#e2e2e7]/50 rounded-2xl p-4 space-y-4 shadow-sm">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#616470] text-[9px] font-bold uppercase tracking-wider mb-1">
                Tiến độ dự kiến
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-headline text-[#4b5b9a]">
                  {formatNumber(projectedTotal)}
                </span>
                <span className="text-xs font-bold text-[#4b5b9a]">VND</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#616470] text-[9px] font-bold uppercase tracking-wider mb-1">
                Mục tiêu
              </p>
              <p className="font-bold text-sm text-[#1a1c1f]">
                {formatNumber(GOAL_DATA.targetAmount)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-[#f3f3f8] rounded-full overflow-hidden relative border border-[#e2e2e7]">
            <div
              className="absolute top-0 left-0 h-full bg-[#94a3e8] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${projectedPercentage}%` }}
            ></div>
            <div
              className="absolute top-0 left-0 h-full bg-[#4b5b9a] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[9px] font-bold text-[#616470] tracking-wider">
            <span>{projectedPercentage}% HOÀN THÀNH</span>
            <span className="text-[#ba1a1a]">
              CÒN LẠI {formatNumber(amountLeft)} VND
            </span>
          </div>
        </section>

        {/* Contribution Input Section */}
        <section className="space-y-3">
          <label className="text-[9px] font-bold text-[#4b5b9a] uppercase tracking-widest px-1">
            Số tiền muốn đóng góp
          </label>
          <div className="relative flex items-center bg-[#f3f3f8] rounded-2xl border border-[#e2e2e7] focus-within:border-[#4b5b9a] transition-colors overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={formatNumber(contribution)}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full bg-transparent border-none py-4 px-5 text-2xl font-extrabold font-headline text-[#1a1c1f] focus:outline-none placeholder:text-[#c6c5d1]"
            />
            <span className="absolute right-5 text-lg font-bold text-[#4b5b9a]">
              VND
            </span>
          </div>

          {/* Quick Selection Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[50000, 100000, 200000, 500000].map((val) => (
              <button
                key={val}
                onClick={() => handleQuickAdd(val)}
                className="px-4 py-2 rounded-xl bg-[#e0e2f1] text-[#283775] font-bold text-xs hover:bg-[#94a3e8] hover:text-white transition-colors active:scale-95 shadow-sm"
              >
                + {val / 1000}k
              </button>
            ))}
          </div>
        </section>

        {/* Visual Context Card - Ẩn khi bàn phím hiện */}
        {!isKeyboardVisible && (
          <section className="bg-white border border-[#e2e2e7]/50 rounded-2xl p-3 shadow-sm flex items-center gap-3 hover:border-[#dde1ff] transition-colors cursor-pointer group">
            <div>
              <h4 className="font-bold text-[#1a1c1f] text-xs mb-0.5">
                Tiết kiệm thông minh
              </h4>
              <p className="text-[9px] text-[#616470] leading-relaxed">
                Bạn chỉ còn cách món đồ yêu thích một vài bước nữa thôi. Cố gắng
                lên!
              </p>
            </div>
          </section>
        )}
      </div>

      {/* CTA Button - Ẩn khi bàn phím hiện để tránh che nội dung */}
      {!isKeyboardVisible && (
        <div className="sticky bottom-0 left-0 w-full p-5 bg-gradient-to-t from-[#f9f9fe] via-[#f9f9fe]/90 to-transparent z-40 flex justify-center">
          <button
            onClick={handleSave}
            className="w-full max-w-md py-3.5 rounded-2xl bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-extrabold text-base shadow-lg shadow-[#4b5b9a]/30 hover:opacity-95 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span>Tiết kiệm ngay</span>
          </button>
        </div>
      )}
    </main>
  );
}
