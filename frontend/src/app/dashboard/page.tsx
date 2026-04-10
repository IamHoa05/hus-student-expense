"use client";

import React, { useState, useEffect } from "react";
// Import TopBar vừa tạo
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const getMonthRange = () => {
  const now = new Date();
  // Lấy ngày đầu tháng: Năm-Tháng-01
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0];
  
  // Lấy ngày cuối tháng: Năm-Tháng+1-Ngày 0
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split('T')[0];

  return { firstDay, lastDay };
};

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
  limit: number; // <-- Thêm trường này
  percentage: number;
  icon: string;
  iconBgClass: string;
  textHighlightClass: string;
}

interface RemainingData {
  month: number;
  year: number;
  inflow_total?: number;
  outflow_total?: number;
  total_remaining: number;
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

// 2. Cập nhật Mock Data
const MOCK_CATEGORIES: ExpenseCategory[] = [
  {
    id: "c1",
    name: "Ăn uống",
    amount: 1800000,
    limit: 3500000, // Hạn mức: 3.5M
    percentage: 51,
    icon: "restaurant",
    iconBgClass: "bg-[#4b5b9a]",
    textHighlightClass: "text-[#4b5b9a]",
  },
  {
    id: "c2",
    name: "Học tập",
    amount: 1200000,
    limit: 3500000, // Hạn mức: 3.5M
    percentage: 34,
    icon: "school",
    iconBgClass: "bg-[#94a3e8]",
    textHighlightClass: "text-[#283775]",
  },
  {
    id: "c3",
    name: "Di chuyển",
    amount: 450000,
    limit: 500000, // Hạn mức: 500k -> Đã tiêu 450k (90%)
    percentage: 90, // <-- Cố tình để > 85% để test hiệu ứng ĐỎ CẢNH BÁO
    icon: "directions_bus",
    iconBgClass: "bg-[#c5a344]",
    textHighlightClass: "text-[#755b00]",
  },
  {
    id: "c4",
    name: "Khác",
    amount: 200000,
    limit: 4000000, // Hạn mức: 4M
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
  const [monthlySummary, setMonthlySummary] = useState<RemainingData | null>(null);
  const [loadingMonthly, setLoadingMonthly] = useState<boolean>(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  interface ComparisonData {
    current_month: { month: number; year: number; total: number };
    previous_month: { month: number; year: number; total: number };
    growth_rate: number;
    is_increased: boolean;
  }
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchMonthly = async () => {
      setLoadingMonthly(true);
      setMonthlyError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string,string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/budgets/remaining`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('/budgets/remaining returned:', res.status, txt);
          setMonthlyError('Không thể lấy dữ liệu ngân sách');
          return;
        }
        const payload = await res.json();
        const data = payload?.data ?? null;
        if (data && typeof data.total_remaining !== 'undefined') {
          setMonthlySummary(data as RemainingData);
        } else {
          setMonthlyError('Dữ liệu ngân sách không hợp lệ');
        }
      } catch (err) {
        console.error('Lỗi khi gọi /budgets/remaining:', err);
        setMonthlyError('Lỗi kết nối');
      } finally {
        setLoadingMonthly(false);
      }
    };

    fetchMonthly();
    // Fetch comparison at the same time
    const fetchComparison = async () => {
      setLoadingComparison(true);
      setComparisonError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string,string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/budgets/comparison`, {
          method: 'GET',
          credentials: 'include',
          headers,
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('/budgets/comparison returned:', res.status, txt);
          setComparisonError('Không thể lấy dữ liệu so sánh');
          return;
        }
        const payload = await res.json();
        const data = payload?.data ?? null;
        if (data && typeof data.growth_rate !== 'undefined') {
          setComparison(data as ComparisonData);
        } else {
          setComparisonError('Dữ liệu so sánh không hợp lệ');
        }
      } catch (err) {
        console.error('Lỗi khi gọi /budgets/comparison:', err);
        setComparisonError('Lỗi kết nối');
      } finally {
        setLoadingComparison(false);
      }
    };

    fetchComparison();
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
              Khoản Dư
            </p>
            <h1 className="font-headline font-extrabold text-4xl tracking-tight">
              {loadingMonthly ? (
                <span className="text-lg">Đang tải...</span>
              ) : monthlySummary ? (
                formatCurrency(monthlySummary.total_remaining)
              ) : (
                formatCurrency(MOCK_BALANCE.current)
              )}
            </h1>
            <div className="mt-4 flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full w-fit backdrop-blur-md">
              {loadingComparison ? (
                <span className="text-xs text-[#dde1ff]">Đang tải...</span>
              ) : comparisonError ? (
                <>
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xs font-semibold">+{MOCK_BALANCE.trendPercentage}% tháng này</span>
                </>
              ) : comparison ? (
                <>
                  <span className={`material-symbols-outlined text-sm ${comparison.growth_rate > 0 ? 'text-[#ba1a1a]' : 'text-[#94a3e8]'}`}>
                    {comparison.growth_rate > 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  <span className="text-xs font-semibold">
                    {comparison.growth_rate > 0 ? '+' : ''}{Number(comparison.growth_rate).toFixed(1)}% tháng này
                  </span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-xs font-semibold">+{MOCK_BALANCE.trendPercentage}% tháng này</span>
                </>
              )}
            </div>
          </div>

          <div className="z-10 grid grid-cols-2 gap-8 w-full pt-2 border-t border-white/20 mt-2">
            <div>
              <p className="font-body text-[10px] uppercase tracking-wider text-[#dde1ff] opacity-80 mb-1">
                Chi tiêu (tháng này)
              </p>
              <p className="font-headline font-bold text-lg">
                {loadingMonthly ? (
                  <span className="text-sm text-[#dde1ff]">Đang tải...</span>
                ) : monthlyError ? (
                  formatCurrency(MOCK_BALANCE.expense)
                ) : monthlySummary ? (
                  formatCurrency(monthlySummary.outflow_total ?? MOCK_BALANCE.expense)
                ) : (
                  formatCurrency(MOCK_BALANCE.expense)
                )}
              </p>
            </div>

            <div>
              <p className="font-body text-[10px] uppercase tracking-wider text-[#dde1ff] opacity-80 mb-1">
                Thu nhập
              </p>
              <p className="font-headline font-bold text-lg">
                {loadingMonthly ? (
                  <span className="text-sm text-[#dde1ff]">Đang tải...</span>
                ) : monthlyError ? (
                  formatCurrency(MOCK_BALANCE.income)
                ) : monthlySummary ? (
                  formatCurrency(monthlySummary.inflow_total ?? MOCK_BALANCE.income)
                ) : (
                  formatCurrency(MOCK_BALANCE.income)
                )}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Bento Grid */}
      <div className="flex flex-col gap-6">
        {/* Spending Runway Card */}
        {/* <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e2e7]/60 relative overflow-hidden">
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
        </div> */}

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

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e2e7]/60">
          <h2 className="font-headline font-bold text-xl mb-5 text-[#1a1c1f]">
            Phân bổ chi tiêu
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {MOCK_CATEGORIES.map((category) => {
              const isWarning = category.percentage >= 85;
              const limitAmount =
                category.limit ||
                (category.percentage > 0
                  ? (category.amount * 100) / category.percentage
                  : 0);

              return (
                // SỬA ĐƯỜNG DẪN Ở ĐÂY: Trỏ thẳng tới /analytics/[id_danh_mục]
                <Link
                  href={`/analytics/${category.id}`}
                  key={category.id}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#f3f3f8] transition-colors cursor-pointer border border-[#e2e2e7]/40 shadow-sm hover:shadow-md group block"
                >
                  {/* ... (Toàn bộ phần Icon, Tên, Thanh tiến độ giữ nguyên y hệt lúc nãy) ... */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isWarning
                        ? "bg-[#ffdad6] text-[#ba1a1a]"
                        : "bg-[#f3f3f8] text-[#4b5b9a] group-hover:bg-[#dde1ff]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {category.icon}
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 pt-0.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-[#1a1c1f] group-hover:text-[#4b5b9a] transition-colors">
                          {category.name}
                        </p>
                        <p className="text-[11px] text-[#616470] mt-1 font-medium">
                          <span
                            className={`font-bold ${
                              isWarning ? "text-[#ba1a1a]" : "text-[#1a1c1f]"
                            }`}
                          >
                            {formatCurrency(category.amount)}
                          </span>
                          <span className="mx-1.5 opacity-50">/</span>
                          {formatCurrency(limitAmount)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`font-headline font-black text-sm ${
                            isWarning ? "text-[#ba1a1a]" : "text-[#4b5b9a]"
                          }`}
                        >
                          {category.percentage}%
                        </p>
                        {isWarning && (
                          <p className="text-[9px] font-bold uppercase text-[#ba1a1a] tracking-widest mt-0.5">
                            Sắp vượt mức
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-[#e2e2e7] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
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
