"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// =======================================================================
// BẢNG MÀU CÓ SẴN (Cho Biểu đồ tròn)
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

// =======================================================================
// COMPONENT CHÍNH
// =======================================================================
export default function AnalyticsPage() {
  const [isMounted, setIsMounted] = useState(false);

  // States chọn thời gian
  const [timeFilter, setTimeFilter] = useState<"day" | "week" | "month">("day");
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState<string>("");

  // States API
  const [trendTimeline, setTrendTimeline] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);

  // Tooltip & Refs
  const [hoveredSliceId, setHoveredSliceId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const pieRef = useRef<HTMLDivElement>(null);
  const lastBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. FETCH LỊCH SỬ GIAO DỊCH (Gọi 1 lần để dùng làm data cho Biểu đồ Tròn)
  useEffect(() => {
    const fetchAllTx = async () => {
      try {
        const res = await fetch(`${API_URL}/transactions`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const txPayload = await res.json();

        let txGroups = [];
        if (txPayload?.data?.data && Array.isArray(txPayload.data.data)) {
          txGroups = txPayload.data.data;
        } else if (txPayload?.data && Array.isArray(txPayload.data)) {
          txGroups = txPayload.data;
        } else if (Array.isArray(txPayload)) {
          txGroups = txPayload;
        }

        const flatTx = txGroups.flatMap(
          (group: any) => group.transactions || group
        );

        // Map ra format chuẩn có Date object để dễ filter
        const parsedTx = flatTx.map((t: any) => {
          const d = new Date(
            t.transaction_date || t.created_at || t.createdAt || Date.now()
          );
          return {
            categoryId: String(t.category_id || "other"),
            categoryName: t.category_name || "Khác",
            icon: t.icon || "category",
            amount: Number(t.amount ?? t.total_amount ?? 0),
            type: t.transaction_type === "inflow" ? "income" : "expense",
            dateObj: d,
            // Format ra string "03/06" hoặc "T6" để so sánh với label của Cột
            dayStr: `${d.getDate().toString().padStart(2, "0")}/${(
              d.getMonth() + 1
            )
              .toString()
              .padStart(2, "0")}`,
            monthStr: `T${d.getMonth() + 1}`,
          };
        });

        setAllTransactions(parsedTx);
      } catch (err) {
        console.error("Lỗi fetch transactions:", err);
      }
    };
    fetchAllTx();
  }, []);

  // 2. FETCH DỮ LIỆU BIỂU ĐỒ CỘT (Mỗi khi đổi Ngày/Tuần/Tháng)
  useEffect(() => {
    const fetchTrend = async () => {
      setLoadingChart(true);
      try {
        const res = await fetch(
          `${API_URL}/stats/trend?period_type=${timeFilter}`,
          {
            credentials: "include",
          }
        );
        if (res.ok) {
          const trendJson = await res.json();
          const chartArr =
            trendJson.chart_data || trendJson.data?.chart_data || [];

          const mappedChart = chartArr.map((d: any) => ({
            label: d.label,
            amount: d.total_amount || 0,
            value: d.label, // Dùng chính label làm value ("03/06", "T6", "25/05-31/05")
          }));

          setTrendTimeline(mappedChart);

          // Tự động chọn cột cuối cùng
          if (mappedChart.length > 0) {
            setSelectedPeriodLabel(mappedChart[mappedChart.length - 1].label);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch trend:", err);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchTrend();
  }, [timeFilter]);

  // Cuộn biểu đồ về cột mới nhất
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lastBarRef.current) {
        lastBarRef.current.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "end",
        });
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [trendTimeline]);

  // =======================================================================
  // LOGIC TÍNH TOÁN DỮ LIỆU CHO CỘT ĐANG CHỌN (Tạo Biểu đồ tròn)
  // =======================================================================
  const selectedCategoriesData = useMemo(() => {
    if (!selectedPeriodLabel || allTransactions.length === 0) return [];

    // B1: Lọc giao dịch tương ứng với cột thời gian đang chọn
    const filteredTx = allTransactions.filter((tx) => {
      // Chỉ tính khoản Chi (expense) cho biểu đồ tròn
      if (tx.type !== "expense") return false;

      if (timeFilter === "day") {
        return tx.dayStr === selectedPeriodLabel; // Khớp "03/06"
      } else if (timeFilter === "month") {
        return tx.monthStr === selectedPeriodLabel; // Khớp "T6"
      } else if (timeFilter === "week") {
        // Tuần có format "25/05-31/05"
        const parts = selectedPeriodLabel.split("-");
        if (parts.length === 2) {
          const [startStr, endStr] = parts;
          const y = new Date().getFullYear();

          const [sD, sM] = startStr.split("/");
          const startDate = new Date(
            y,
            parseInt(sM) - 1,
            parseInt(sD),
            0,
            0,
            0
          );

          const [eD, eM] = endStr.split("/");
          const endDate = new Date(
            y,
            parseInt(eM) - 1,
            parseInt(eD),
            23,
            59,
            59
          );

          return tx.dateObj >= startDate && tx.dateObj <= endDate;
        }
        return false;
      }
      return true;
    });

    // B2: Gom nhóm theo Danh mục
    const categoryMap = new Map();
    filteredTx.forEach((tx) => {
      const existing = categoryMap.get(tx.categoryId) || {
        id: tx.categoryId,
        name: tx.categoryName,
        icon: tx.icon,
        amount: 0,
        txCount: 0,
      };
      existing.amount += tx.amount;
      existing.txCount += 1;
      categoryMap.set(tx.categoryId, existing);
    });

    // B3: Sắp xếp giảm dần và gán màu
    const sortedCats = Array.from(categoryMap.values()).sort(
      (a, b) => b.amount - a.amount
    );
    return sortedCats.map((cat, index) => ({
      ...cat,
      color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    }));
  }, [selectedPeriodLabel, timeFilter, allTransactions]);

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
  // VẼ BIỂU ĐỒ TRÒN
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

  const contextLabelText =
    timeFilter === "day" ? "Ngày" : timeFilter === "week" ? "Tuần" : "Tháng";

  if (!isMounted) return <main className="bg-[#f9f9fe] min-h-screen"></main>;

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-4 pb-32 relative min-h-screen bg-[#f9f9fe]">
      <TopBar />

      <div className="space-y-5 mt-3 animate-in fade-in duration-500">
        {/* Header Hiển thị Tổng Tiền của Kỳ đang chọn */}
        <section className="space-y-1">
          <p className="text-[#616470] font-bold text-[9px] uppercase tracking-widest opacity-70">
            Tổng chi ({selectedPeriodLabel})
          </p>
          <h1 className="text-4xl font-black font-headline text-[#4b5b9a] tracking-tight">
            {formatCurrency(selectedTotalAmount)}
          </h1>
        </section>

        {/* XU HƯỚNG CHI TIÊU (BIỂU ĐỒ CỘT) */}
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
            {loadingChart ? (
              <div className="flex items-center justify-center h-full">
                <span className="material-symbols-outlined animate-spin text-[#4b5b9a] text-3xl">
                  autorenew
                </span>
              </div>
            ) : trendTimeline.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-[#767681] font-bold">
                Chưa có dữ liệu thống kê
              </div>
            ) : (
              <div
                ref={scrollRef}
                className="overflow-x-auto flex items-end gap-3 px-6 pb-5 scrollbar-hide w-full h-full"
              >
                {trendTimeline.map((data, index) => {
                  const barHeight = ((data.amount || 0) / maxInTrend) * 120;
                  const isSelected = data.label === selectedPeriodLabel;
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
                      onClick={() => setSelectedPeriodLabel(data.label)}
                    >
                      <div
                        className={`absolute -top-7 whitespace-nowrap transition-all duration-300 origin-bottom z-10 ${
                          isSelected
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"
                        }`}
                      >
                        <span className="text-[10px] font-black text-[#4b5b9a] bg-[#dde1ff] px-2 py-1 rounded-lg shadow-sm border border-[#4b5b9a]/20">
                          {new Intl.NumberFormat("vi-VN", {
                            notation: "compact",
                          }).format(data.amount)}
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
            )}
          </div>

          {/* Thống kê Cao nhất / Thấp nhất */}
          {!loadingChart && trendTimeline.length > 0 && (
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
          )}
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

                    // Nếu 100% thì vẽ hình tròn nguyên
                    if (slice.percent === 100) {
                      return (
                        <circle
                          key={slice.id}
                          cx="20"
                          cy="20"
                          r="18"
                          fill={slice.color}
                        />
                      );
                    }

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

        {/* DANH SÁCH HẠNG MỤC TƯƠNG ỨNG */}
        <section className="space-y-3 pb-2">
          <h3 className="font-headline font-bold text-base text-[#1a1c1f]">
            Chi tiết hạng mục - {selectedPeriodLabel}
          </h3>

          {selectedTotalAmount === 0 ? (
            <div className="text-center py-8 text-[#767681] text-sm font-bold bg-white rounded-2xl border border-[#e2e2e7]/50">
              Không có dữ liệu chi tiêu trong {contextLabelText.toLowerCase()}{" "}
              này.
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCategoriesData.map((cat) => {
                const percent = ((cat.amount || 0) / selectedTotalAmount) * 100;

                return (
                  <Link
                    href={`/analytics/${cat.id}?name=${encodeURIComponent(
                      cat.name
                    )}&timeFilter=${timeFilter}&period=${encodeURIComponent(
                      selectedPeriodLabel
                    )}`}
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
