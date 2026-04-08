"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =======================================================================
// MOCK DATA
// =======================================================================
const INITIAL_BUDGETS = [
  {
    id: "b_food",
    name: "Ăn uống",
    spent: 4200000,
    limit: 5000000,
    icon: "restaurant",
    color: "bg-[#4b5b9a]",
  },
  {
    id: "b_transport",
    name: "Di chuyển",
    spent: 600000,
    limit: 1500000,
    icon: "directions_bus",
    color: "bg-[#94a3e8]",
  },
  {
    id: "b_shopping",
    name: "Mua sắm",
    spent: 1800000,
    limit: 2000000,
    icon: "shopping_bag",
    color: "bg-[#ba1a1a]",
  },
  {
    id: "b_custom_1",
    name: "Thú cưng", // Hạng mục người dùng tự thêm
    spent: 450000,
    limit: 1000000,
    icon: "pets",
    color: "bg-[#10b981]",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};
const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
    // Lấy chữ cái đầu của từ đầu và từ cuối (Ví dụ: Nguyễn Minh Duyên -> ND)
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export default function ProfilePage() {
  const router = useRouter();

  // =========================================
  // STATES: Hồ sơ cá nhân
  // =========================================
  const [profile, setProfile] = useState({
    name: "Duyên",
    email: "duyen.ds@vnu.edu.vn",
    userId: "user_12345", // ID mặc định khi đăng ký
    hasChangedId: false, // Cờ kiểm tra xem đã đổi ID lần nào chưa
    plan: "Premium Plan",
    status: "Active",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB72RPYIq7DiM-iBtMl9Bd5b6OJTTQoh8f21jkInOk9cXa2k192X-rO9TZ3aLW_dWWOmqzcTmS_UUHM05I_0eObC0sdC_VENaBBz1UT0VPd_f0EJYC2avUn0OpfKMS9v5btW8y_C5ypySyXWd83U7BAyQwMF4pfeOu2bsVeIxygQxBj9cuTBx1A-tEUCoSMS4ievAiUyLv_5b4Kq1kkEIlHsxajpF1FqjKgaBlQEgH6T-iT9Mg6pb1RInAVx1XqaRe26cGZaQy29pU",
  });

  // State tạm để lưu giá trị đang gõ trên Form
  const [editProfile, setEditProfile] = useState({
    name: profile.name,
    userId: profile.userId,
  });

  const isProfileChanged =
    editProfile.name !== profile.name || editProfile.userId !== profile.userId;

  const handleSaveProfile = () => {
    if (!editProfile.name.trim() || !editProfile.userId.trim()) {
      alert("Tên và ID không được để trống!");
      return;
    }

    const willChangeId = editProfile.userId !== profile.userId;

    if (willChangeId && profile.hasChangedId) {
      alert("Bạn chỉ được phép đổi ID 1 lần duy nhất!");
      return;
    }

    // Cập nhật Profile chính thức
    setProfile({
      ...profile,
      name: editProfile.name,
      userId: editProfile.userId,
      hasChangedId: profile.hasChangedId || willChangeId,
    });

    alert("Cập nhật thông tin cá nhân thành công!");
  };

  // =========================================
  // STATES: Cài đặt và Hạn mức
  // =========================================
  const [alertLimit, setAlertLimit] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [isBudgetChanged, setIsBudgetChanged] = useState(false);

  const handleBudgetChange = (id: string, newLimitStr: string) => {
    const rawValue = parseInt(newLimitStr.replace(/\D/g, ""), 10) || 0;
    setBudgets(
      budgets.map((b) => (b.id === id ? { ...b, limit: rawValue } : b))
    );
    setIsBudgetChanged(true);
  };

  const handleSaveBudgets = () => {
    alert("Đã lưu thiết lập hạn mức mới thành công!");
    setIsBudgetChanged(false);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-28 relative min-h-screen bg-[#f9f9fe]">
      {/* TopAppBar */}
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
            Section 1: Profile Info Card (Editable)
            ========================================= */}
        <section className="relative group mt-6">
          <div className="absolute -inset-1 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] opacity-10 blur-xl rounded-2xl"></div>
          <div className="relative bg-white p-8 rounded-[2rem] flex flex-col items-center text-center shadow-sm border border-[#e2e2e7]/50">
            {/* Avatar */}
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8]">
                <div className="w-full h-full rounded-full border-4 border-white flex items-center justify-center bg-[#e0e2f1] text-[#4b5b9a]">
                  {/* Hiển thị chữ cái đầu thay vì Image */}
                  <span className="text-3xl font-black font-headline tracking-tighter">
                    {getInitials(editProfile.name)}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin cố định */}
            <p className="text-[#616470] font-medium text-xs mb-3">
              {profile.email}
            </p>
            <div className="flex gap-2 mb-6">
              <span className="px-4 py-1.5 bg-[#e0e2f1] text-[#616470] text-[10px] font-bold rounded-full uppercase tracking-wider">
                {profile.plan}
              </span>
              <span className="px-4 py-1.5 bg-[#dde1ff] text-[#283775] text-[10px] font-bold rounded-full uppercase tracking-wider">
                {profile.status}
              </span>
            </div>

            {/* Form chỉnh sửa Tên và ID */}
            <div className="w-full space-y-4 text-left border-t border-[#f3f3f8] pt-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#767681] ml-1 mb-1 block">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editProfile.name}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, name: e.target.value })
                    }
                    className="w-full bg-[#f3f3f8] border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold text-[#1a1c1f] focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c5d1] text-lg">
                    person
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1 ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#767681]">
                    ID Người dùng
                  </label>
                  <span
                    className={`text-[9px] font-bold ${
                      profile.hasChangedId ? "text-[#ba1a1a]" : "text-[#059669]"
                    }`}
                  >
                    {profile.hasChangedId
                      ? "Đã khóa đổi ID"
                      : "Chỉ được đổi 1 lần"}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={editProfile.userId}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, userId: e.target.value })
                    }
                    disabled={profile.hasChangedId}
                    className={`w-full border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold focus:focus:outline-none ${
                      profile.hasChangedId
                        ? "bg-[#e2e2e7]/50 text-[#767681] opacity-70"
                        : "bg-[#f3f3f8] text-[#1a1c1f]"
                    }`}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c5d1] text-lg">
                    badge
                  </span>
                </div>
              </div>

              {/* Nút lưu hồ sơ (Chỉ hiện khi có thay đổi) */}
              {isProfileChanged && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#4b5b9a]/20 active:scale-95 transition-all animate-in slide-in-from-bottom-2"
                >
                  Lưu thông tin
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =========================================
            Section 2: Budget Limits (Editable)
            ========================================= */}
        <section className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <div>
              <h3 className="font-headline font-bold text-xl tracking-tight text-[#1a1c1f]">
                Thiết lập hạn mức
              </h3>
              <p className="text-[#616470] text-xs mt-1">
                Các hạng mục tự động & tự thêm
              </p>
            </div>
            {isBudgetChanged && (
              <button
                onClick={handleSaveBudgets}
                className="text-[10px] font-black uppercase tracking-widest text-[#4b5b9a] bg-[#dde1ff] px-4 py-2 rounded-xl animate-pulse"
              >
                Lưu hạn mức
              </button>
            )}
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
                  className="bg-white border border-[#e2e2e7]/50 p-5 rounded-[2rem] space-y-4 shadow-sm hover:border-[#dde1ff] transition-colors"
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
                          Đã tiêu {formatCurrency(budget.spent)}đ
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
                    <div className="w-full h-2 bg-[#f3f3f8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isOverWarning ? "bg-[#ba1a1a]" : budget.color
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    {/* Chỉnh sửa hạn mức (Input) */}
                    <div className="flex justify-between items-center bg-[#f9f9fe] p-3 rounded-2xl border border-[#e2e2e7]/40">
                      <span className="text-[11px] font-bold text-[#616470] uppercase tracking-wider">
                        Giới hạn tháng
                      </span>
                      <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-[#e2e2e7] focus-within:border-[#4b5b9a] transition-all shadow-sm">
                        <input
                          type="text"
                          value={formatCurrency(budget.limit)}
                          onChange={(e) =>
                            handleBudgetChange(budget.id, e.target.value)
                          }
                          className="w-24 text-right bg-transparent border-none focus:outline-none font-headline font-bold p-0 text-[#1a1c1f] text-sm"
                        />
                        <span className="text-sm font-bold text-[#767681]">
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
        <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white p-8 rounded-[2rem] shadow-xl shadow-[#4b5b9a]/20">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-3xl">
              notifications_active
            </span>
            <h3 className="font-headline font-bold text-xl">
              Cài đặt thông báo
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Cảnh báo hạn mức</p>
                <p className="text-[11px] opacity-80 mt-0.5">
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

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Báo cáo hàng tuần</p>
                <p className="text-[11px] opacity-80 mt-0.5">
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
            className="w-full py-4 bg-[#fff0ee] hover:bg-[#ffdad6] text-[#ba1a1a] font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined">logout</span>
            Đăng xuất
          </button>
          <p className="text-[10px] text-[#767681] font-black tracking-widest uppercase mt-4">
            Momentum v2.4.0 • Made for Duyên
          </p>
        </div>
      </div>
    </main>
  );
}
