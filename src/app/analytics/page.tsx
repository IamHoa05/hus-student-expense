"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import { toast } from "sonner";

// =======================================================================
// 1. BẢNG MÀU CÓ SẴN
// =======================================================================
const COLOR_PALETTE = [
  "#4b5b9a",
  "#94a3e8",
  "#ba1a1a",
  "#c5a344",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#f97316",
];

// =======================================================================
// 2. HÀM XỬ LÝ NGÀY THÁNG VÀ CHU KỲ (RESET 1/1 VÀ 1/7)
// =======================================================================

const getStartOfCurrentCycle = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  if (month >= 6) {
    return new Date(year, 6, 1); // 1/7
  }
  return new Date(year, 0, 1); // 1/1
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

const formatShortDate = (date: Date) => {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}/${m}`;
};

const generateDays = (startDate: Date, endDate: Date) => {
  const days = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    days.push({
      label: formatShortDate(current),
      value: `day_${current.getFullYear()}_${
        current.getMonth() + 1
      }_${current.getDate()}`,
      dateObj: new Date(current),
    });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const generateWeeks = (startDate: Date, endDate: Date) => {
  const weeks = [];
  let currentStart = new Date(startDate);

  while (currentStart <= endDate) {
    let currentEnd = new Date(currentStart);
    const dayOfWeek = currentEnd.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    currentEnd.setDate(currentEnd.getDate() + daysUntilSunday);

    if (currentEnd > endDate) {
      currentEnd = new Date(endDate);
    }

    weeks.push({
      label: `${formatShortDate(currentStart)}-${formatShortDate(currentEnd)}`,
      value: `week_${currentStart.getFullYear()}_${
        currentStart.getMonth() + 1
      }_${currentStart.getDate()}`,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
    });

    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  return weeks;
};

const generateMonths = (startDate: Date, endDate: Date) => {
  const months = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= endMonth) {
    months.push({
      label: `T${current.getMonth() + 1}`,
      value: `month_${current.getFullYear()}_${current.getMonth() + 1}`,
      year: current.getFullYear(),
      month: current.getMonth() + 1,
    });
    current.setMonth(current.getMonth() + 1);
  }
  return months;
};

// =======================================================================
// 3. DỮ LIỆU GIẢ LẬP (MOCK DATA)
// =======================================================================

const categoryData: Record<string, any> = {
  cat_food: {
    name: "Ăn uống",
    icon: "restaurant",
    baseAmount: 500000,
    variation: 0.3,
  },
  cat_edu: {
    name: "Học tập",
    icon: "school",
    baseAmount: 300000,
    variation: 0.5,
  },
  cat_transport: {
    name: "Di chuyển",
    icon: "directions_bus",
    baseAmount: 150000,
    variation: 0.25,
  },
  cat_shop: {
    name: "Mua sắm",
    icon: "shopping_bag",
    baseAmount: 250000,
    variation: 0.35,
  },
  cat_bill: {
    name: "Hóa đơn",
    icon: "receipt",
    baseAmount: 100000,
    variation: 0.15,
  },
  cat_health: {
    name: "Sức khỏe",
    icon: "favorite",
    baseAmount: 50000,
    variation: 0.2,
  },
};

const generateMockDataForPeriod = (periodValue: string) => {
  const seed = periodValue;
  const random = (min: number, max: number) => {
    const hash = seed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const r = ((hash * 9301 + 49297) % 233280) / 233280;
    return min + r * (max - min);
  };

  const categories = Object.keys(categoryData).map((id) => {
    const cat = categoryData[id];
    const variation = 0.5 + random(0, 1) * cat.variation;
    const amount = Math.floor(cat.baseAmount * variation);
    const txCount = Math.floor(random(1, 15));

    return {
      id,
      name: cat.name,
      icon: cat.icon,
      amount: amount,
      txCount: txCount,
    };
  });

  return categories;
};

const getTotalAmountForPeriod = (periodValue: string) => {
  const categories = generateMockDataForPeriod(periodValue);
  return categories.reduce((sum, cat) => sum + cat.amount, 0);
};

// =======================================================================
// 4. COMPONENT CHÍNH
// =======================================================================
export default function AnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">(
    "week"
  );
  const [selectedPeriodValue, setSelectedPeriodValue] = useState<string>("");
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState<string>("");

  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const lastBarRef = useRef<HTMLDivElement>(null);

  const trendTimeline = useMemo(() => {
    const now = new Date();
    const cycleStart = getStartOfCurrentCycle(now);

    let timeline: { label: string; value: string; [key: string]: any }[] = [];
    if (timeFilter === "day") {
      timeline = generateDays(cycleStart, now);
    } else if (timeFilter === "week") {
      timeline = generateWeeks(cycleStart, now);
    } else if (timeFilter === "month") {
      timeline = generateMonths(cycleStart, now);
    }

    return timeline.map((item) => ({
      ...item,
      amount: getTotalAmountForPeriod(item.value),
    }));
  }, [timeFilter]);

  useEffect(() => {
    if (trendTimeline.length > 0) {
      const latest = trendTimeline[trendTimeline.length - 1];
      setSelectedPeriodValue(latest.value);
      setSelectedPeriodLabel(latest.label);
    }
  }, [trendTimeline]);

  // 🔥 SỬA LỖI CUỘN: Tắt behavior smooth, dùng auto để nhảy tức thì ngay lặp tức
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lastBarRef.current) {
        lastBarRef.current.scrollIntoView({
          behavior: "auto", // Dịch chuyển tức thời, không trượt
          block: "nearest",
          inline: "end",
        });
      }
    }, 10); // Rút ngắn thời gian để mắt người không kịp thấy sự xê dịch

    return () => clearTimeout(timeoutId);
  }, [trendTimeline, timeFilter]);

  // =======================================================================
  // LOGIC CHI TIẾT CỦA KỲ ĐƯỢC CHỌN (SELECTED PERIOD)
  // =======================================================================

  const selectedCategoriesData = useMemo(() => {
    if (!selectedPeriodValue) return [];
    const rawCategories = generateMockDataForPeriod(selectedPeriodValue);

    return rawCategories.map((cat, index) => ({
      ...cat,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
      bgClass: "bg-opacity-10",
    }));
  }, [selectedPeriodValue]);

  const selectedTotalAmount = useMemo(() => {
    return selectedCategoriesData.reduce((sum, c) => sum + (c.amount || 0), 0);
  }, [selectedCategoriesData]);

  const maxInTrend = Math.max(...trendTimeline.map((d) => d.amount || 0), 1);
  const sortedTrend = [...trendTimeline].sort(
    (a, b) => (a.amount || 0) - (b.amount || 0)
  );
  const minItem = sortedTrend.length > 0 ? sortedTrend[0] : null;
  const maxItem =
    sortedTrend.length > 0 ? sortedTrend[sortedTrend.length - 1] : null;

  // =======================================================================
  // BIỂU ĐỒ TRÒN (PIE CHART) CHO KỲ ĐƯỢC CHỌN
  // =======================================================================
  const pieSlices = useMemo(() => {
    if (selectedTotalAmount === 0) return [];
    let cumulativePercent = 0;

    return selectedCategoriesData.map((cat) => {
      const percent = ((cat.amount || 0) / selectedTotalAmount) * 100;
      const startAngle = (cumulativePercent / 100) * 360;
      const endAngle = ((cumulativePercent + percent) / 100) * 360;
      cumulativePercent += percent;

      return {
        ...cat,
        percent,
        startAngle,
        endAngle,
      };
    });
  }, [selectedCategoriesData, selectedTotalAmount]);

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
        {/* Header Hiển thị Tổng Tiền của Kỳ đang chọn */}
        <section className="space-y-1">
          <p className="text-[#616470] font-bold text-[9px] uppercase tracking-widest opacity-70">
            Chi tiêu ({selectedPeriodLabel})
          </p>
          <h1 className="text-4xl font-black font-headline text-[#4b5b9a] tracking-tight">
            {formatCurrency(selectedTotalAmount)}
          </h1>
        </section>

        {/* XU HƯỚNG CHI TIÊU (STICKY) */}
        <section className="space-y-3 sticky top-0 z-40 bg-[#f9f9fe] pt-2 pb-4 -mx-2 px-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-headline font-bold text-base text-[#1a1c1f]">
              Xu hướng chi tiêu
            </h3>

            {/* Filter: Ngày / Tuần / Tháng */}
            <div className="flex bg-[#ededf2] p-1 rounded-xl shadow-inner">
              {(["day", "week", "month"] as const).map((f) => {
                const labelMap = { day: "Ngày", week: "Tuần", month: "Tháng" };
                return (
                  <button
                    key={f}
                    onClick={() => setTimeFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all whitespace-nowrap focus:outline-none ${
                      timeFilter === f
                        ? "bg-white text-[#4b5b9a] shadow-sm"
                        : "text-[#767681]"
                    }`}
                  >
                    {labelMap[f]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Biểu đồ Cột */}
          <div className="bg-white border border-[#e2e2e7]/60 rounded-2xl shadow-sm relative overflow-hidden h-64 flex flex-col justify-end pt-8">
            <div
              ref={scrollRef}
              // 🔥 GỠ BỎ CLASS "scroll-smooth" Ở ĐÂY
              className="overflow-x-auto flex items-end gap-3 px-6 pb-5 scrollbar-hide w-full h-full"
            >
              {trendTimeline.map((data, index) => {
                const barHeight = ((data.amount || 0) / maxInTrend) * 120;
                const isSelected = data.value === selectedPeriodValue;
                const isLastItem = index === trendTimeline.length - 1;

                return (
                  <div
                    key={index}
                    ref={isLastItem ? lastBarRef : null}
                    className="flex flex-col items-center gap-2 shrink-0 cursor-pointer transition-all relative group"
                    style={{
                      width:
                        trendTimeline.length > 6
                          ? "55px"
                          : `${100 / trendTimeline.length}%`,
                      minWidth: "45px",
                    }}
                    onClick={() => {
                      setSelectedPeriodValue(data.value);
                      setSelectedPeriodLabel(data.label);
                    }}
                  >
                    <div
                      className={`absolute -top-7 whitespace-nowrap transition-all duration-300 origin-bottom z-10 ${
                        isSelected
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-50"
                      }`}
                    >
                      <span className="text-[10px] font-black text-[#4b5b9a] bg-[#dde1ff] px-2 py-1 rounded-lg shadow-sm border border-[#4b5b9a]/20">
                        {formatCurrency(data.amount)}
                      </span>
                    </div>

                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ease-out ${
                        isSelected
                          ? "bg-gradient-to-t from-[#4b5b9a] to-[#94a3e8] shadow-lg shadow-[#4b5b9a]/30 scale-x-105"
                          : "bg-[#e2e2e7] group-hover:bg-[#dde1ff]"
                      }`}
                      style={{ height: `${Math.max(barHeight, 4)}px` }}
                    ></div>

                    <span
                      className={`text-[9px] font-black transition-all text-center ${
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

          {/* Thống kê Cao nhất / Thấp nhất */}
          <div className="grid grid-cols-2 gap-2.5 px-1">
            <div className="bg-[#f3f3f8] p-3 rounded-xl flex flex-col justify-between">
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
            <div className="bg-[#f3f3f8] p-3 rounded-xl flex flex-col justify-between">
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

        {/* BIỂU ĐỒ TRÒN - Phân bổ chi tiêu */}
        {selectedTotalAmount > 0 && (
          <section className="bg-white p-5 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
            <h3 className="font-headline font-bold text-base text-[#1a1c1f] mb-4">
              Phân bổ chi tiêu - {selectedPeriodLabel}
            </h3>

            <div className="flex flex-col items-center">
              <div ref={pieRef} className="relative w-56 h-56">
                <svg
                  viewBox="0 0 40 40"
                  className="w-full h-full transform -rotate-90"
                >
                  {pieSlices.map((slice) => {
                    const isHovered = hoveredSliceId === slice.id;
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

                {/* Tooltip Hover */}
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
                        {formatCurrency(hoveredSlice.amount || 0)}
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
                {selectedCategoriesData.map((cat) => (
                  <button
                    key={cat.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#f3f3f8] transition-colors focus:outline-none"
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
        )}

        {/* DANH SÁCH HẠNG MỤC */}
        <section className="space-y-3 pb-2">
          <h3 className="font-headline font-bold text-base text-[#1a1c1f]">
            Chi tiết hạng mục - {selectedPeriodLabel}
          </h3>

          {selectedTotalAmount === 0 ? (
            <div className="text-center py-8 text-[#767681] text-sm font-bold bg-white rounded-2xl border border-[#e2e2e7]/50">
              Không có dữ liệu chi tiêu.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCategoriesData.map((cat) => {
                const percent = ((cat.amount || 0) / selectedTotalAmount) * 100;

                return (
                  <Link
                    href={`/analytics/${cat.id}?periodValue=${selectedPeriodValue}&timeFilter=${timeFilter}`}
                    key={cat.id}
                    className="bg-white p-3.5 rounded-xl flex items-center justify-between shadow-sm border border-[#e2e2e7]/50 hover:border-[#4b5b9a] transition-all group active:scale-[0.98] focus:outline-none"
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
                          {cat.txCount || 0} giao dịch
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-headline font-bold text-xs text-[#1a1c1f]">
                        {formatCurrency(cat.amount || 0)}
                      </p>
                      <p className="text-[8px] font-bold text-[#767681]">
                        {percent.toFixed(1)}%
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
