"use client";

import React, { useState, useEffect } from "react";
// Import TopBar vừa tạo
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

// =======================================================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU & MOCK DATA (Giữ nguyên của bạn)
// =======================================================================
interface BalanceData {
  current: number;
  income: number;
  expense: number;
  trendPercentage: number;
}
interface RunwayData {
  estimatedDate: string;
  estimatedMonth: string;
  progressPercent: number;
  aiAdvice: string;
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
  percentage: number;
  icon: string;
  iconBgClass: string;
  textHighlightClass: string;
}

const MOCK_BALANCE: BalanceData = {
  current: 8450000,
  income: 12000000,
  expense: 3550000,
  trendPercentage: 12,
};
const MOCK_RUNWAY: RunwayData = {
  estimatedDate: "24",
  estimatedMonth: "Tháng 10",
  progressPercent: 75,
  aiAdvice:
    "Bạn đang tiêu xài nhanh hơn 15% so với tháng trước. Hãy tiết chế ăn uống bên ngoài!",
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
    percentage: 51,
    icon: "restaurant",
    iconBgClass: "bg-[#4b5b9a]",
    textHighlightClass: "text-[#4b5b9a]",
  },
  {
    id: "c2",
    name: "Học tập",
    amount: 1200000,
    percentage: 34,
    icon: "school",
    iconBgClass: "bg-[#94a3e8]",
    textHighlightClass: "text-[#283775]",
  },
  {
    id: "c3",
    name: "Di chuyển",
    amount: 350000,
    percentage: 10,
    icon: "directions_bus",
    iconBgClass: "bg-[#c5a344]",
    textHighlightClass: "text-[#755b00]",
  },
  {
    id: "c4",
    name: "Khác",
    amount: 200000,
    percentage: 5,
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
// 3. GIAO DIỆN CHÍNH
// =======================================================================
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
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
    <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-28 relative min-h-screen">
      {/* SỬ DỤNG TOPBAR COMPONENT TẠI ĐÂY */}
      <TopBar />

      {/* Hero Section: Balance Card */}
      <header className="mb-8">
        <div className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-8 rounded-2xl text-white shadow-xl shadow-[#4b5b9a]/20 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

          <div className="z-10">
            <p className="font-body text-sm uppercase tracking-widest text-[#dde1ff] opacity-90 mb-2">
              Số dư hiện tại
            </p>
            <h1 className="font-headline font-extrabold text-4xl tracking-tight">
              {formatCurrency(MOCK_BALANCE.current)}
            </h1>
            <div className="mt-4 flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full w-fit backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span className="text-xs font-semibold">
                +{MOCK_BALANCE.trendPercentage}% tháng này
              </span>
            </div>
          </div>

          <div className="z-10 grid grid-cols-2 gap-8 w-full pt-2 border-t border-white/20 mt-2">
            <div>
              <p className="font-body text-[10px] uppercase tracking-wider text-[#dde1ff] opacity-80 mb-1">
                Thu nhập
              </p>
              <p className="font-headline font-bold text-lg">
                {formatCurrency(MOCK_BALANCE.income)}
              </p>
            </div>
            <div>
              <p className="font-body text-[10px] uppercase tracking-wider text-[#dde1ff] opacity-80 mb-1">
                Chi tiêu
              </p>
              <p className="font-headline font-bold text-lg">
                {formatCurrency(MOCK_BALANCE.expense)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Bento Grid */}
      <div className="flex flex-col gap-6">
        {/* Spending Runway Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e2e7]/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline font-bold text-xl text-[#4b5b9a]">
                Spending Runway
              </h2>
              <p className="text-[#616470] text-xs mt-1">
                Dự đoán AI dựa trên thói quen
              </p>
            </div>
            <div className="p-2.5 bg-[#e0e2f1]/50 rounded-xl text-[#4b5b9a]">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-[#454650] text-sm font-medium mb-1">
              Ngày dự kiến 'cháy túi'
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-extrabold text-5xl text-[#ba1a1a]">
                {MOCK_RUNWAY.estimatedDate}
              </span>
              <span className="font-headline font-bold text-xl text-[#1a1c1f]">
                {MOCK_RUNWAY.estimatedMonth}
              </span>
            </div>

            <div className="mt-5 w-full bg-[#f3f3f8] rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] rounded-full transition-all duration-1000"
                style={{ width: `${MOCK_RUNWAY.progressPercent}%` }}
              ></div>
            </div>

            <div className="mt-5 text-xs text-[#616470] bg-[#f9f9fe] p-3.5 rounded-xl border border-[#e2e2e7] italic leading-relaxed text-center flex gap-2 items-start">
              <span className="material-symbols-outlined text-[#c5a344] text-base">
                lightbulb
              </span>
              <span>"{MOCK_RUNWAY.aiAdvice}"</span>
            </div>
          </div>
        </div>

        {/* Saving Goals Tracker */}
        <div className="bg-[#f3f3f8] p-6 rounded-2xl flex flex-col justify-between border border-[#e2e2e7]/60">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-xl text-[#1a1c1f]">
              Mục tiêu tiết kiệm
            </h2>
            <span className="material-symbols-outlined text-[#4b5b9a]">
              flag
            </span>
          </div>

          <div className="space-y-2">
            {MOCK_GOALS.map((goal) => (
              // 1. ĐỔI <div> THÀNH <Link>
              // 2. THÊM href ĐỘNG TRỎ TỚI ID CỦA MỤC TIÊU
              // 3. THÊM class 'group' ĐỂ LÀM HIỆU ỨNG HOVER
              <Link
                key={goal.id}
                href={`/dashboard/goals/${goal.id}`}
                className="block p-3 -mx-3 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-headline font-bold text-sm text-[#1a1c1f] group-hover:text-[#4b5b9a] transition-colors">
                      {goal.title}
                    </p>
                    <p className="text-[11px] text-[#616470] mt-0.5">
                      {goal.subtitle}
                    </p>
                  </div>
                  <p className="font-bold text-sm text-[#4b5b9a]">
                    {goal.progressPercent}%
                  </p>
                </div>
                <div className="w-full h-2.5 bg-[#e2e2e7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4b5b9a] group-hover:bg-[#94a3e8] rounded-full transition-all duration-1000"
                    style={{ width: `${goal.progressPercent}%` }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>

          {/* Thêm mục tiêu */}
          <Link
            href="/dashboard/add"
            className="mt-6 w-full bg-[#dde1ff] text-[#283775] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#94a3e8] hover:text-white transition-colors active:scale-95 shadow-sm text-sm"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm mục tiêu mới
          </Link>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e2e7]/60">
          <h2 className="font-headline font-bold text-xl mb-5 text-[#1a1c1f]">
            Phân bổ chi tiêu
          </h2>

          <div className="grid grid-cols-1 gap-2">
            {MOCK_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-[#f3f3f8] transition-colors cursor-pointer border border-transparent hover:border-[#e2e2e7]"
              >
                <div
                  className={`w-10 h-10 rounded-full ${category.iconBgClass} flex items-center justify-center text-white shadow-sm`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {category.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a1c1f]">
                    {category.name}
                  </p>
                  <p className="text-xs text-[#616470] mt-0.5">
                    {formatCurrency(category.amount)}
                  </p>
                </div>
                <p
                  className={`font-bold text-sm ${category.textHighlightClass}`}
                >
                  {category.percentage}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
