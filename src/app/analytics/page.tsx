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
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((days + start.getDay() + 1) / 7);
};

// Hàm tạo danh sách tuần cho một năm cụ thể
const generateWeeksForYear = (
  year: number,
  currentYear: number,
  currentDate: Date
) => {
  const weeks = [];
  const isCurrentYear = year === currentYear;

  const firstDayOfYear = new Date(year, 0, 1);
  const firstDayOfWeek = firstDayOfYear.getDay();

  let startDate = new Date(year, 0, 1);
  if (firstDayOfWeek !== 1) {
    const diff = firstDayOfWeek === 0 ? -6 : 2 - firstDayOfWeek;
    startDate.setDate(startDate.getDate() + diff);
  }

  let weekNum = 1;
  const maxDate = isCurrentYear ? currentDate : new Date(year, 11, 31);

  while (startDate <= maxDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    if (startDate <= maxDate) {
      const formatDate = (date: Date) => {
        return `${date.getDate()}/${date.getMonth() + 1}`;
      };
      weeks.push({
        label: `Tuần ${weekNum} (${formatDate(startDate)}-${formatDate(
          endDate
        )})`,
        value: `week_${year}_${weekNum}`,
        startDate: new Date(startDate),
        endDate: new Date(Math.min(endDate.getTime(), maxDate.getTime())),
        year: year,
      });
    }

    startDate.setDate(startDate.getDate() + 7);
    weekNum++;
  }

  return weeks;
};

// Hàm tạo danh sách tháng cho một năm cụ thể
const generateMonthsForYear = (
  year: number,
  currentYear: number,
  currentMonth: number
) => {
  const months = [];
  const maxMonth = year === currentYear ? currentMonth : 12;

  for (let i = 1; i <= maxMonth; i++) {
    months.push({
      label: `Tháng ${i}`,
      value: `month_${year}_${i}`,
      year: year,
      month: i,
    });
  }

  return months;
};

// Hàm tạo danh sách quý cho một năm cụ thể
const generateQuartersForYear = (
  year: number,
  currentYear: number,
  currentQuarter: number
) => {
  const quarters = [];
  const maxQuarter = year === currentYear ? currentQuarter : 4;

  for (let i = 1; i <= maxQuarter; i++) {
    quarters.push({
      label: `Q${i}`,
      value: `quarter_${year}_${i}`,
      year: year,
      quarter: i,
    });
  }

  return quarters;
};

// Dữ liệu mẫu cho các category
const categoryData: Record<string, any> = {
  cat_food: {
    name: "Ăn uống",
    icon: "restaurant",
    baseAmount: 5602000,
    variation: 0.3,
  },
  cat_edu: {
    name: "Học tập",
    icon: "school",
    baseAmount: 3112000,
    variation: 0.5,
  },
  cat_transport: {
    name: "Di chuyển",
    icon: "directions_bus",
    baseAmount: 1230000,
    variation: 0.25,
  },
  cat_shop: {
    name: "Mua sắm",
    icon: "shopping_bag",
    baseAmount: 2500000,
    variation: 0.35,
  },
  cat_bill: {
    name: "Hóa đơn",
    icon: "receipt",
    baseAmount: 890000,
    variation: 0.15,
  },
  cat_health: {
    name: "Sức khỏe",
    icon: "favorite",
    baseAmount: 450000,
    variation: 0.2,
  },
};

// Hàm tạo dữ liệu ngẫu nhiên dựa trên period
const generateMockDataForPeriod = (
  period: string,
  year: number,
  month?: number,
  quarter?: number,
  week?: number
) => {
  const seed = `${year}_${month || quarter || week || 0}`;
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
    const txCount = Math.floor(random(1, 50));

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

// Hàm lấy dữ liệu xu hướng theo timeFilter và năm
const getTrendData = (timeFilter: string, selectedYear: number) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);

  if (timeFilter === "week") {
    return generateWeeksForYear(selectedYear, currentYear, currentDate);
  }

  if (timeFilter === "month") {
    return generateMonthsForYear(selectedYear, currentYear, currentMonth);
  }

  if (timeFilter === "quarter") {
    return generateQuartersForYear(selectedYear, currentYear, currentQuarter);
  }

  if (timeFilter === "year") {
    const years = [];
    const startYear = Math.min(selectedYear, currentYear) - 2;
    const endYear = Math.max(selectedYear, currentYear);

    for (let y = startYear; y <= endYear; y++) {
      if (y <= currentYear) {
        years.push({
          label: `${y}`,
          value: `year_${y}`,
          year: y,
        });
      }
    }
    return years;
  }

  return [];
};

