"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface BalanceData {
  current: number;
  income: number;
  expense: number;
}

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  limit: number;
  percentage: number;
  icon: string;
}

const getCurrentMonth = () => {
  const months = [
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
  return months[new Date().getMonth()];
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");
  const [trend, setTrend] = useState(0);
  const [balance, setBalance] = useState<BalanceData>({
    current: 0,
    income: 0,
    expense: 0,
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setCurrentMonth(getCurrentMonth());
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const now = new Date();
      const currentMonthNum = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthNum = prevDate.getMonth() + 1;
      const prevYear = prevDate.getFullYear();

      // Gọi 3 API: Tổng quan tháng này, Tổng quan tháng trước, và Danh sách Thống kê chi tiêu
      const [currRes, prevRes, statsRes] = await Promise.all([
        fetch(
          `${API_URL}/budgets/remaining?month=${currentMonthNum}&year=${currentYear}`,
          { credentials: "include" }
        ),
        fetch(
          `${API_URL}/budgets/remaining?month=${prevMonthNum}&year=${prevYear}`,
          { credentials: "include" }
        ),
        fetch(
          `${API_URL}/stats/statistics?month=${currentMonthNum}&year=${currentYear}`,
          { credentials: "include" }
        ),
      ]);

      const currJson = currRes.ok ? await currRes.json() : {};
      const prevJson = prevRes.ok ? await prevRes.json() : {};
      const statsJson = statsRes.ok ? await statsRes.json() : [];

      const curr = currJson.data || currJson || {};
      const prev = prevJson.data || prevJson || {};

      // Lấy danh sách thống kê đã tiêu
      const statsData = Array.isArray(statsJson)
        ? statsJson
        : statsJson.data || [];

      // 1. GÁN KHOẢN DƯ & TỔNG CHI TIÊU
      setBalance({
        current: curr.total_remaining || 0,
        income: curr.inflow_total || 0,
        expense: curr.outflow_total || 0,
      });

      // 2. TÍNH TREND (%) SO VỚI THÁNG TRƯỚC
      const currentExpense = curr.outflow_total || 0;
      const previousExpense = prev.outflow_total || 0;

      let percent = 0;
      if (previousExpense === 0 && currentExpense > 0) {
        percent = 100;
      } else if (previousExpense > 0) {
        percent = Math.round(
          ((currentExpense - previousExpense) / previousExpense) * 100
        );
      }
      setTrend(percent);

      // 3. XỬ LÝ PHÂN BỔ CHI TIÊU
      // B3.1: Lấy thông tin Hạn mức (limit) từ API remaining lưu vào Map để tra cứu
      const limitMap = new Map<number, number>();
      const allocations = curr.allocations || [];
      allocations.forEach((alloc: any) => {
        limitMap.set(alloc.category_id, alloc.amount_limit || 0);
      });

      // B3.2: Duyệt qua danh sách đã tiêu (stats) để map ra dữ liệu hiển thị
      const mappedCategories: ExpenseCategory[] = statsData.map((stat: any) => {
        const spent = stat.total || 0;
        const limit = limitMap.get(stat.category_id) || 0;

        // Tự tính phần trăm % của Thanh Ngân Sách (Đã tiêu / Hạn mức)
        let calcPercent = 0;
        if (limit > 0) {
          calcPercent = Math.round((spent / limit) * 100);
        } else if (spent > 0) {
          calcPercent = 100; // Tiêu mà không có hạn mức thì thanh bar full đỏ
        }

        return {
          id: String(stat.category_id),
          name: stat.category_name,
          amount: spent,
          limit: limit,
          percentage: calcPercent,
          icon: stat.icon || "category",
        };
      });

      // Sắp xếp danh mục tiêu nhiều nhất lên đầu
      mappedCategories.sort((a, b) => b.amount - a.amount);

      setCategories(mappedCategories);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Dashboard:", error);
    }
  };

  // =========================
  // TREND UI LOGIC
  // =========================
  const isUp = trend > 0;
  const isDown = trend < 0;

  if (!isMounted) {
    return (
      <main className="flex-grow w-full max-w-md mx-auto px-5 pt-2 pb-28 min-h-screen bg-[#f9f9fe]"></main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-2 pb-28 min-h-screen bg-[#f9f9fe]">
      <TopBar />

      {/* BALANCE */}
      <header className="mb-5">
        <div className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-5 rounded-2xl text-white shadow-lg">
          <p className="text-xs uppercase tracking-widest text-[#dde1ff]">
            Khoản dư
          </p>

          <h1 className="font-headline font-extrabold text-3xl mt-2">
            {formatCurrency(balance.current)}
          </h1>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase text-[#dde1ff]">
                Chi tiêu {currentMonth}
              </p>
              <p className="font-bold text-base mt-1">
                {formatCurrency(balance.expense)}
              </p>
            </div>

            {/* TREND UI */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                isUp
                  ? "text-[#ba1a1a] bg-[#ffdad6]/50"
                  : isDown
                  ? "text-[#059669] bg-[#d1f4e0]/50"
                  : "text-[#767681] bg-[#e2e2e7]"
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {isUp ? "trending_up" : "trending_down"}
              </span>

              <span>
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* BANNER QUẢNG CÁO TÍNH NĂNG OCR */}
      <div className="bg-gradient-to-r from-[#dde1ff]/80 to-[#f3f3f8] p-4 rounded-2xl border border-[#e2e2e7]/60 shadow-sm flex items-center justify-between gap-4 mb-5 relative overflow-hidden group">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm z-10 border border-[#e2e2e7]/30">
          <span className="material-symbols-outlined text-[#4b5b9a] text-2xl group-hover:scale-110 transition-transform">
            document_scanner
          </span>
        </div>

        <div className="flex-grow z-10">
          <h3 className="font-headline font-bold text-sm text-[#1a1c1f]">
            Quét hóa đơn thông minh
          </h3>
          <p className="text-[10px] text-[#616470] mt-0.5 leading-relaxed font-medium">
            Không cần nhập tay! Chụp ảnh hóa đơn để hệ thống tự động điền chi
            tiêu.
          </p>
        </div>

        <Link
          href="/add"
          className="shrink-0 bg-[#4b5b9a] text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-[#4b5b9a]/20 z-10 outline-none focus:outline-none"
        >
          Thử ngay
        </Link>

        <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none z-0 transform rotate-12">
          <span className="material-symbols-outlined text-8xl">
            receipt_long
          </span>
        </div>
      </div>

      {/* CATEGORY (Phân bổ chi tiêu) */}
      <div className="bg-white p-4 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
        <h2 className="font-bold text-base mb-3">Phân bổ chi tiêu</h2>

        {categories.length === 0 ? (
          <div className="text-center py-6 text-[#767681]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#dde1ff]">
              receipt_long
            </span>
            <p className="text-xs font-medium">
              Chưa có khoản chi tiêu nào trong tháng này.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {categories.map((category) => {
              const isWarning = category.percentage >= 85;

              return (
                <Link
                  key={category.id}
                  href={`/analytics/${category.id}?name=${encodeURIComponent(
                    category.name
                  )}`}
                  className="flex gap-3 p-3 rounded-xl border border-[#e2e2e7]/40"
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                      isWarning
                        ? "bg-[#ffdad6] text-[#ba1a1a]"
                        : "bg-[#f3f3f8] text-[#4b5b9a]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {category.icon}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs font-bold">{category.name}</p>
                        <p className="text-[9px] text-[#616470]">
                          {formatCurrency(category.amount)} /{" "}
                          {category.limit > 0
                            ? formatCurrency(category.limit)
                            : "Không giới hạn"}
                        </p>
                      </div>

                      <p
                        className={`text-xs font-bold ${
                          isWarning ? "text-[#ba1a1a]" : "text-[#4b5b9a]"
                        }`}
                      >
                        {category.percentage}%
                      </p>
                    </div>

                    <div className="h-1.5 bg-[#e2e2e7] rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWarning
                            ? "bg-[#ba1a1a]"
                            : "bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8]"
                        }`}
                        style={{
                          width: `${Math.min(category.percentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
