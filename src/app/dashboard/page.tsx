"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

// =======================================================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU & MOCK DATA
// =======================================================================
interface BalanceData {
  current: number; // Khoản dư (tiền chưa dùng)
  income: number; // Tổng đã nạp vào
  expense: number; // Tổng đã chi tiêu
  trendPercentage: number;
}

interface SavingGoal {
  id: string;
  title: string;
  subtitle: string;
  progressPercent: number;
}

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  limit: number;
  percentage: number;
  icon: string;
  iconBgClass: string;
  textHighlightClass: string;
}

// Lấy tháng hiện tại
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
  const currentDate = new Date();
  return months[currentDate.getMonth()];
};

// Mock data với logic khoản dư = thu nhập - chi tiêu
const TOTAL_INCOME = 12000000; // Tổng tiền đã nạp
const TOTAL_EXPENSE = 3550000; // Tổng đã chi tiêu
const CURRENT_BALANCE = TOTAL_INCOME - TOTAL_EXPENSE; // Khoản dư còn lại

const MOCK_BALANCE: BalanceData = {
  current: CURRENT_BALANCE,
  income: TOTAL_INCOME,
  expense: TOTAL_EXPENSE,
  trendPercentage: 12,
};

const MOCK_GOALS: SavingGoal[] = [
  { id: "g1", title: "Khóa học AI", subtitle: "Coursera", progressPercent: 65 },
  {
    id: "g2",
    title: "Học phí kỳ 2",
    subtitle: "Đại học Khoa học Tự nhiên",
    progressPercent: 30,
  },
];