// Hàm lấy tổng chi tiêu cho một period
const getTotalAmountForPeriod = (
  periodValue: string,
  year: number,
  month?: number,
  quarter?: number,
  week?: number
) => {
  const categories = generateMockDataForPeriod(
    periodValue,
    year,
    month,
    quarter,
    week
  );
  return categories.reduce((sum, cat) => sum + cat.amount, 0);
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
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedPeriodValue, setSelectedPeriodValue] = useState<string>("");
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);

  // Lấy danh sách năm có sẵn
  const availableYears = useMemo(() => {
    const currentYear = getCurrentYear();
    const years = [];
    for (let y = currentYear - 3; y <= currentYear; y++) {
      years.push(y);
    }
    return years;
  }, []);

  // Dữ liệu xu hướng theo thời gian
  const trendData = useMemo(() => {
    return getTrendData(timeFilter, selectedYear);
  }, [timeFilter, selectedYear]);

  // Tạo dữ liệu amount cho trend data
  const trendDataWithAmount = useMemo(() => {
    return trendData.map((data) => {
      let amount = 0;
      if (timeFilter === "week") {
        const weekMatch = data.value.match(/week_(\d+)_(\d+)/);
        if (weekMatch) {
          const year = parseInt(weekMatch[1]);
          const week = parseInt(weekMatch[2]);
          amount = getTotalAmountForPeriod(
            `week_${week}`,
            year,
            undefined,
            undefined,
            week
          );
        }
      } else if (timeFilter === "month") {
        const monthMatch = data.value.match(/month_(\d+)_(\d+)/);
        if (monthMatch) {
          const year = parseInt(monthMatch[1]);
          const month = parseInt(monthMatch[2]);
          amount = getTotalAmountForPeriod(`month_${month}`, year, month);
        }
      } else if (timeFilter === "quarter") {
        const quarterMatch = data.value.match(/quarter_(\d+)_(\d+)/);
        if (quarterMatch) {
          const year = parseInt(quarterMatch[1]);
          const quarter = parseInt(quarterMatch[2]);
          amount = getTotalAmountForPeriod(
            `quarter_${quarter}`,
            year,
            undefined,
            quarter
          );
        }
      } else if (timeFilter === "year") {
        const year = parseInt(data.label);
        amount = getTotalAmountForPeriod(`year_${year}`, year);
      }
      return { ...data, amount };
    });
  }, [trendData, timeFilter]);

  // Dữ liệu categories theo period được chọn
  const categoriesData = useMemo(() => {
    let year = selectedYear;
    let month: number | undefined;
    let quarter: number | undefined;
    let week: number | undefined;

    if (timeFilter === "month" && selectedPeriodValue) {
      const match = selectedPeriodValue.match(/month_(\d+)_(\d+)/);
      if (match) {
        year = parseInt(match[1]);
        month = parseInt(match[2]);
      }
    } else if (timeFilter === "quarter" && selectedPeriodValue) {
      const match = selectedPeriodValue.match(/quarter_(\d+)_(\d+)/);
      if (match) {
        year = parseInt(match[1]);
        quarter = parseInt(match[2]);
      }
    } else if (timeFilter === "week" && selectedPeriodValue) {
      const match = selectedPeriodValue.match(/week_(\d+)_(\d+)/);
      if (match) {
        year = parseInt(match[1]);
        week = parseInt(match[2]);
      }
    } else if (timeFilter === "year" && selectedPeriodValue) {
      const match = selectedPeriodValue.match(/year_(\d+)/);
      if (match) {
        year = parseInt(match[1]);
      }
    }

    const rawCategories = generateMockDataForPeriod(
      timeFilter,
      year,
      month,
      quarter,
      week
    );

    const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
    return rawCategories.map((cat, index) => ({
      ...cat,
      color: shuffled[index % shuffled.length],
      bgClass: "bg-opacity-10",
    }));
  }, [selectedPeriodValue, timeFilter, selectedYear]);

  // Tự động chọn period mới nhất khi change year hoặc timeFilter
  useEffect(() => {
    if (trendDataWithAmount.length > 0) {
      const latest = trendDataWithAmount[trendDataWithAmount.length - 1];
      setSelectedPeriod(latest.label);
      setSelectedPeriodValue(latest.value);
    }
  }, [trendDataWithAmount]);

  // Cuộn xu hướng sang phải
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current!.scrollLeft = scrollRef.current!.scrollWidth;
      }, 100);
    }
  }, [trendDataWithAmount]);

  const currentTotal = useMemo(
    () => categoriesData.reduce((sum, c) => sum + (c.amount || 0), 0),
    [categoriesData]
  );

  const maxInTrend = Math.max(...trendDataWithAmount.map((d) => d.amount || 0));
  const sortedTrend = [...trendDataWithAmount].sort(
    (a, b) => (a.amount || 0) - (b.amount || 0)
  );
  const minItem = sortedTrend[0];
  const maxItem = sortedTrend[sortedTrend.length - 1];

  // Tính toán Pie Chart
  const pieSlices = useMemo(() => {
    let cumulativePercent = 0;
    return categoriesData.map((cat) => {
      const percent = ((cat.amount || 0) / currentTotal) * 100;
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
  }, [categoriesData, currentTotal]);

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

  // Hàm lấy dữ liệu chi tiết cho category theo period
  const getCategoryDetailData = (categoryId: string) => {
    const category = categoriesData.find((c) => c.id === categoryId);
    return category || { amount: 0, txCount: 0, name: "", icon: "" };
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-4 pb-32 relative min-h-screen bg-[#f9f9fe]">
      <TopBar />

      <div className="space-y-5 mt-3">
        {/* Header + Chọn thời gian xem lại */}
        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1 flex-1">
              <p className="text-[#616470] font-bold text-[9px] uppercase tracking-widest opacity-70">
                Chi tiêu {selectedPeriod} {selectedYear !== getCurrentYear()}
              </p>
              <h1 className="text-3xl font-black font-headline text-[#4b5b9a] tracking-tight">
                {formatCurrency(currentTotal)}
              </h1>
            </div>

            {/* Chọn năm - đưa lên góc phải */}
            <select
              value={selectedYear}
              onChange={(e) => {
                const newYear = parseInt(e.target.value);
                setSelectedYear(newYear);
              }}
              className="bg-white border border-[#e2e2e7] rounded-xl px-3 py-2 text-xs font-bold text-[#1a1c1f] focus:outline-none focus:border-[#4b5b9a]"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown chọn tuần/tháng */}
          <div className="flex justify-end">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                const selected = trendDataWithAmount.find(
                  (d) => d.label === e.target.value
                );
                setSelectedPeriod(e.target.value);
                if (selected) {
                  setSelectedPeriodValue(selected.value);
                }
              }}
              className="bg-white border border-[#e2e2e7] rounded-xl px-3 py-2 text-xs font-bold text-[#1a1c1f] focus:outline-none focus:border-[#4b5b9a] min-w-[140px]"
            >
              {trendDataWithAmount.map((period) => (
                <option key={period.value} value={period.label}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* XU HƯỚNG CHI TIÊU (ĐÃ GẮN STICKY) */}
        <section className="space-y-3 sticky top-0 z-40 bg-[#f9f9fe] pt-2 pb-4 -mx-2 px-2">
          <h3 className="font-headline font-bold text-base text-[#1a1c1f] px-1">
            Xu hướng chi tiêu
          </h3>

          {/* Filter thời gian: Tuần / Tháng / Quý / Năm - Đã chuyển xuống đây & Bỏ chữ "Theo" */}
          <div className="flex justify-center bg-[#ededf2] p-1 rounded-xl shadow-inner">
            {(["week", "month", "quarter", "year"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase transition-all whitespace-nowrap ${
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

          <div className="bg-white border border-[#e2e2e7]/60 rounded-2xl shadow-sm relative overflow-hidden h-64 flex flex-col justify-end">
            <div
              ref={scrollRef}
              className="overflow-x-auto flex items-end gap-3 px-6 pb-5 scroll-smooth scrollbar-hide w-full"
            >
              {trendDataWithAmount.map((data, index) => {
                const barHeight = ((data.amount || 0) / maxInTrend) * 120;
                const isSelected = data.label === selectedPeriod;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 shrink-0 cursor-pointer transition-all"
                    style={{
                      width: trendDataWithAmount.length > 6 ? "55px" : "16%",
                    }}
                    onClick={() => {
                      setSelectedPeriod(data.label);
                      setSelectedPeriodValue(data.value);
                    }}
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

        {/* BIỂU ĐỒ TRÒN - Phân bổ chi tiêu */}
        <section className="bg-white p-5 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
          <h3 className="font-headline font-bold text-base text-[#1a1c1f] mb-4">
            Phân bổ chi tiêu - {selectedPeriod}
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
              {categoriesData.map((cat) => (
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

        {/* DANH SÁCH HẠNG MỤC */}
        <section className="space-y-3 pb-2">
          <h3 className="font-headline font-bold text-base text-[#1a1c1f]">
            Chi tiết hạng mục - {selectedPeriod}
          </h3>
          <div className="space-y-2">
            {categoriesData.map((cat) => {
              const percent = ((cat.amount || 0) / currentTotal) * 100;
              const detailData = getCategoryDetailData(cat.id);

              return (
                <Link
                  href={`/analytics/${cat.id}?period=${encodeURIComponent(
                    selectedPeriod
                  )}&timeFilter=${timeFilter}&periodValue=${selectedPeriodValue}&year=${selectedYear}`}
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
                        {detailData.txCount || 0} giao dịch
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-xs text-[#1a1c1f]">
                      {formatCurrency(detailData.amount || 0)}
                    </p>
                    <p className="text-[8px] font-bold text-[#767681]">
                      {percent.toFixed(1)}%
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
