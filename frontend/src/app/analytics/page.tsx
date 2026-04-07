"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

// =======================================================================
// 1. DỮ LIỆU GIẢ LẬP (MOCK DATA)
// =======================================================================
const CATEGORIES_DATA = [
  {
    id: "cat_food",
    name: "Ăn uống & Cà phê",
    amount: 5602000,
    txCount: 42,
    icon: "restaurant",
    color: "#4b5b9a",
    bgClass: "bg-[#4b5b9a]/10",
  },
  {
    id: "cat_edu",
    name: "Học phí & Khóa học",
    amount: 3112000,
    txCount: 3,
    icon: "school",
    color: "#c5a344",
    bgClass: "bg-[#c5a344]/10",
  },
  {
    id: "cat_transport",
    name: "Di chuyển",
    amount: 1230000,
    txCount: 15,
    icon: "directions_bus",
    color: "#c3c6d4",
    bgClass: "bg-[#c3c6d4]/20",
  },
  {
    id: "cat_shop",
    name: "Mua sắm",
    amount: 2500000,
    txCount: 8,
    icon: "shopping_bag",
    color: "#94a3e8",
    bgClass: "bg-[#94a3e8]/10",
  },
];

const TREND_DATA = {
  week: [
    { label: "T2", amount: 120000 },
    { label: "T3", amount: 450000 },
    { label: "T4", amount: 300000 },
    { label: "T5", amount: 800000 },
    { label: "T6", amount: 200000 },
    { label: "T7", amount: 1200000 },
    { label: "CN", amount: 950000 },
  ],
  month: [
    { label: "T1", amount: 4200000 },
    { label: "T2", amount: 3800000 },
    { label: "T3", amount: 5100000 },
    { label: "T4", amount: 4500000 },
    { label: "T5", amount: 3200000 },
    { label: "T6", amount: 2800000 },
    { label: "T7", amount: 6100000 },
    { label: "T8", amount: 4900000 },
    { label: "T9", amount: 7200000 },
    { label: "T10", amount: 8500000 },
    { label: "T11", amount: 9200000 },
    { label: "T12", amount: 12450000 },
  ],
  quarter: [
    { label: "Q1", amount: 15000000 },
    { label: "Q2", amount: 18500000 },
    { label: "Q3", amount: 12000000 },
    { label: "Q4", amount: 24000000 },
  ],
  year: [
    { label: "2022", amount: 110000000 },
    { label: "2023", amount: 145000000 },
    { label: "2024", amount: 168000000 },
    { label: "2025", amount: 192000000 },
    { label: "2026", amount: 45000000 },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

// =======================================================================
// 2. COMPONENT CHÍNH
// =======================================================================
export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] =
    useState<keyof typeof TREND_DATA>("month");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentTrend = TREND_DATA[timeFilter];

  // Tự động chọn cột cuối cùng và cuộn sang phải khi đổi filter
  useEffect(() => {
    const lastIndex = currentTrend.length - 1;
    setSelectedIndex(lastIndex);

    if (scrollRef.current) {
      // Timeout nhẹ để chờ DOM render xong các cột mới
      setTimeout(() => {
        scrollRef.current!.scrollLeft = scrollRef.current!.scrollWidth;
      }, 100);
    }
  }, [timeFilter, currentTrend]);

  // Tính toán dữ liệu thực
  const currentTotal = useMemo(
    () => CATEGORIES_DATA.reduce((sum, c) => sum + c.amount, 0),
    []
  );
  const maxInTrend = Math.max(...currentTrend.map((d) => d.amount));
  const sortedTrend = [...currentTrend].sort((a, b) => a.amount - b.amount);
  const minItem = sortedTrend[0];
  const maxItem = sortedTrend[sortedTrend.length - 1];
  const unitLabel =
    timeFilter === "week"
      ? "Thứ"
      : timeFilter === "month"
      ? "Tháng"
      : timeFilter === "quarter"
      ? "Quý"
      : "Năm";

  // Tính toán cho Pie Chart đặc
  const pieSlices = useMemo(() => {
    let cumulativePercent = 0;
    return CATEGORIES_DATA.map((cat) => {
      const percent = (cat.amount / currentTotal) * 100;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      return { ...cat, startPercent, percent };
    });
  }, [currentTotal]);

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-32 relative min-h-screen bg-[#f9f9fe]">
      <TopBar />

      <div className="space-y-8 mt-4">
        {/* TỔNG CHI TIÊU THÁNG NÀY */}
        <section className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[#616470] font-bold text-[10px] uppercase tracking-widest opacity-70">
              Tổng chi tiêu tháng này
            </p>
            <h1 className="text-4xl font-black font-headline text-[#4b5b9a] tracking-tight">
              {formatCurrency(currentTotal)}
            </h1>
          </div>
          <div className="bg-[#ba1a1a]/10 px-3 py-1.5 rounded-xl flex items-center gap-1 border border-[#ba1a1a]/10">
            <span className="material-symbols-outlined text-[#ba1a1a] text-sm">
              trending_up
            </span>
            <span className="text-[#ba1a1a] font-black text-xs">+12%</span>
          </div>
        </section>

        {/* BIỂU ĐỒ HÌNH TRÒN ĐẶC */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-[#e2e2e7]/60 shadow-sm space-y-6">
          <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
            Phân bổ chi tiêu
          </h3>

          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 drop-shadow-2xl">
              <svg
                viewBox="0 0 32 32"
                className="w-full h-full transform -rotate-90 rounded-full"
              >
                {pieSlices.map((slice) => (
                  <circle
                    key={slice.id}
                    cx="16"
                    cy="16"
                    r="16"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="32"
                    strokeDasharray={`${slice.percent} 100`}
                    strokeDashoffset={-slice.startPercent}
                    className="transition-all duration-700 ease-in-out"
                  />
                ))}
              </svg>
            </div>

            {/* Chú thích Hạng mục */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full mt-8 border-t border-[#f3f3f8] pt-6 px-2">
              {CATEGORIES_DATA.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="text-[11px] font-bold text-[#454650] truncate">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* XU HƯỚNG CHI TIÊU (BAR CHART CUỘN NGANG) */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
              Xu hướng chi tiêu
            </h3>
            <div className="flex bg-[#ededf2] p-1 rounded-xl scale-90 shadow-inner">
              {(["week", "month", "quarter", "year"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    timeFilter === f
                      ? "bg-white text-[#4b5b9a] shadow-sm"
                      : "text-[#767681]"
                  }`}
                >
                  {f === "week"
                    ? "Tuần"
                    : f === "month"
                    ? "Tháng"
                    : f === "quarter"
                    ? "Quý"
                    : "Năm"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#e2e2e7]/60 rounded-[2.5rem] shadow-sm relative overflow-hidden h-72 flex flex-col justify-end">
            {/* Vùng cuộn ngang tự động scroll về bên phải */}
            <div
              ref={scrollRef}
              className="overflow-x-auto flex items-end gap-4 px-8 pb-6 scroll-smooth scrollbar-hide w-full"
            >
              {currentTrend.map((data, index) => {
                const barHeight = (data.amount / maxInTrend) * 140;
                const isSelected = selectedIndex === index;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-3 shrink-0 cursor-pointer transition-all"
                    style={{ width: currentTrend.length > 6 ? "46px" : "16%" }}
                    onClick={() => setSelectedIndex(index)}
                  >
                    {/* Tooltip số tiền */}
                    <div
                      className={`absolute top-6 left-0 right-0 text-center transition-all duration-300 ${
                        isSelected
                          ? "opacity-100 translate-y-0 scale-100"
                          : "opacity-0 translate-y-2 scale-90 pointer-events-none"
                      }`}
                    >
                      <span className="bg-[#1a1c1f] text-white text-[9px] font-black px-3 py-1.5 rounded-full whitespace-nowrap shadow-xl">
                        {data.label}: {formatCurrency(data.amount)}
                      </span>
                    </div>

                    {/* Thanh biểu đồ */}
                    <div
                      className={`w-full rounded-t-xl transition-all duration-500 ease-out ${
                        isSelected
                          ? "bg-gradient-to-t from-[#4b5b9a] to-[#94a3e8] shadow-lg shadow-[#4b5b9a]/30 scale-x-105"
                          : "bg-[#e2e2e7] hover:bg-[#dde1ff]"
                      }`}
                      style={{ height: `${barHeight}px` }}
                    ></div>

                    {/* Nhãn nhãn */}
                    <span
                      className={`text-[10px] font-black transition-all ${
                        isSelected
                          ? "text-[#4b5b9a] bg-[#dde1ff] px-2.5 py-0.5 rounded-full scale-110"
                          : "text-[#616470]"
                      }`}
                    >
                      {data.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Grid Line trang trí */}
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.4))] -z-0 pointer-events-none"></div>
          </div>

          {/* THỐNG KÊ NHIỀU NHẤT / ÍT NHẤT */}
          <div className="grid grid-cols-2 gap-3 px-1">
            <div className="bg-[#f3f3f8] p-4 rounded-2xl border border-[#e2e2e7]/30">
              <p className="text-[10px] font-black text-[#616470] uppercase tracking-widest mb-1">
                {unitLabel} cao nhất
              </p>
              <p className="text-sm font-black text-[#1a1c1f]">
                {maxItem.label}:{" "}
                <span className="text-[#ba1a1a]">
                  {formatCurrency(maxItem.amount)}
                </span>
              </p>
            </div>
            <div className="bg-[#f3f3f8] p-4 rounded-2xl border border-[#e2e2e7]/30">
              <p className="text-[10px] font-black text-[#616470] uppercase tracking-widest mb-1">
                {unitLabel} thấp nhất
              </p>
              <p className="text-sm font-black text-[#1a1c1f]">
                {minItem.label}:{" "}
                <span className="text-[#10b981]">
                  {formatCurrency(minItem.amount)}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* DANH SÁCH CHI TIẾT HẠNG MỤC */}
        <section className="space-y-4 pb-4">
          <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
            Chi tiết theo hạng mục
          </h3>
          <div className="space-y-3">
            {CATEGORIES_DATA.map((cat) => (
              <Link
                href={`/analytics/${cat.id}`}
                key={cat.id}
                className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-[#e2e2e7]/50 hover:border-[#4b5b9a] transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${cat.bgClass} flex items-center justify-center transition-colors group-hover:bg-[#dde1ff]`}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ color: cat.color }}
                    >
                      {cat.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1a1c1f] text-sm group-hover:text-[#4b5b9a] truncate">
                      {cat.name}
                    </p>
                    <p className="text-[10px] text-[#616470] font-medium mt-0.5">
                      {cat.txCount} giao dịch
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-headline font-bold text-[#1a1c1f]">
                    {formatCurrency(cat.amount)}
                  </p>
                  <p className="text-[9px] font-bold text-[#767681] uppercase tracking-tighter">
                    Chiếm {Math.round((cat.amount / currentTotal) * 100)}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
