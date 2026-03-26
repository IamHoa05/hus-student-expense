"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =======================================================================
// MOCK DATA
// =======================================================================
const USER_DATA = {
  name: "Nguyễn Văn A",
  email: "duyen.ds@vnu.edu.vn",
  plan: "Premium Plan",
  status: "Active",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB72RPYIq7DiM-iBtMl9Bd5b6OJTTQoh8f21jkInOk9cXa2k192X-rO9TZ3aLW_dWWOmqzcTmS_UUHM05I_0eObC0sdC_VENaBBz1UT0VPd_f0EJYC2avUn0OpfKMS9v5btW8y_C5ypySyXWd83U7BAyQwMF4pfeOu2bsVeIxygQxBj9cuTBx1A-tEUCoSMS4ievAiUyLv_5b4Kq1kkEIlHsxajpF1FqjKgaBlQEgH6T-iT9Mg6pb1RInAVx1XqaRe26cGZaQy29pU", // Hoặc thay bằng ảnh thật
};

const INITIAL_BUDGETS = [
  {
    id: "b_food",
    name: "Ăn uống",
    spent: 4200000,
    limit: 5000000,
    icon: "restaurant",
    color: "bg-[#4b5b9a]",
    limitColor: "text-[#ba1a1a]",
  },
  {
    id: "b_transport",
    name: "Di chuyển",
    spent: 600000,
    limit: 1500000,
    icon: "directions_bus",
    color: "bg-[#94a3e8]",
    limitColor: "text-[#4b5b9a]",
  },
  {
    id: "b_shopping",
    name: "Mua sắm",
    spent: 1800000,
    limit: 2000000,
    icon: "shopping_bag",
    color: "bg-[#ba1a1a]",
    limitColor: "text-[#ba1a1a]",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

export default function ProfilePage() {
  const router = useRouter();

  // States quản lý cài đặt bật/tắt
  const [alertLimit, setAlertLimit] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // States quản lý hạn mức (Cho phép sửa trên UI)
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);

  const handleBudgetChange = (id: string, newLimitStr: string) => {
    const rawValue = parseInt(newLimitStr.replace(/\D/g, ""), 10) || 0;
    setBudgets(
      budgets.map((b) => (b.id === id ? { ...b, limit: rawValue } : b))
    );
  };

  const handleLogout = () => {
    // Xóa token/session (nếu có) rồi đẩy về trang Login
    router.push("/login");
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-28 relative min-h-screen">
      {/* TopAppBar Tùy chỉnh (Có nút Back) */}
      <header className="fixed top-0 w-full max-w-md z-50 bg-[#f9f9fe]/80 backdrop-blur-xl border-b border-[#e2e2e7]/30 flex justify-between items-center px-6 py-4 -ml-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-[#4b5b9a]">
            Cá nhân
          </h1>
        </div>
      </header>

      <div className="pt-16 space-y-8">
        {/* =========================================
            Section 1: Profile Info Card 
            ========================================= */}
        <section className="relative group mt-6">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] opacity-10 blur-xl rounded-2xl"></div>
          <div className="relative bg-white p-8 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-sm border border-[#e2e2e7]/50">
            <div className="relative">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8]">
                <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-[#e0e2f1]">
                  <Image
                    src={USER_DATA.avatar}
                    alt={USER_DATA.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              <button className="absolute bottom-0 right-0 bg-[#dde1ff] text-[#283775] p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div>
              <h2 className="font-headline font-bold text-2xl tracking-tight text-[#1a1c1f]">
                {USER_DATA.name}
              </h2>
              <p className="text-[#616470] font-medium text-sm mt-0.5">
                {USER_DATA.email}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-4 py-1.5 bg-[#e0e2f1] text-[#616470] text-[10px] font-bold rounded-full uppercase tracking-wider">
                {USER_DATA.plan}
              </span>
              <span className="px-4 py-1.5 bg-[#dde1ff] text-[#283775] text-[10px] font-bold rounded-full uppercase tracking-wider">
                {USER_DATA.status}
              </span>
            </div>
          </div>
        </section>

        {/* =========================================
            Section 2: Budget Limits 
            ========================================= */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl tracking-tight text-[#1a1c1f]">
                Thiết lập hạn mức
              </h3>
              <p className="text-[#616470] text-xs mt-1">
                Quản lý chi tiêu thông minh hàng tháng
              </p>
            </div>
            <button className="w-10 h-10 rounded-full bg-[#f3f3f8] flex items-center justify-center text-[#4b5b9a] hover:bg-[#e0e2f1] transition-colors">
              <span className="material-symbols-outlined text-xl">tune</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {budgets.map((budget) => {
              const percentage =
                Math.min(
                  Math.round((budget.spent / budget.limit) * 100),
                  100
                ) || 0;
              const isOverWarning = percentage >= 80;

              return (
                <div
                  key={budget.id}
                  className="bg-white border border-[#e2e2e7]/50 p-6 rounded-2xl space-y-5 shadow-sm hover:border-[#dde1ff] transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#f3f3f8] flex items-center justify-center text-[#4b5b9a]">
                        <span className="material-symbols-outlined text-2xl">
                          {budget.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-[#1a1c1f] text-sm">
                          {budget.name}
                        </h4>
                        <p className="text-[10px] text-[#616470] font-medium uppercase tracking-widest mt-0.5">
                          Đã tiêu {formatCurrency(budget.spent)}đ /{" "}
                          {formatCurrency(budget.limit)}đ
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold font-headline text-lg ${
                        isOverWarning ? "text-[#ba1a1a]" : "text-[#4b5b9a]"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-[#f3f3f8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isOverWarning
                            ? "bg-[#ba1a1a] opacity-80"
                            : budget.color
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center bg-[#f9f9fe] p-3 rounded-xl border border-[#e2e2e7]/40">
                      <span className="text-xs font-medium text-[#616470]">
                        Giới hạn
                      </span>
                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-[#e2e2e7] focus-within:border-[#4b5b9a]">
                        <input
                          type="text"
                          value={formatCurrency(budget.limit)}
                          onChange={(e) =>
                            handleBudgetChange(budget.id, e.target.value)
                          }
                          className="w-20 text-right bg-transparent border-none focus:ring-0 font-headline font-bold p-0 text-[#4b5b9a] text-sm"
                        />
                        <span className="text-sm font-bold text-[#4b5b9a]">
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================
            Section 3: Alerts Settings 
            ========================================= */}
        <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white p-8 rounded-2xl shadow-xl shadow-[#4b5b9a]/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-3xl">
              notifications_active
            </span>
            <h3 className="font-headline font-bold text-xl">
              Cài đặt thông báo
            </h3>
          </div>
          <div className="space-y-6">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-base">Cảnh báo hạn mức</p>
                <p className="text-xs opacity-80 mt-0.5">
                  Thông báo khi chi tiêu đạt 80%
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={alertLimit}
                  onChange={() => setAlertLimit(!alertLimit)}
                />
                <div className="w-12 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#94a3e8]"></div>
              </label>
            </div>

            <div className="h-px bg-white/20"></div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-base">Báo cáo hàng tuần</p>
                <p className="text-xs opacity-80 mt-0.5">
                  Tóm tắt chi tiêu vào sáng Thứ Hai
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={weeklyReport}
                  onChange={() => setWeeklyReport(!weeklyReport)}
                />
                <div className="w-12 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#94a3e8]"></div>
              </label>
            </div>
          </div>
        </section>

        {/* =========================================
            Logout / Footer Area 
            ========================================= */}
        <div className="pt-2 flex flex-col items-center gap-4">
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-[#fff0ee] hover:bg-[#ffdad6] text-[#ba1a1a] font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
          <p className="text-[11px] text-[#767681] font-medium tracking-widest uppercase">
            Momentum v2.4.0 • Made for Duyên
          </p>
        </div>
      </div>
    </main>
  );
}
