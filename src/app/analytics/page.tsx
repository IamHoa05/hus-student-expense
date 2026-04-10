"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

// =======================================================================
// 1. BẢNG MÀU CÓ SẴN
// =======================================================================
const COLOR_PALETTE = [
  "#4b5b9a", // Xanh tím
  "#94a3e8", // Xanh nhạt
  "#ba1a1a", // Đỏ
  "#c5a344", // Vàng đất
  "#10b981", // Xanh lá
  "#f59e0b", // Cam
  "#ec4899", // Hồng
  "#8b5cf6", // Tím
  "#06b6d4", // Xanh biển
  "#ef4444", // Đỏ tươi
  "#84cc16", // Xanh lá nhạt
  "#f97316", // Cam đậm
];

// =======================================================================
// 2. DỮ LIỆU GIẢ LẬP
// =======================================================================
const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();
const getCurrentQuarter = () => Math.ceil(getCurrentMonth() / 3);

const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

// Danh sách hạng mục (chưa có màu, màu sẽ được gán ngẫu nhiên từ palette)
const CATEGORIES_RAW = [
  {
    id: "cat_food",
    name: "Ăn uống",
    amount: 5602000,
    txCount: 42,
    icon: "restaurant",
  },
  {
    id: "cat_edu",
    name: "Học tập",
    amount: 3112000,
    txCount: 3,
    icon: "school",
  },
  {
    id: "cat_transport",
    name: "Di chuyển",
    amount: 1230000,
    txCount: 15,
    icon: "directions_bus",
  },
  {
    id: "cat_shop",
    name: "Mua sắm",
    amount: 2500000,
    txCount: 8,
    icon: "shopping_bag",
  },
  {
    id: "cat_bill",
    name: "Hóa đơn",
    amount: 890000,
    txCount: 5,
    icon: "receipt",
  },
  {
    id: "cat_health",
    name: "Sức khỏe",
    amount: 450000,
    txCount: 2,
    icon: "favorite",
  },
];

// Gán màu ngẫu nhiên từ palette
const assignColors = (categories: typeof CATEGORIES_RAW) => {
  const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
  return categories.map((cat, index) => ({
    ...cat,
    color: shuffled[index % shuffled.length],
    bgClass: "bg-opacity-10",
  }));
};

