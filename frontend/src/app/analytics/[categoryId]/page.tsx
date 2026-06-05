"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

const formatCompact = (num: number) => {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "Tr";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const rawCategoryId = (params?.categoryId as string) || "1";
  const timeFilter = searchParams.get("timeFilter") || "month";

  let defaultLabel = "Tháng này";
  if (timeFilter === "day") defaultLabel = "Ngày này";
  if (timeFilter === "week") defaultLabel = "Tuần này";
  const contextLabel = searchParams.get("period") || defaultLabel;

  // =======================================================================
  // STATES
  // =======================================================================
  const [categoryName, setCategoryName] = useState<string>(
    decodeURIComponent(searchParams.get("name") || "Danh mục")
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [selectedDayValue, setSelectedDayValue] = useState<string>("");

  // API States
  const [chartData, setChartData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const lastBarRef = useRef<HTMLDivElement>(null);

  // =======================================================================
  // FETCH TẤT CẢ DỮ LIỆU TỪ 3 API
  // =======================================================================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // 1. Lấy Tổng quan Thống kê (API Statistics)
        const statsRes = await fetch(
          `${API_URL}/stats/statistics?month=${currentMonth}&year=${currentYear}`,
          { credentials: "include" }
        );
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const myStat = statsData.find(
            (s: any) => s.category_id?.toString() === rawCategoryId
          );
          if (myStat) {
            setStats({ total: myStat.total, count: myStat.transaction_count });
            setCategoryName((prev) =>
              prev === "Danh mục" || prev === "" ? myStat.category_name : prev
            );
          }
        }

        // 2. Lấy Biểu đồ Xu hướng (API Trend)
        const trendRes = await fetch(
          `${API_URL}/stats/trend?period_type=${timeFilter}&category_id=${rawCategoryId}`,
          { credentials: "include" }
        );
        if (trendRes.ok) {
          const trendData = await trendRes.json();
          if (trendData.chart_data) {
            const mappedChart = trendData.chart_data.map((d: any) => ({
              label: d.label,
              amount: d.total_amount,
              value: d.label,
            }));
            setChartData(mappedChart);
            if (mappedChart.length > 0) {
              setSelectedDayValue(mappedChart[mappedChart.length - 1].value);
            }
          }
        }

        // 3. Lấy Lịch sử Giao dịch (API Transactions)
        const txRes = await fetch(`${API_URL}/transactions`, {
          credentials: "include",
        });
        if (txRes.ok) {
          const txPayload = await txRes.json();
          let txGroups = [];
          if (txPayload?.data?.data && Array.isArray(txPayload.data.data)) {
            txGroups = txPayload.data.data;
          } else if (txPayload?.data && Array.isArray(txPayload.data)) {
            txGroups = txPayload.data;
          }

          const allTx = txGroups.flatMap(
            (group: any) => group.transactions || []
          );

          // Lọc giao dịch đúng với danh mục đang xem
          const catTx = allTx.filter(
            (t: any) => t.category_id?.toString() === rawCategoryId
          );

          const mappedTx = catTx
            .map((t: any) => {
              const amountVal = Number(t.amount ?? t.total_amount ?? 0);
              const created = new Date(
                t.created_at ?? t.transaction_date ?? Date.now()
              );

              const rawNote = t.note ?? "";
              const noteValue =
                typeof rawNote === "string" &&
                rawNote.trim() !== "" &&
                rawNote.toLowerCase() !== "string"
                  ? rawNote
                  : "";

              return {
                id: String(t.transaction_id ?? t.id ?? Math.random()),
                title: noteValue || "Giao dịch mới",
                amount: isFinite(amountVal) ? amountVal : 0,
                date: created.toLocaleDateString("vi-VN"),
                // Thêm time, icon, type để hiển thị UI mới
                time: created.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                type: t.transaction_type === "inflow" ? "income" : "expense",
                icon: t.icon || "category",
                dateObj: created,
                categoryName: t.category_name,
              };
            })
            // Lọc bỏ rác "string"
            .filter(
              (tx: any) =>
                tx.title.toLowerCase() !== "string" &&
                tx.categoryName?.toLowerCase() !== "string"
            );

          mappedTx.sort(
            (a: any, b: any) => b.dateObj.getTime() - a.dateObj.getTime()
          );
          setTransactions(mappedTx);

          // Fallback
          setStats((prev) => {
            if (prev.total === 0 && mappedTx.length > 0) {
              return {
                total: mappedTx.reduce(
                  (sum: number, tx: any) => sum + tx.amount,
                  0
                ),
                count: mappedTx.length,
              };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu chi tiết danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rawCategoryId, timeFilter]);

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
  }, [chartData]);

  // =======================================================================
  // LOGIC LỌC TÌM KIẾM / SẮP XẾP LỊCH SỬ
  // =======================================================================
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((tx) => tx.title.toLowerCase().includes(q));
    }

    if (priceSort === "asc")
      result.sort((a: any, b: any) => a.amount - b.amount);
    if (priceSort === "desc")
      result.sort((a: any, b: any) => b.amount - a.amount);

    return result;
  }, [searchQuery, priceSort, transactions]);

  const maxAmountInChart = Math.max(...chartData.map((d) => d.amount), 1);

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-4 pb-32 relative min-h-screen bg-[#f9f9fe]">
      {/* Header Quay lại */}
      <header className="flex items-center pb-2">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full px-2 py-1 -ml-2 transition-colors active:scale-95 focus:outline-none outline-none"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
          <span className="font-headline font-bold text-lg ml-1">Quay lại</span>
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-48 mt-10">
          <div className="w-8 h-8 border-4 border-[#4b5b9a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6 pt-2 animate-in fade-in duration-500">
          <h1 className="font-headline font-bold text-2xl text-[#1a1c1f] tracking-tight px-1">
            {categoryName}
          </h1>

          {/* Khối Tổng Quan */}
          <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white p-6 rounded-2xl shadow-md shadow-[#4b5b9a]/20">
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">
              Tổng chi ({contextLabel})
            </p>
            <h2 className="font-headline text-4xl font-black">
              {formatCurrency(stats.total)}
            </h2>
            <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
              <div>
                <p className="text-[10px] opacity-80 uppercase tracking-wider">
                  Số giao dịch
                </p>
                <p className="font-bold text-sm">{stats.count} lần</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-80 uppercase tracking-wider">
                  Trung bình
                </p>
                <p className="font-bold text-sm">
                  {formatCurrency(
                    Math.round(stats.total / (chartData.length || 1))
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Biểu đồ Biến động */}
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

            <div className="min-h-[400px]">
              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => (
                    // HTML/CSS Lấy chuẩn từ ảnh giao dịch bạn gửi
                    <div
                      key={tx.id}
                      className="bg-white p-4 rounded-2xl flex items-center justify-between border border-[#e2e2e7]/80 shadow-sm active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === "income"
                              ? "bg-[#d1f4e0] text-[#059669]"
                              : "bg-[#f3f3f8] text-[#4b5b9a]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            {tx.icon}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[13px] text-[#1a1c1f] truncate">
                            {tx.title}
                          </p>
                          <p className="text-[10px] text-[#767681] mt-1 font-medium">
                            {tx.date} • {tx.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`font-headline font-bold text-sm ${
                            tx.type === "income"
                              ? "text-[#059669]"
                              : "text-[#1a1c1f]"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-[9px] text-[#767681] font-bold uppercase mt-1">
                          {tx.categoryName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 opacity-40 bg-white p-6 rounded-2xl border border-[#e2e2e7]/60">
                  <span className="material-symbols-outlined text-5xl mb-2">
                    receipt_long
                  </span>
                  <p className="text-sm font-bold">
                    Không có giao dịch nào phù hợp
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
