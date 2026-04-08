"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =======================================================================
// MOCK DATA (Dữ liệu giả lập cho mục tiêu hiện tại)
// Trong thực tế, bạn sẽ fetch data dựa trên params.id (Ví dụ: id = 'sony-headphone')
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

// Hàm hỗ trợ format tiền tệ khi nhập/hiển thị
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

  // State quản lý số tiền đóng góp (Mặc định trống)
  const [contribution, setContribution] = useState<string>("");

  // Hàm xử lý nhập tay số tiền
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setContribution(rawValue);
  };

  // Hàm xử lý chọn nhanh (Chips: +50k, +100k...)
  const handleQuickAdd = (amountToAdd: number) => {
    // Nếu đang có số, cộng thêm vào. Nếu đang trống, lấy số mới.
    const currentNum = contribution ? parseInt(contribution, 10) : 0;
    const newTotal = currentNum + amountToAdd;
    setContribution(newTotal.toString());
  };

  // Logic tính toán thanh phần trăm (Bao gồm số tiền hiện tại + số tiền vừa nhập)
  const contributionNum = contribution ? parseInt(contribution, 10) : 0;
  const projectedTotal = Math.min(
    GOAL_DATA.currentAmount + contributionNum,
    GOAL_DATA.targetAmount
  ); // Giới hạn ở mức 100%
  const currentPercentage = Math.round(
    (GOAL_DATA.currentAmount / GOAL_DATA.targetAmount) * 100
  );
  const projectedPercentage = Math.round(
    (projectedTotal / GOAL_DATA.targetAmount) * 100
  );
  const amountLeft = Math.max(GOAL_DATA.targetAmount - projectedTotal, 0);

  const handleSave = () => {
    if (!contribution || contributionNum === 0) {
      alert("Vui lòng nhập số tiền bạn muốn đóng góp!");
      return;
    }
    alert(
      `Bạn đã gửi tiết kiệm thành công ${formatNumber(
        contributionNum
      )}đ vào mục tiêu: ${GOAL_DATA.title}`
    );
    router.push("/dashboard"); // Quay về trang chủ
  };

  return (
    <main className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen pb-32">
      {/* TopAppBar Tùy chỉnh */}
      <header className="w-full top-0 sticky z-50 bg-[#f9f9fe]/90 backdrop-blur-xl flex items-center justify-between px-6 py-4 border-b border-[#e2e2e7]/30 max-w-md mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="active:scale-95 duration-150 hover:opacity-80 transition-opacity text-[#4b5b9a] -ml-2 p-2 rounded-full hover:bg-[#f3f3f8]"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-xl text-[#4b5b9a] tracking-tight">
            Đóng góp
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#dde1ff]">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBShFxPd7VYZuza-IE15xTejXrLagn3KYBfCcCLaxIdXDlwSDzT_i4MC7n4qKIgl-aeYH-pUcAIofpILeLn1jGozJXkcTkwqQA-l3KZU5YsJwM32AXJX6rRXT6GLFUlwpKxg0c0_Bql0KZ8LXfhbLQlROZT8T8xuHCu1DOd11vUq47sioUb4Lillsxa6Jaau3JTCl630-TC39DvfQ029_N60Sn7JVx_0GIzy0d6Sbrw9-Ubz_7n16invqEoksgGJChLUgOVA_RlgQo"
            alt="Avatar"
            width={40}
            height={40}
            className="object-cover w-full h-full"
          />
        </div>
      </header>

      <div className="px-6 pt-6 space-y-8 max-w-md mx-auto">
        {/* =========================================
            Hero Section: Goal Identity 
            ========================================= */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-8 text-white shadow-lg shadow-[#4b5b9a]/20">
          <div className="relative z-10">
            <span className="inline-block px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold mb-4 tracking-widest uppercase border border-white/10">
              Mục tiêu hiện tại
            </span>
            <h2 className="text-3xl font-extrabold font-headline mb-3 leading-tight">
              {GOAL_DATA.title}
            </h2>
            <p className="text-white/80 text-sm font-medium">
              Hạn chót: {GOAL_DATA.deadline}
            </p>
          </div>
          {/* Decorative pattern */}
          <div className="absolute -bottom-6 -right-6 opacity-20 transform rotate-12 transition-transform hover:scale-110 duration-500">
            <span
              className="material-symbols-outlined text-[140px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {GOAL_DATA.icon}
            </span>
          </div>
        </section>

        {/* =========================================
            Momentum Tracker (Thanh Tiến Độ Động) 
            ========================================= */}
        <section className="bg-white border border-[#e2e2e7]/50 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#616470] text-xs font-bold uppercase tracking-wider mb-1">
                Tiến độ dự kiến
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-headline text-[#4b5b9a]">
                  {formatNumber(projectedTotal)}
                </span>
                <span className="text-sm font-bold text-[#4b5b9a]">VND</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#616470] text-xs font-bold uppercase tracking-wider mb-1">
                Mục tiêu
              </p>
              <p className="font-bold text-[#1a1c1f]">
                {formatNumber(GOAL_DATA.targetAmount)} VND
              </p>
            </div>
          </div>

          {/* Progress Bar (2 Lớp: Màu xám nền -> Màu xanh đậm hiện tại -> Màu xanh nhạt (Dự kiến) */}
          <div className="h-4 w-full bg-[#f3f3f8] rounded-full overflow-hidden relative border border-[#e2e2e7]">
            {/* Lớp xanh nhạt (Dự kiến sau khi cộng tiền mới) */}
            <div
              className="absolute top-0 left-0 h-full bg-[#94a3e8] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${projectedPercentage}%` }}
            ></div>
            {/* Lớp xanh đậm (Tiền đã có sẵn lúc đầu) */}
            <div
              className="absolute top-0 left-0 h-full bg-[#4b5b9a] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] font-bold text-[#616470] tracking-wider">
            <span>{projectedPercentage}% HOÀN THÀNH</span>
            <span className="text-[#ba1a1a]">
              CÒN LẠI {formatNumber(amountLeft)} VND
            </span>
          </div>
        </section>

        {/* =========================================
            Contribution Input Section 
            ========================================= */}
        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#4b5b9a] uppercase tracking-widest px-1">
              Số tiền muốn đóng góp
            </label>
            <div className="relative flex items-center bg-[#f3f3f8] rounded-2xl border border-[#e2e2e7] focus-within:border-[#4b5b9a] transition-colors overflow-hidden">
              <input
                type="text"
                value={formatNumber(contribution)}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full bg-transparent border-none py-5 px-6 text-3xl font-extrabold font-headline text-[#1a1c1f] focus: outline-none placeholder:text-[#c6c5d1]"
              />

              <span className="absolute right-6 text-xl font-bold text-[#4b5b9a]">
                VND
              </span>
            </div>
          </div>

          {/* Quick Selection Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {[50000, 100000, 200000, 500000].map((val) => (
              <button
                key={val}
                onClick={() => handleQuickAdd(val)}
                className="px-5 py-2.5 rounded-xl bg-[#e0e2f1] text-[#283775] font-bold text-xs hover:bg-[#94a3e8] hover:text-white transition-colors active:scale-95 shadow-sm"
              >
                + {val / 1000}k
              </button>
            ))}
          </div>
        </section>

        {/* =========================================
            Visual Context Card 
            ========================================= */}
        <section className="bg-white border border-[#e2e2e7]/50 rounded-2xl p-3 shadow-sm flex items-center gap-4 hover:border-[#dde1ff] transition-colors cursor-pointer group">
          <div>
            <h4 className="font-bold text-[#1a1c1f] text-sm mb-0.5">
              Tiết kiệm thông minh
            </h4>
            <p className="text-[11px] text-[#616470] leading-relaxed">
              Bạn chỉ còn cách món đồ yêu thích một vài bước nữa thôi. Cố gắng
              lên!
            </p>
          </div>
        </section>
      </div>

      {/* =========================================
          CTA Button 
          ========================================= */}
      <section className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#f9f9fe] via-[#f9f9fe]/90 to-transparent z-40 flex justify-center">
        <button
          onClick={handleSave}
          className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-extrabold text-lg shadow-lg shadow-[#4b5b9a]/30 hover:opacity-95 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span>Tiết kiệm ngay</span>
        </button>
      </section>
    </main>
  );
}