const MOCK_CATEGORIES: ExpenseCategory[] = [
  {
    id: "c1",
    name: "Ăn uống",
    amount: 1800000,
    limit: 3500000,
    percentage: 51,
    icon: "restaurant",
    iconBgClass: "bg-[#4b5b9a]",
    textHighlightClass: "text-[#4b5b9a]",
  },
  {
    id: "c2",
    name: "Học tập",
    amount: 1200000,
    limit: 3500000,
    percentage: 34,
    icon: "school",
    iconBgClass: "bg-[#94a3e8]",
    textHighlightClass: "text-[#283775]",
  },
  {
    id: "c3",
    name: "Di chuyển",
    amount: 450000,
    limit: 500000,
    percentage: 90,
    icon: "directions_bus",
    iconBgClass: "bg-[#c5a344]",
    textHighlightClass: "text-[#755b00]",
  },
  {
    id: "c4",
    name: "Khác",
    amount: 100000,
    limit: 4000000,
    percentage: 3,
    icon: "more_horiz",
    iconBgClass: "bg-[#c6c5d1]",
    textHighlightClass: "text-[#454650]",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// =======================================================================
// 2. GIAO DIỆN CHÍNH
// =======================================================================
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState("");
  const [balance, setBalance] = useState(MOCK_BALANCE);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);

    // Set tháng hiện tại
    setCurrentMonth(getCurrentMonth());

    // Kiểm tra reset đầu tháng (logic demo)
    const lastResetMonth = localStorage.getItem("lastResetMonth");
    const currentMonthIndex = new Date().getMonth();

    if (lastResetMonth && parseInt(lastResetMonth) !== currentMonthIndex) {
      // Reset chi tiêu về 0 khi sang tháng mới
      console.log("Reset chi tiêu cho tháng mới");
      // Trong thực tế sẽ gọi API để reset
    }
    localStorage.setItem("lastResetMonth", currentMonthIndex.toString());

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-[#4b5b9a] font-bold gap-3">
        <span className="material-symbols-outlined animate-spin text-4xl">
          autorenew
        </span>
        <p>Đang đồng bộ dữ liệu...</p>
      </div>
    );
  }

  return (
    // ĐỔI px-4 THÀNH px-5 ĐỂ KHỚP VỚI TRANG PROFILE
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-2 pb-28 relative min-h-screen bg-[#f9f9fe]">
      <TopBar />

      {/* Hero Section: Balance Card */}
      <header className="mb-5">
        <div className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-5 rounded-2xl text-white shadow-lg shadow-[#4b5b9a]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-xs uppercase tracking-widest text-[#dde1ff] opacity-90">
                Khoản dư
              </p>
            </div>

            <h1 className="font-headline font-extrabold text-3xl tracking-tight mb-2">
              {formatCurrency(balance.current)}
            </h1>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                <span className="material-symbols-outlined text-xs">
                  trending_up
                </span>
                <span className="text-[10px] font-semibold">
                  +{balance.trendPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Chi tiêu tháng */}
          <div className="relative z-10 mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[9px] uppercase tracking-wider text-[#dde1ff] opacity-80">
                  Chi tiêu {currentMonth}
                </p>
                <p className="font-headline font-bold text-base">
                  {formatCurrency(balance.expense)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content Grid */}
      <div className="flex flex-col gap-4">
        {/* Saving Goals Tracker */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline font-bold text-base text-[#1a1c1f]">
              Mục tiêu tiết kiệm
            </h2>
            <span className="material-symbols-outlined text-[#4b5b9a] text-xl">
              flag
            </span>
          </div>

          <div className="space-y-1.5">
            {MOCK_GOALS.map((goal) => (
              <Link
                key={goal.id}
                href={`/dashboard/goals/${goal.id}`}
                className="block p-2.5 -mx-2.5 rounded-xl hover:bg-[#f3f3f8] transition-all group"
              >
                <div className="flex justify-between items-end mb-1.5">
                  <div>
                    <p className="font-headline font-bold text-xs text-[#1a1c1f] group-hover:text-[#4b5b9a] transition-colors">
                      {goal.title}
                    </p>
                    <p className="text-[9px] text-[#616470]">{goal.subtitle}</p>
                  </div>
                  <p className="font-bold text-xs text-[#4b5b9a]">
                    {goal.progressPercent}%
                  </p>
                </div>
                <div className="w-full h-2 bg-[#e2e2e7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4b5b9a] group-hover:bg-[#94a3e8] rounded-full transition-all"
                    style={{ width: `${goal.progressPercent}%` }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/dashboard/add"
            className="mt-4 w-full bg-[#dde1ff] text-[#283775] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#94a3e8] hover:text-white transition-colors active:scale-95 text-xs"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Thêm mục tiêu mới
          </Link>
        </div>

        {/* Expense Categories */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
          <h2 className="font-headline font-bold text-base mb-3 text-[#1a1c1f]">
            Phân bổ chi tiêu
          </h2>

          <div className="grid grid-cols-1 gap-2">
            {MOCK_CATEGORIES.map((category) => {
              const isWarning = category.percentage >= 85;
              const limitAmount = category.limit;

              return (
                <Link
                  href={`/analytics/${category.id}`}
                  key={category.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f3f3f8] transition-colors border border-[#e2e2e7]/40 group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isWarning
                        ? "bg-[#ffdad6] text-[#ba1a1a]"
                        : "bg-[#f3f3f8] text-[#4b5b9a] group-hover:bg-[#dde1ff]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {category.icon}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-[#1a1c1f] group-hover:text-[#4b5b9a] transition-colors">
                          {category.name}
                        </p>
                        <p className="text-[9px] text-[#616470] mt-0.5 font-medium">
                          <span
                            className={`font-bold ${
                              isWarning ? "text-[#ba1a1a]" : "text-[#1a1c1f]"
                            }`}
                          >
                            {formatCurrency(category.amount)}
                          </span>
                          <span className="mx-1 opacity-50">/</span>
                          {formatCurrency(limitAmount)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-headline font-black text-xs ${
                            isWarning ? "text-[#ba1a1a]" : "text-[#4b5b9a]"
                          }`}
                        >
                          {category.percentage}%
                        </p>
                        {isWarning && (
                          <p className="text-[7px] font-bold uppercase text-[#ba1a1a] tracking-wider">
                            Cảnh báo
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-[#e2e2e7] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isWarning
                            ? "bg-[#ba1a1a]"
                            : "bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8]"
                        }`}
                        style={{
                          width: `${Math.min(category.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