// Dữ liệu xu hướng theo các khoảng thời gian
const TREND_HISTORY = {
  week: {
    "Tuần 1 (1/4-7/4)": 1850000,
    "Tuần 2 (8/4-14/4)": 2100000,
    "Tuần 3 (15/4-21/4)": 3200000,
    "Tuần này": 2800000,
  },
  month: {
    "Tháng 1": 4200000,
    "Tháng 2": 3800000,
    "Tháng 3": 5100000,
    "Tháng 4": 4500000,
    "Tháng 5": 3200000,
    "Tháng 6": 2800000,
    "Tháng 7": 6100000,
    "Tháng 8": 4900000,
    "Tháng 9": 7200000,
    "Tháng 10": 8500000,
    "Tháng 11": 9200000,
    "Tháng 12": 12450000,
  },
  quarter: {
    Q1: 15000000,
    Q2: 18500000,
    Q3: 12000000,
    Q4: 24000000,
  },
  year: {
    "2022": 110000000,
    "2023": 145000000,
    "2024": 168000000,
    "2025": 192000000,
    "2026": 45000000,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

// =======================================================================
// 3. COMPONENT CHÍNH
// =======================================================================
export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Tháng 4");
  const [categories, setCategories] = useState(() =>
    assignColors(CATEGORIES_RAW)
  );
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);

  const currentMonth = getCurrentMonth();
  const currentQuarter = getCurrentQuarter();
  const currentYear = getCurrentYear();

  // Lọc dữ liệu xu hướng theo thời gian hiện tại
  const trendData = useMemo(() => {
    const data = TREND_HISTORY[timeFilter];

    if (timeFilter === "month") {
      return Object.entries(data)
        .filter(([key]) => {
          const monthNum = parseInt(key.replace("Tháng ", ""));
          return monthNum <= currentMonth;
        })
        .map(([label, amount]) => ({ label, amount }));
    }

    if (timeFilter === "quarter") {
      return Object.entries(data)
        .filter(([key]) => {
          const quarterNum = parseInt(key.replace("Q", ""));
          return quarterNum <= currentQuarter;
        })
        .map(([label, amount]) => ({ label, amount }));
    }

    if (timeFilter === "year") {
      return Object.entries(data)
        .filter(([key]) => parseInt(key) <= currentYear)
        .map(([label, amount]) => ({ label, amount }));
    }

    return Object.entries(data).map(([label, amount]) => ({ label, amount }));
  }, [timeFilter, currentMonth, currentQuarter, currentYear]);

  // Danh sách period để chọn
  const periodOptions = useMemo(() => {
    return trendData.map((d) => d.label);
  }, [trendData]);

  // Tự động chọn period mới nhất
  useEffect(() => {
    if (trendData.length > 0) {
      setSelectedPeriod(trendData[trendData.length - 1].label);
    }
  }, [trendData]);

  // Cuộn xu hướng sang phải
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current!.scrollLeft = scrollRef.current!.scrollWidth;
      }, 100);
    }
  }, [trendData]);

  const currentTotal = useMemo(
    () => categories.reduce((sum, c) => sum + c.amount, 0),
    [categories]
  );

  const maxInTrend = Math.max(...trendData.map((d) => d.amount));
  const sortedTrend = [...trendData].sort((a, b) => a.amount - b.amount);
  const minItem = sortedTrend[0];
  const maxItem = sortedTrend[sortedTrend.length - 1];

  // Tính toán Pie Chart
  const pieSlices = useMemo(() => {
    let cumulativePercent = 0;
    return categories.map((cat) => {
      const percent = (cat.amount / currentTotal) * 100;
      const startAngle = (cumulativePercent / 100) * 360;
      const endAngle = ((cumulativePercent + percent) / 100) * 360;
      cumulativePercent += percent;
      return {
        ...cat,
        percent,
        startAngle,
        endAngle,
        startPercent: (startAngle / 360) * 100,
      };
    });
  }, [categories, currentTotal]);

  // Xử lý hover trên pie chart
  const handlePieMouseMove = (e: React.MouseEvent, sliceId: string) => {
    if (pieRef.current) {
      const rect = pieRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setHoveredSliceId(sliceId);
  };

  const hoveredSlice = pieSlices.find((s) => s.id === hoveredSliceId);

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-4 pb-32 relative min-h-screen bg-[#f9f9fe]">
      <TopBar />

      <div className="space-y-5 mt-3">
        {/* Header + Chọn thời gian xem lại */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[#616470] font-bold text-[9px] uppercase tracking-widest opacity-70">
                Chi tiêu {selectedPeriod}
              </p>
              <h1 className="text-3xl font-black font-headline text-[#4b5b9a] tracking-tight">
                {formatCurrency(currentTotal)}
              </h1>
            </div>

            {/* Dropdown chọn thời gian xem lại */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-[#e2e2e7] rounded-xl px-3 py-2 text-xs font-bold text-[#1a1c1f] focus:outline-none focus:border-[#4b5b9a]"
            >
              {periodOptions.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* BIỂU ĐỒ TRÒN - Không chữ, tooltip hiện trên slice */}
        <section className="bg-white p-5 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
          <h3 className="font-headline font-bold text-base text-[#1a1c1f] mb-4">
            Phân bổ chi tiêu
          </h3>

          <div className="flex flex-col items-center">
            {/* Pie Chart */}
            <div ref={pieRef} className="relative w-56 h-56">
              <svg
                viewBox="0 0 40 40"
                className="w-full h-full transform -rotate-90"
              >
                {pieSlices.map((slice) => {
                  const isHovered = hoveredSliceId === slice.id;

                  // Tính toán path cho slice
                  const startX =
                    20 + 18 * Math.cos((slice.startAngle * Math.PI) / 180);
                  const startY =
                    20 + 18 * Math.sin((slice.startAngle * Math.PI) / 180);
                  const endX =
                    20 + 18 * Math.cos((slice.endAngle * Math.PI) / 180);
                  const endY =
                    20 + 18 * Math.sin((slice.endAngle * Math.PI) / 180);
                  const largeArc =
                    slice.endAngle - slice.startAngle > 180 ? 1 : 0;

                  const pathData = `
                    M 20 20
                    L ${startX} ${startY}
                    A 18 18 0 ${largeArc} 1 ${endX} ${endY}
                    Z
                  `;

                  return (
                    <path
                      key={slice.id}
                      d={pathData}
                      fill={slice.color}
                      stroke="white"
                      strokeWidth="0.5"
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        opacity:
                          hoveredSliceId && hoveredSliceId !== slice.id
                            ? 0.5
                            : 1,
                        transform: isHovered ? "scale(1.02)" : "scale(1)",
                        transformOrigin: "20px 20px",
                      }}
                      onMouseMove={(e) => handlePieMouseMove(e, slice.id)}
                      onMouseLeave={() => setHoveredSliceId(null)}
                    />
                  );
                })}
              </svg>

              {/* Tooltip hiện trên slice khi hover */}
              {hoveredSlice && (
                <div
                  className="absolute pointer-events-none z-50"
                  style={{
                    left: tooltipPosition.x,
                    top: tooltipPosition.y,
                    transform: "translate(-50%, -120%)",
                  }}
                >
                  <div
                    className="px-3 py-2 rounded-xl shadow-xl border border-white/20 text-white"
                    style={{ backgroundColor: hoveredSlice.color }}
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-90">
                      {hoveredSlice.name}
                    </p>
                    <p className="text-lg font-black">
                      {hoveredSlice.percent.toFixed(1)}%
                    </p>
                    <p className="text-[9px] font-medium opacity-90">
                      {formatCurrency(hoveredSlice.amount)}
                    </p>
                  </div>
                  <div
                    className="w-2 h-2 rotate-45 mx-auto -mt-1"
                    style={{ backgroundColor: hoveredSlice.color }}
                  ></div>
                </div>
              )}
            </div>

            {/* Chú thích màu sắc */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#f3f3f8] transition-colors"
                  onMouseEnter={() => setHoveredSliceId(cat.id)}
                  onMouseLeave={() => setHoveredSliceId(null)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  ></div>
                  <span className="text-[9px] font-bold text-[#616470]">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* XU HƯỚNG CHI TIÊU */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-headline font-bold text-base text-[#1a1c1f]">
              Xu hướng chi tiêu
            </h3>

            {/* Filter thời gian: Tuần / Tháng / Quý / Năm */}
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

          <div className="bg-white border border-[#e2e2e7]/60 rounded-2xl shadow-sm relative overflow-hidden h-64 flex flex-col justify-end">
            <div
              ref={scrollRef}
              className="overflow-x-auto flex items-end gap-3 px-6 pb-5 scroll-smooth scrollbar-hide w-full"
            >
              {trendData.map((data, index) => {
                const barHeight = (data.amount / maxInTrend) * 120;
                const isSelected = data.label === selectedPeriod;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 shrink-0 cursor-pointer transition-all"
                    style={{ width: trendData.length > 6 ? "45px" : "16%" }}
                    onClick={() => setSelectedPeriod(data.label)}
                  >
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                        isSelected
                          ? "bg-gradient-to-t from-[#4b5b9a] to-[#94a3e8] shadow-lg shadow-[#4b5b9a]/30 scale-x-105"
                          : "bg-[#e2e2e7] hover:bg-[#dde1ff]"
                      }`}
                      style={{ height: `${barHeight}px` }}
                    ></div>

                    <span
                      className={`text-[9px] font-black transition-all ${
                        isSelected
                          ? "text-[#4b5b9a] bg-[#dde1ff] px-2 py-0.5 rounded-full"
                          : "text-[#616470]"
                      }`}
                    >
                      {data.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thống kê nhanh */}
          <div className="grid grid-cols-2 gap-2.5 px-1">
            <div className="bg-[#f3f3f8] p-3 rounded-xl">
              <p className="text-[9px] font-black text-[#616470] uppercase tracking-widest mb-1">
                Cao nhất
              </p>
              <p className="text-xs font-black text-[#1a1c1f]">
                {maxItem?.label}:{" "}
                <span className="text-[#ba1a1a]">
                  {formatCurrency(maxItem?.amount || 0)}
                </span>
              </p>
            </div>
            <div className="bg-[#f3f3f8] p-3 rounded-xl">
              <p className="text-[9px] font-black text-[#616470] uppercase tracking-widest mb-1">
                Thấp nhất
              </p>
              <p className="text-xs font-black text-[#1a1c1f]">
                {minItem?.label}:{" "}
                <span className="text-[#10b981]">
                  {formatCurrency(minItem?.amount || 0)}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* DANH SÁCH HẠNG MỤC */}
        <section className="space-y-3 pb-2">
          <h3 className="font-headline font-bold text-base text-[#1a1c1f]">
            Chi tiết hạng mục
          </h3>
          <div className="space-y-2">
            {categories.map((cat) => {
              const percent = ((cat.amount / currentTotal) * 100).toFixed(1);
              return (
                <Link
                  href={`/analytics/${cat.id}`}
                  key={cat.id}
                  className="bg-white p-3.5 rounded-xl flex items-center justify-between shadow-sm border border-[#e2e2e7]/50 hover:border-[#4b5b9a] transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      <span
                        className="material-symbols-outlined text-lg"
                        style={{ color: cat.color }}
                      >
                        {cat.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1c1f] text-xs group-hover:text-[#4b5b9a]">
                        {cat.name}
                      </p>
                      <p className="text-[9px] text-[#616470]">
                        {cat.txCount} giao dịch
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-xs text-[#1a1c1f]">
                      {formatCurrency(cat.amount)}
                    </p>
                    <p className="text-[8px] font-bold text-[#767681]">
                      {percent}%
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
