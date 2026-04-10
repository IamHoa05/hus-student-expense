"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";


// Danh sách các biểu tượng mục tiêu
const GOAL_ICONS = [
  { id: "icon_phone", icon: "smartphone" },
  { id: "icon_car", icon: "directions_car" },
  { id: "icon_flight", icon: "flight" },
  { id: "icon_home", icon: "home" },
  { id: "icon_laptop", icon: "laptop_mac" },
];

// Hàm hỗ trợ format tiền tệ khi nhập
const formatNumber = (numStr: string) => {
  if (!numStr) return "";
  const num = parseInt(numStr.replace(/\D/g, ""), 10);
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default function AddGoalPage() {
  const router = useRouter();

  // States quản lý form
  const [selectedIcon, setSelectedIcon] = useState<string>("icon_phone");
  const [goalName, setGoalName] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");

  // Xử lý khi nhập tiền vào ô input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setTargetAmount(rawValue);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn reload trang khi submit form
    if (!goalName || !targetAmount || !targetDate) {
      alert("Vui lòng điền đầy đủ thông tin mục tiêu!");
      return;
    }
    alert(`Đã tạo mục tiêu "${goalName}" thành công! Cố lên nhé!`);
    router.push("/dashboard"); // Quay về trang chủ
  };

  return (
    <main className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen pb-32">
      {/* Top Navigation (Header Tùy chỉnh) */}
      <header className="fixed top-0 w-full z-50 bg-[#f9f9fe]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-[#e2e2e7]/30 max-w-md mx-auto left-0 right-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e2e2e7] transition-colors -ml-2"
          >
            <span className="material-symbols-outlined text-[#4b5b9a]">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-[#4b5b9a]">
            Mục tiêu mới
          </h1>
        </div>
      </header>

      <div className="pt-24 px-6 max-w-md mx-auto space-y-8">
        {/* Visual Hero Section */}
        <section className="mb-10 text-center">
          <div className="inline-block p-8 rounded-full bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] shadow-lg shadow-[#4b5b9a]/20 mb-6">
            <span
              className="material-symbols-outlined text-6xl text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              savings
            </span>
          </div>
          <h2 className="font-headline text-3xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">
            Ước mơ tiếp theo là gì?
          </h2>
          <p className="text-[#616470] leading-relaxed text-sm">
            Momentum sẽ đồng hành cùng bạn trên hành trình chinh phục những cột
            mốc mới.
          </p>
          
        </section>

        {/* Goal Form */}
        <form onSubmit={handleSaveGoal} className="space-y-8">
          {/* Icon Selection */}
          <div className="space-y-4">
            <label className="font-headline font-bold text-sm uppercase tracking-wider text-[#616470] px-1">
              Biểu tượng mục tiêu
            </label>
            <div className="grid grid-cols-5 gap-3">
              {GOAL_ICONS.map((item) => {
                const isSelected = selectedIcon === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={`aspect-square flex items-center justify-center rounded-2xl transition-all active:scale-95 ${
                      isSelected
                        ? "bg-[#94a3e8] text-white shadow-md shadow-[#94a3e8]/30"
                        : "bg-[#f3f3f8] text-[#767681] hover:bg-[#e2e2e7]"
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl"
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
          <div className="space-y-6">
            {/* Goal Name */}
            <div className="space-y-2">
              <label
                className="font-headline font-bold text-sm px-1 text-[#1a1c1f]"
                htmlFor="goal_name"
              >
                Tên mục tiêu
              </label>
              <div className="relative group">
                <input
                  id="goal_name"
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Ví dụ: Mua iPhone 16 Pro Max"
                  className="w-full bg-[#f3f3f8] border border-[#e2e2e7]/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#4b5b9a]/40 focus:border-[#4b5b9a] transition-all font-medium placeholder:text-[#767681]/60 text-[#1a1c1f]"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <label
                className="font-headline font-bold text-sm px-1 text-[#1a1c1f]"
                htmlFor="target_amount"
              >
                Số tiền cần tiết kiệm
              </label>
              <div className="relative flex items-center">
                <input
                  id="target_amount"
                  type="text"
                  value={formatNumber(targetAmount)}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-[#f3f3f8] border border-[#e2e2e7]/50 rounded-2xl pl-5 pr-16 py-4 focus:ring-2 focus:ring-[#4b5b9a]/40 focus:border-[#4b5b9a] transition-all font-headline text-2xl font-bold text-[#1a1c1f] placeholder:text-[#c6c5d1]"
                />
                <span className="absolute right-5 font-headline font-bold text-[#4b5b9a]">
                  VND
                </span>
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <label
                className="font-headline font-bold text-sm px-1 text-[#1a1c1f]"
                htmlFor="target_date"
              >
                Ngày dự kiến đạt được
              </label>
              <div className="relative group">
                <input
                  id="target_date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#f3f3f8] border border-[#e2e2e7]/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#4b5b9a]/40 focus:border-[#4b5b9a] transition-all font-medium text-[#1a1c1f]"
                />
              </div>
            </div>
          </div>

          {/* Strategy Card (Mẹo Momentum) */}
          <div className="p-6 bg-white rounded-2xl border border-[#e2e2e7] shadow-sm relative overflow-hidden mt-4">
            <div className="relative z-10 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[#ffdf90] flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-[#755b00]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-[#4b5b9a] mb-1">
                  Mẹo Momentum
                </h4>
                <p className="text-sm text-[#616470] leading-relaxed">
                  Chia nhỏ 35.000.000 VND thành các khoản tiết kiệm 2.000.000
                  VND mỗi tuần sẽ giúp bạn đạt mục tiêu nhanh hơn 15%.
                </p>
              </div>
            </div>
            {/* Background decorative element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#ffdf90]/20 rounded-full blur-2xl"></div>
          </div>

          {/* Action Button */}
          <div className="pt-4 pb-8">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-extrabold text-lg py-5 rounded-2xl shadow-lg shadow-[#4b5b9a]/30 active:scale-95 transition-transform hover:opacity-95 flex justify-center items-center gap-2"
            >
              <span>Bắt đầu tiết kiệm</span>
              <span className="material-symbols-outlined">rocket_launch</span>
            </button>
            <p className="text-center text-xs text-[#767681] mt-4 px-8 leading-relaxed">
              Bằng cách bắt đầu, bạn đồng ý với các điều khoản lập kế hoạch tài
              chính của Momentum.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
