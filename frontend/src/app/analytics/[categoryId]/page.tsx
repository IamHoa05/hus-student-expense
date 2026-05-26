"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

const formatCompact = (num: number) => {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "Tr";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
};

const formatShortDate = (date: Date) => {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${d}/${m}`;
};

// =======================================================================
// 1. DỮ LIỆU GIAO DỊCH GIẢ LẬP
// =======================================================================
const MOCK_TRANSACTIONS = [
  {
    id: "1",
    title: "Cơm tấm Sà Bì Chưởng",
    date: "11/04/2026",
    amount: 250000,
    dayValue: "day_2026_4_11",
  },
  {
    id: "2",
    title: "Trà đào Phúc Long",
    date: "11/04/2026",
    amount: 55000,
    dayValue: "day_2026_4_11",
  },
  {
    id: "3",
    title: "Cà phê Highlands",
    date: "10/04/2026",
    amount: 80000,
    dayValue: "day_2026_4_10",
  },
  {
    id: "4",
    title: "Ăn lẩu Haidilao",
    date: "09/04/2026",
    amount: 420000,
    dayValue: "day_2026_4_9",
  },
  {
    id: "5",
    title: "Bánh mì buổi sáng",
    date: "08/04/2026",
    amount: 30000,
    dayValue: "day_2026_4_8",
  },
  {
    id: "6",
    title: "Trà sữa Phê La",
    date: "07/04/2026",
    amount: 120000,
    dayValue: "day_2026_4_7",
  },
  {
    id: "7",
    title: "Mua giáo trình",
    date: "06/04/2026",
    amount: 150000,
    dayValue: "day_2026_4_6",
  },
  {
    id: "8",
    title: "Tiền gửi xe",
    date: "05/04/2026",
    amount: 10000,
    dayValue: "day_2026_4_5",
  },
];

// =======================================================================
// 2. HÀM TẠO DỮ LIỆU BIỂU ĐỒ (ĐÃ THÊM LOGIC CỦA TUẦN VÀ THÁNG)
// =======================================================================
const generateChartDataForPeriod = (
  periodValue: string,
  timeFilter: string
) => {
  const chartData = [];
  const today = new Date();

  if (timeFilter === "week") {
    // Tách chuỗi week_2026_4_6 (Năm_Tháng_Ngày bắt đầu tuần)
    const match = periodValue.match(/week_(\d+)_(\d+)_(\d+)/);
    if (match) {
      const startDay = new Date(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3])
      );
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDay);
        d.setDate(d.getDate() + i);
        if (d > today) break;

        const dayVal = `day_${d.getFullYear()}_${
          d.getMonth() + 1
        }_${d.getDate()}`;
        const amount = MOCK_TRANSACTIONS.filter(
          (tx) => tx.dayValue === dayVal
        ).reduce((sum, tx) => sum + tx.amount, 0);

        chartData.push({
          label: formatShortDate(d),
          dateObj: d,
          amount: amount,
          value: dayVal,
        });
      }
    }
  } else if (timeFilter === "month") {
    const match = periodValue.match(/month_(\d+)_(\d+)/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        if (d > today) break;

        const dayVal = `day_${d.getFullYear()}_${
          d.getMonth() + 1
        }_${d.getDate()}`;
        const amount = MOCK_TRANSACTIONS.filter(
          (tx) => tx.dayValue === dayVal
        ).reduce((sum, tx) => sum + tx.amount, 0);

        chartData.push({
          label: formatShortDate(d),
          dateObj: d,
          amount: amount,
          value: dayVal,
        });
      }
    }
  }
  return chartData;
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const rawCategoryId = (params?.categoryId as string) || "danh-muc";
  const categoryName = rawCategoryId
    .replace(/-/g, " ")
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  const currentMonthValue = `month_${new Date().getFullYear()}_${
    new Date().getMonth() + 1
  }`;

  const periodValue = searchParams.get("periodValue") || currentMonthValue;
  const timeFilter = searchParams.get("timeFilter") || "month";

  // SỬA LỖI: Tự động đổi fallback label tùy theo chế độ đang xem
  let defaultLabel = "Tháng này";
  if (timeFilter === "day") defaultLabel = "Ngày này";
  if (timeFilter === "week") defaultLabel = "Tuần này";
  const contextLabel = searchParams.get("period") || defaultLabel;

  // STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [selectedDayValue, setSelectedDayValue] = useState<string>("");

  const lastBarRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(
    () => generateChartDataForPeriod(periodValue, timeFilter),
    [periodValue, timeFilter]
  );

  // Chọn cột ngoài cùng
  useEffect(() => {
    if (chartData.length > 0) {
      setSelectedDayValue(chartData[chartData.length - 1].value);
    }
  }, [chartData]);

  // Cuộn tức thì tới cột cuối
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (lastBarRef.current) {
        lastBarRef.current.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "end",
        });
      }
    }, 10);
    return () => clearTimeout(timeoutId);
  }, [chartData]);

  // LOGIC LỌC GIAO DỊCH
  const fullPeriodTransactions = useMemo(() => {
    let result = [...MOCK_TRANSACTIONS];

    // Tạo danh sách các ngày hợp lệ của kỳ hiện tại (từ biểu đồ hoặc chính nó nếu là ngày)
    const validDayValues =
      timeFilter === "day" ? [periodValue] : chartData.map((d) => d.value);

    // Lọc lấy toàn bộ giao dịch TRONG KỲ ĐÓ
    result = result.filter((tx) => validDayValues.includes(tx.dayValue));

    // Tìm kiếm
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((tx) => tx.title.toLowerCase().includes(q));
    }

    // Sắp xếp
    if (priceSort === "asc") result.sort((a, b) => a.amount - b.amount);
    if (priceSort === "desc") result.sort((a, b) => b.amount - a.amount);

    return result;
  }, [searchQuery, priceSort, periodValue, timeFilter, chartData]);

  const totalAmount = useMemo(() => {
    return fullPeriodTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [fullPeriodTransactions]);

  const maxAmountInChart = Math.max(...chartData.map((d) => d.amount), 1);

  return (
    // SỬA LỖI KHUNG: Trả lại cấu trúc gốc giống hệt trang Phân tích (Analytics)
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-4 pb-32 relative min-h-screen bg-[#f9f9fe]">
      {/* Header Quay lại (Không Sticky, trôi theo màn hình) */}
      <header className="flex items-center pb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full px-2 py-1 -ml-2 transition-colors active:scale-95 focus:outline-none outline-none"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
          <span className="font-headline font-bold text-lg ml-1">Quay lại</span>
        </button>
      </header>

      <div className="space-y-6 pt-2">
        <h1 className="font-headline font-bold text-2xl text-[#1a1c1f] tracking-tight px-1">
          {categoryName}
        </h1>

        {/* Khối Tổng Quan */}
        <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white p-6 rounded-2xl shadow-md shadow-[#4b5b9a]/20">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">
            Tổng chi ({contextLabel})
          </p>
          <h2 className="font-headline text-4xl font-black">
            {formatCurrency(totalAmount)}
          </h2>
          <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
            <div>
              <p className="text-[10px] opacity-80 uppercase tracking-wider">
                Số giao dịch
              </p>
              <p className="font-bold text-sm">
                {fullPeriodTransactions.length} lần
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-80 uppercase tracking-wider">
                Trung bình/ngày
              </p>
              <p className="font-bold text-sm">
                {formatCurrency(
                  Math.round(totalAmount / (chartData.length || 1))
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Biểu đồ Biến động (Không Sticky) */}
        {timeFilter !== "day" && chartData.length > 0 && (
          <section className="bg-white p-6 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
            <h3 className="font-headline font-bold text-base text-[#1a1c1f] mb-4">
              Biến động chi tiêu
            </h3>
            <div className="relative overflow-hidden h-44 flex flex-col justify-end pt-8">
              <div className="overflow-x-auto flex items-end gap-3 px-1 pb-2 scrollbar-hide w-full h-full">
                {chartData.map((data, index) => {
                  const barHeight = (data.amount / maxAmountInChart) * 100;
                  const isSelected = data.value === selectedDayValue;
                  const isLastItem = index === chartData.length - 1;
                  return (
                    <div
                      key={index}
                      ref={isLastItem ? lastBarRef : null}
                      onClick={() => setSelectedDayValue(data.value)}
                      className="flex flex-col items-center gap-2 shrink-0 relative group cursor-pointer"
                      style={{
                        width:
                          chartData.length > 7
                            ? "45px"
                            : `${100 / chartData.length}%`,
                        minWidth: "40px",
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
                          {formatCompact(data.amount)}
                        </span>
                      </div>
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ease-out ${
                          isSelected
                            ? "bg-gradient-to-t from-[#4b5b9a] to-[#94a3e8] shadow-md shadow-[#4b5b9a]/30 scale-x-110"
                            : "bg-[#e2e2e7] group-hover:bg-[#dde1ff]"
                        }`}
                        style={{ height: `${Math.max(barHeight, 4)}px` }}
                      ></div>
                      <span
                        className={`text-[9px] font-bold transition-all text-center ${
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
          </section>
        )}

        {/* Lịch sử giao dịch */}
        <section>
          {/* CỤM TIÊU ĐỀ VÀ TÌM KIẾM ĐƯỢC CHUYỂN THÀNH STICKY */}
          <div className="sticky top-0 z-40 bg-[#f9f9fe] pt-2 pb-4 -mx-2 px-2 space-y-4">
            <h3 className="font-headline font-bold text-base text-[#1a1c1f]">
              Lịch sử giao dịch
            </h3>

            <div className="flex gap-2">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5b9a]">
                  search
                </span>
                <input
                  className="w-full bg-[#e2e2e7] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none outline-none focus:ring-2 focus:ring-[#4b5b9a]/30 transition-all"
                  placeholder="Tìm trong lịch sử..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() =>
                  setPriceSort((prev) =>
                    prev === "desc" ? "asc" : prev === "asc" ? "none" : "desc"
                  )
                }
                className={`px-4 rounded-2xl flex flex-col items-center justify-center border transition-all focus:outline-none outline-none ${
                  priceSort !== "none"
                    ? "bg-[#4b5b9a] text-white border-transparent shadow-md"
                    : "bg-white text-[#767681] border-[#e2e2e7]"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {priceSort === "none" ? "filter_list" : "swap_vert"}
                </span>
                {priceSort !== "none" && (
                  <span className="text-[8px] font-black uppercase mt-0.5">
                    {priceSort === "desc" ? "Cao" : "Thấp"}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e2e2e7]/60 shadow-sm min-h-[400px]">
            {fullPeriodTransactions.length > 0 ? (
              <div className="space-y-1">
                {fullPeriodTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between py-4 border-b border-[#f3f3f8] last:border-0 transition-colors ${
                      tx.dayValue === selectedDayValue && timeFilter !== "day"
                        ? "bg-[#f3f3f8] -mx-2 px-2 rounded-xl"
                        : ""
                    }`}
                  >
                    <div className="min-w-0 pr-4">
                      <p className="font-bold text-sm text-[#1a1c1f] truncate">
                        {tx.title}
                      </p>
                      <p className="text-[10px] text-[#767681] mt-1 font-medium">
                        {tx.date}
                      </p>
                    </div>
                    <p className="font-headline font-bold text-sm text-[#ba1a1a] shrink-0">
                      -{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 opacity-40">
                <span className="material-symbols-outlined text-5xl mb-2">
                  receipt_long
                </span>
                <p className="text-sm font-bold">
                  Không có giao dịch trong kỳ này
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
