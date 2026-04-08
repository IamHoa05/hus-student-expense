"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

// =======================================================================
// MOCK DATA (Giữ nguyên cấu trúc dữ liệu của bạn)
// =======================================================================
const CATEGORY_DATA = {
  id: "cat_food",
  name: "Ăn uống",
  totalAmount: 4250000,
  trendPercentage: "+12%",
  transactionCount: 24,
  transactions: [
    {
      date: "Hôm qua",
      items: [
        {
          id: "tx1",
          title: "The Coffee House",
          amount: 45000,
          time: "14:30",
          method: "Thẻ ngân hàng",
          icon: "coffee",
        },
        {
          id: "tx2",
          title: "Phở Thìn Lò Đúc",
          amount: 90000,
          time: "12:15",
          method: "Tiền mặt",
          icon: "lunch_dining",
        },
      ],
    },
    {
      date: "24 Tháng 10",
      items: [
        {
          id: "tx3",
          title: "HaidiLao Hotpot",
          amount: 1200000,
          time: "19:45",
          method: "Thẻ ngân hàng",
          icon: "dinner_dining",
        },
        {
          id: "tx4",
          title: "Siêu thị WinMart",
          amount: 320000,
          time: "08:30",
          method: "Tiền mặt",
          icon: "shopping_bag",
        },
      ],
    },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");

  // Giả lập dữ liệu biểu đồ thay đổi theo filter
  const chartData = useMemo(() => {
    const counts = { week: 7, month: 12, quarter: 4, year: 5 };
    return Array.from(
      { length: counts[timeFilter] },
      () => Math.floor(Math.random() * 80) + 20
    );
  }, [timeFilter]);

  const togglePriceSort = () => {
    if (priceSort === "none") setPriceSort("desc");
    else if (priceSort === "desc") setPriceSort("asc");
    else setPriceSort("none");
  };

  return (
    <main className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#f9f9fe] overflow-hidden relative">
      {/* 1. TOPBAR CỐ ĐỊNH */}
      <header className="shrink-0 bg-[#f9f9fe] z-50 px-6 py-4 border-b border-[#e2e2e7]/30 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-[#f3f3f8] rounded-full active:scale-95 transition-all flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[#4b5b9a]">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-xl text-[#4b5b9a]">
            {CATEGORY_DATA.name}
          </h1>
        </div>
        <span className="material-symbols-outlined text-[#4b5b9a]">
          more_vert
        </span>
      </header>

      {/* 2. VÙNG CUỘN CHÍNH */}
      <div className="flex-grow overflow-y-auto scrollbar-hide">
        {/* Hero Section & Insights */}
        <div className="px-6 pt-6 space-y-8">
          <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-7 rounded-[2.5rem] text-white shadow-xl shadow-[#4b5b9a]/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-80 mb-1">
                    Tổng chi tiêu
                  </p>
                  <h2 className="font-headline text-3xl font-black">
                    {formatCurrency(CATEGORY_DATA.totalAmount)}
                  </h2>
                </div>

                {/* Time Switcher cho biểu đồ */}
                <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-md">
                  {["W", "M", "Q", "Y"].map((f, i) => {
                    const keys = ["week", "month", "quarter", "year"];
                    return (
                      <button
                        key={f}
                        onClick={() => setTimeFilter(keys[i] as any)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-[9px] font-black transition-all ${
                          timeFilter === keys[i]
                            ? "bg-white text-[#4b5b9a]"
                            : "text-white/60"
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mini Trend Chart */}
              <div className="h-20 w-full flex items-end gap-1.5 px-1">
                {chartData.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-white/20 rounded-t-sm transition-all duration-700 ease-out"
                    style={{
                      height: `${h}%`,
                      backgroundColor:
                        i === chartData.length - 1
                          ? "rgba(255,255,255,0.8)"
                          : undefined,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </section>

          {/* Insights Bento */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#e2e2e7]/50 shadow-sm">
              <span className="material-symbols-outlined text-[#ba1a1a] mb-2">
                trending_up
              </span>
              <p className="text-[10px] font-black text-[#767681] uppercase">
                Tăng trưởng
              </p>
              <p className="font-headline font-bold text-lg text-[#ba1a1a]">
                {CATEGORY_DATA.trendPercentage}
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-[#e2e2e7]/50 shadow-sm">
              <span className="material-symbols-outlined text-[#4b5b9a] mb-2">
                analytics
              </span>
              <p className="text-[10px] font-black text-[#767681] uppercase">
                Tần suất
              </p>
              <p className="font-headline font-bold text-lg text-[#1a1c1f]">
                {CATEGORY_DATA.transactionCount} lượt
              </p>
            </div>
          </section>

          {/* Search & Filter Bar */}
          <section className="flex gap-2">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5b9a] text-xl">
                search
              </span>
              <input
                className="w-full bg-[#e2e2e7] border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none"
                placeholder="Tìm trong hạng mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={togglePriceSort}
              className={`px-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${
                priceSort !== "none"
                  ? "bg-[#4b5b9a] text-white border-transparent shadow-md"
                  : "bg-white text-[#767681] border-[#e2e2e7]"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {priceSort === "none" ? "filter_list" : "swap_vert"}
              </span>
              {priceSort !== "none" && (
                <span className="text-[8px] font-black uppercase">
                  {priceSort === "desc" ? "Cao" : "Thấp"}
                </span>
              )}
            </button>
          </section>
        </div>

        {/* 3. DANH SÁCH GIAO DỊCH (STICKY HEADER) */}
        <section className="mt-8">
          <div className="sticky top-0 bg-[#f9f9fe] px-6 py-4 z-40 flex items-center justify-between border-b border-transparent">
            <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
              {searchQuery ? "Kết quả tìm kiếm" : "Lịch sử chi tiêu"}
            </h3>
            <p className="text-[10px] font-black text-[#4b5b9a] bg-[#dde1ff] px-2 py-0.5 rounded uppercase">
              Tháng 10
            </p>
          </div>

          <div className="px-6 pb-32 space-y-6 pt-2">
            {CATEGORY_DATA.transactions.map((group, index) => (
              <div key={index}>
                <p className="text-[10px] font-black text-[#767681] uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#c6c5d1] rounded-full"></span>
                  {group.date}
                </p>
                <div className="space-y-3">
                  {group.items.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-[#e2e2e7]/50 active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-[#f3f3f8] rounded-full flex items-center justify-center text-[#4b5b9a]">
                          <span
                            className="material-symbols-outlined text-xl"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {tx.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1c1f] text-sm">
                            {tx.title}
                          </p>
                          <p className="text-[10px] text-[#767681] font-medium">
                            {tx.method} • {tx.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-headline font-bold text-sm text-[#1a1c1f]">
                          -{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Nút Xem thêm động (Chỉ hiện khi không tìm kiếm) */}
            {!searchQuery && (
              <button className="w-full py-8 flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-white border border-[#e2e2e7] rounded-full flex items-center justify-center text-[#767681] group-hover:text-[#4b5b9a] group-hover:border-[#4b5b9a] transition-all">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
                {/* <span className="text-[10px] font-bold text-[#767681] uppercase tracking-[0.2em]">
                  Tải thêm giao dịch cũ
                </span> */}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Lớp phủ đáy mượt mà */}
      <div className="absolute bottom-20 left-0 right-0 h-16 bg-gradient-to-t from-[#f9f9fe] to-transparent pointer-events-none z-10"></div>
    </main>
  );
}
