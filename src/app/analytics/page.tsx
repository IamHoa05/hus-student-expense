"use client";

import React from "react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

// =======================================================================
// MOCK DATA (Dữ liệu ảo để hiển thị giao diện)
// =======================================================================
const MOCK_DATA = {
  currentMonthTotal: 12450000,
  trendPercentage: 12,
  forecastDate: "24 Tháng 10",
  categories: [
    {
      id: "cat_food",
      name: "Ăn uống & Cà phê",
      amount: 5602000,
      txCount: 42,
      icon: "restaurant",
      colorClass: "text-[#4b5b9a]",
      bgClass: "bg-[#94a3e8]/20",
    },
    {
      id: "cat_edu",
      name: "Học phí & Khóa học",
      amount: 3112000,
      txCount: 3,
      icon: "school",
      colorClass: "text-[#755b00]",
      bgClass: "bg-[#c5a344]/20",
    },
    {
      id: "cat_transport",
      name: "Di chuyển",
      amount: 1230000,
      txCount: 15,
      icon: "directions_bus",
      colorClass: "text-[#5b5e6a]",
      bgClass: "bg-[#c3c6d4]/40",
    },
  ],
};

// Hàm hỗ trợ format tiền tệ
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(amount)
    .replace("₫", "đ");
};

export default function AnalyticsPage() {
  return (
    // Áp dụng chính xác thẻ <main> bạn yêu cầu
    <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-28 relative min-h-screen">
      <TopBar />

      <div className="space-y-8 mt-2">
        {/* =========================================
            Hero Section: Monthly Overview 
            ========================================= */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#616470] font-medium text-sm">
                Tổng chi tiêu tháng 10
              </p>
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-[#4b5b9a]">
                {formatCurrency(MOCK_DATA.currentMonthTotal)}
              </h1>
            </div>
            <div className="bg-[#94a3e8]/20 px-3 py-1 rounded-full flex items-center gap-1 border border-[#94a3e8]/30">
              <span className="material-symbols-outlined text-[#4b5b9a] text-sm">
                trending_up
              </span>
              <span className="text-[#4b5b9a] font-bold text-xs">
                +{MOCK_DATA.trendPercentage}%
              </span>
            </div>
          </div>

          {/* Bento Grid - Insights & Forecast */}
          <div className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-6 rounded-2xl text-white shadow-lg shadow-[#4b5b9a]/20 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium">
                Dự báo ngày cháy túi
              </p>
              <h2 className="text-3xl font-black font-headline mt-1">
                {MOCK_DATA.forecastDate}
              </h2>
              <p className="text-xs mt-2 opacity-90 italic">
                Dựa trên tốc độ chi tiêu hiện tại của bạn
              </p>
            </div>
            {/* Background Icon Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <span className="material-symbols-outlined text-8xl">
                local_fire_department
              </span>
            </div>
          </div>
        </section>

        {/* =========================================
            Spending Distribution (Pie Chart Visualization) 
            ========================================= */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
            Phân bổ chi tiêu
          </h3>

          <div className="bg-[#f3f3f8] p-6 rounded-2xl flex flex-col items-center border border-[#e2e2e7]/60 shadow-sm">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* SVG Pie Chart */}
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <circle
                  className="stroke-[#e2e2e7]"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeWidth="3"
                ></circle>
                {/* Segment 1: Ăn uống (45%) */}
                <circle
                  className="stroke-[#4b5b9a]"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeDasharray="45, 100"
                  strokeWidth="3"
                ></circle>
                {/* Segment 2: Giáo dục (25%) */}
                <circle
                  className="stroke-[#c5a344]"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-45"
                  strokeWidth="3"
                ></circle>
                {/* Segment 3: Di chuyển (30%) */}
                <circle
                  className="stroke-[#c3c6d4]"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeDasharray="30, 100"
                  strokeDashoffset="-70"
                  strokeWidth="3"
                ></circle>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-[#616470] font-medium uppercase tracking-widest">
                  Lớn nhất
                </span>
                <span className="text-sm font-bold text-[#4b5b9a]">
                  Ăn uống
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="grid grid-cols-2 gap-y-3 w-full mt-6 pl-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4b5b9a]"></div>
                <span className="text-xs font-medium text-[#454650]">
                  Ăn uống (45%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#c5a344]"></div>
                <span className="text-xs font-medium text-[#454650]">
                  Học tập (25%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#c3c6d4]"></div>
                <span className="text-xs font-medium text-[#454650]">
                  Di chuyển (30%)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            Spending Trends (Bar Chart) 
            ========================================= */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
              Xu hướng chi tiêu
            </h3>
            <span className="text-xs text-[#616470] font-medium bg-[#f3f3f8] px-2 py-1 rounded-md">
              6 tháng qua
            </span>
          </div>

          <div className="bg-white border border-[#e2e2e7]/60 p-6 rounded-2xl h-56 flex items-end justify-between gap-3 shadow-sm">
            {/* Cột T5 */}
            <div className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-[10px] font-bold text-[#4b5b9a] opacity-0 group-hover:opacity-100 transition-opacity mb-1 -translate-y-2">
                3.2tr
              </span>
              <div className="w-full bg-[#e2e2e7] group-hover:bg-[#dde1ff] rounded-t-lg h-16 transition-colors duration-300"></div>
              <span className="text-[10px] font-bold text-[#616470]">T5</span>
            </div>
            {/* Cột T6 */}
            <div className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-[10px] font-bold text-[#4b5b9a] opacity-0 group-hover:opacity-100 transition-opacity mb-1 -translate-y-2">
                4.5tr
              </span>
              <div className="w-full bg-[#e2e2e7] group-hover:bg-[#dde1ff] rounded-t-lg h-24 transition-colors duration-300"></div>
              <span className="text-[10px] font-bold text-[#616470]">T6</span>
            </div>
            {/* Cột T7 */}
            <div className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-[10px] font-bold text-[#4b5b9a] opacity-0 group-hover:opacity-100 transition-opacity mb-1 -translate-y-2">
                3.8tr
              </span>
              <div className="w-full bg-[#e2e2e7] group-hover:bg-[#dde1ff] rounded-t-lg h-20 transition-colors duration-300"></div>
              <span className="text-[10px] font-bold text-[#616470]">T7</span>
            </div>
            {/* Cột T8 */}
            <div className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-[10px] font-bold text-[#4b5b9a] opacity-0 group-hover:opacity-100 transition-opacity mb-1 -translate-y-2">
                5.1tr
              </span>
              <div className="w-full bg-[#e2e2e7] group-hover:bg-[#dde1ff] rounded-t-lg h-28 transition-colors duration-300"></div>
              <span className="text-[10px] font-bold text-[#616470]">T8</span>
            </div>
            {/* Cột T9 */}
            <div className="flex flex-col items-center gap-2 flex-1 group">
              <span className="text-[10px] font-bold text-[#4b5b9a] opacity-0 group-hover:opacity-100 transition-opacity mb-1 -translate-y-2">
                6.0tr
              </span>
              <div className="w-full bg-[#e2e2e7] group-hover:bg-[#dde1ff] rounded-t-lg h-32 transition-colors duration-300"></div>
              <span className="text-[10px] font-bold text-[#616470]">T9</span>
            </div>
            {/* Cột T10 (Hiện tại) */}
            <div className="flex flex-col items-center gap-2 flex-1 relative">
              <span className="text-[10px] font-bold text-[#4b5b9a] mb-1 -translate-y-2">
                12.4tr
              </span>
              <div className="w-full bg-gradient-to-t from-[#4b5b9a] to-[#94a3e8] rounded-t-lg h-40 shadow-sm shadow-[#4b5b9a]/20"></div>
              <span className="text-[10px] font-bold text-[#4b5b9a] bg-[#dde1ff] px-1.5 rounded">
                T10
              </span>
            </div>
          </div>
        </section>

        {/* =========================================
            Top Categories List 
            ========================================= */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
            Hạng mục tiêu biểu
          </h3>
          <div className="space-y-3">
            {MOCK_DATA.categories.map((cat) => (
              // DÙNG THẺ LINK ĐỂ CHUYỂN TRANG
              <Link
                href={`/analytics/${cat.id}`}
                key={cat.id}
                className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-[#e2e2e7]/50 hover:border-[#dde1ff] transition-colors cursor-pointer block"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${cat.bgClass} flex items-center justify-center ${cat.colorClass}`}
                  >
                    <span className="material-symbols-outlined">
                      {cat.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-[#1a1c1f] text-sm">
                      {cat.name}
                    </p>
                    <p className="text-xs text-[#616470] mt-0.5">
                      {cat.txCount} giao dịch
                    </p>
                  </div>
                </div>
                <span className="font-headline font-bold text-[#1a1c1f]">
                  {formatCurrency(cat.amount)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
