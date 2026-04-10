"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =======================================================================
// MOCK DATA (Đã xóa thuộc tính color cứng)
// =======================================================================
const INITIAL_BUDGETS = [
  {
    id: "b_food",
    name: "Ăn uống",
    spent: 4200000,
    limit: 5000000,
    icon: "restaurant",
  },
  {
    id: "b_transport",
    name: "Di chuyển",
    spent: 600000,
    limit: 1500000,
    icon: "directions_bus",
  },
  {
    id: "b_shopping",
    name: "Mua sắm",
    spent: 1800000,
    limit: 2000000,
    icon: "shopping_bag",
  },
  {
    id: "b_custom_1",
    name: "Thú cưng",
    spent: 450000,
    limit: 1000000,
    icon: "pets",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length >= 2) {
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
    name: "A",
    email: "nguyenvana.ds@vnu.edu.vn",
    userId: "user_12345",
    hasChangedId: false,
    plan: "Premium Plan",
    status: "Active",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB72RPYIq7DiM-iBtMl9Bd5b6OJTTQoh8f21jkInOk9cXa2k192X-rO9TZ3aLW_dWWOmqzcTmS_UUHM05I_0eObC0sdC_VENaBBz1UT0VPd_f0EJYC2avUn0OpfKMS9v5btW8y_C5ypySyXWd83U7BAyQwMF4pfeOu2bsVeIxygQxBj9cuTBx1A-tEUCoSMS4ievAiUyLv_5b4Kq1kkEIlHsxajpF1FqjKgaBlQEgH6T-iT9Mg6pb1RInAVx1XqaRe26cGZaQy29pU",
  });

  const [editProfile, setEditProfile] = useState({
    name: profile.name,
    userId: profile.userId,
  });

  // State cho thông báo dạng Popup giữa màn hình
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const isProfileChanged =
    editProfile.name !== profile.name || editProfile.userId !== profile.userId;

  // Hàm hiển thị thông báo
  const showNotification = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "success", message: "" });
    }, 3000);
  };

  const handleSaveProfile = () => {
    if (!editProfile.name.trim() || !editProfile.userId.trim()) {
      showNotification("error", "Tên và ID không được để trống!");
      return;
    }

    const willChangeId = editProfile.userId !== profile.userId;

    if (willChangeId && profile.hasChangedId) {
      showNotification("warning", "Bạn chỉ được phép đổi ID 1 lần duy nhất!");
      return;
    }

    setProfile({
      ...profile,
      name: editProfile.name,
      userId: editProfile.userId,
      hasChangedId: profile.hasChangedId || willChangeId,
    });

    showNotification("success", "Cập nhật thông tin cá nhân thành công!");
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
    showNotification("success", "Đã lưu thiết lập hạn mức mới thành công!");
    setIsBudgetChanged(false);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-4 pb-24 relative min-h-screen bg-[#f9f9fe]">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full max-w-md z-50 bg-[#f9f9fe]/80 backdrop-blur-xl border-b border-[#e2e2e7]/30 flex justify-between items-center px-5 py-3 -ml-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-lg tracking-tight text-[#4b5b9a]">
            Cá nhân
          </h1>
        </div>
      </header>

      {/* Vùng Wrapper thu hẹp lại các khối bên dưới (max-w-[340px]) */}
      <div className="pt-14 space-y-5 max-w-[340px] mx-auto w-full">
        {/* =========================================
            THÔNG BÁO - Nổi giữa màn hình
            ========================================= */}
        {notification.show && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-[280px] pointer-events-none px-4">
            <div
              className={`animate-in fade-in zoom-in-95 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white rounded-3xl p-5 flex flex-col items-center justify-center text-center border ${
                notification.type === "success"
                  ? "border-[#059669]/20" // SỬA: Viền xanh lá
                  : notification.type === "error"
                  ? "border-[#ba1a1a]/20"
                  : "border-[#856404]/20"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  notification.type === "success"
                    ? "bg-[#d1fae5] text-[#059669]" // SỬA: Nền xanh lá nhạt, Icon xanh lá
                    : notification.type === "error"
                    ? "bg-[#ffdad6] text-[#ba1a1a]"
                    : "bg-[#fff3cd] text-[#856404]"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {notification.type === "success"
                    ? "check_circle"
                    : notification.type === "error"
                    ? "error"
                    : "warning"}
                </span>
              </div>

              {/* Nội dung chữ */}
              <span
                className={`font-headline font-bold text-sm leading-relaxed px-2 ${
                  notification.type === "success"
                    ? "text-[#059669]" // SỬA: Chữ màu xanh lá
                    : notification.type === "error"
                    ? "text-[#ba1a1a]"
                    : "text-[#856404]"
                }`}
              >
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* =========================================
            Section 1: Profile Card - THU GỌN
            ========================================= */}
        <section className="relative group mt-4">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] opacity-10 blur-lg rounded-xl"></div>
          <div className="relative bg-white p-5 rounded-2xl shadow-sm border border-[#e2e2e7]/50">
            {/* Header với Avatar + Info */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8]">
                  <div className="w-full h-full rounded-full border-2 border-white flex items-center justify-center bg-[#e0e2f1] text-[#4b5b9a]">
                    <span className="text-lg font-black font-headline">
                      {getInitials(editProfile.name)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[#616470] text-xs mb-1">{profile.email}</p>
                <div className="flex gap-1.5">
                  <span className="px-2.5 py-0.5 bg-[#e0e2f1] text-[#616470] text-[9px] font-bold rounded-full uppercase tracking-wider">
                    {profile.plan}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#dde1ff] text-[#283775] text-[9px] font-bold rounded-full uppercase tracking-wider">
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Form chỉnh sửa */}
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-[#767681] ml-1 mb-1 block">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editProfile.name}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, name: e.target.value })
                    }
                    className="w-full bg-[#f3f3f8] border-none rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold text-[#1a1c1f] focus:outline-none"
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c6c5d1] text-base">
                    person
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1 ml-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#767681]">
                    ID Người dùng
                  </label>
                  <span
                    className={`text-[8px] font-bold ${
                      profile.hasChangedId ? "text-[#ba1a1a]" : "text-[#059669]"
                    }`}
                  >
                    {profile.hasChangedId ? "Đã khóa" : "Đổi 1 lần"}
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
                    className={`w-full border-none rounded-xl py-2.5 pl-9 pr-3 text-sm font-bold focus:outline-none ${
                      profile.hasChangedId
                        ? "bg-[#e2e2e7]/50 text-[#767681] opacity-70"
                        : "bg-[#f3f3f8] text-[#1a1c1f]"
                    }`}
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c6c5d1] text-base">
                    badge
                  </span>
                </div>
              </div>

              {isProfileChanged && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full mt-1 py-2.5 bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white rounded-xl font-bold text-xs shadow-md shadow-[#4b5b9a]/20 active:scale-95 transition-all"
                >
                  Lưu thông tin
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =========================================
            Section 2: Budget Cards - MÀU ĐỘNG 85%
            ========================================= */}
        <section className="space-y-3">
          <div className="flex items-end justify-between px-1">
            <div>
              <h3 className="font-headline font-bold text-base tracking-tight text-[#1a1c1f]">
                Thiết lập hạn mức
              </h3>
            </div>
            {isBudgetChanged && (
              <button
                onClick={handleSaveBudgets}
                className="text-[9px] font-black uppercase tracking-widest text-[#4b5b9a] bg-[#dde1ff] px-3 py-1.5 rounded-lg"
              >
                Lưu
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {budgets.map((budget) => {
              // Tính toán phần trăm
              const percentage =
                Math.min(
                  Math.round((budget.spent / budget.limit) * 100),
                  100
                ) || 0;

              // Xác định trạng thái Nguy hiểm (>= 85%)
              const isOverWarning = percentage >= 85;

              // Đặt màu động: Quá 85% thì Đỏ, còn lại Xanh App
              const dynamicColorClass = isOverWarning
                ? "bg-[#ba1a1a]"
                : "bg-[#4b5b9a]";
              const dynamicTextClass = isOverWarning
                ? "text-[#ba1a1a]"
                : "text-[#4b5b9a]";

              return (
                <div
                  key={budget.id}
                  className="bg-white border border-[#e2e2e7]/50 p-4 rounded-xl space-y-3 shadow-sm hover:border-[#dde1ff] transition-colors"
                >
                  {/* Header card */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg bg-[#f3f3f8] flex items-center justify-center ${dynamicTextClass}`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {budget.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-headline font-bold text-[#1a1c1f] text-sm">
                          {budget.name}
                        </h4>
                        <p className="text-[9px] text-[#616470] font-medium uppercase tracking-wider">
                          Đã tiêu {formatCurrency(budget.spent)}đ
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold font-headline text-base ${dynamicTextClass}`}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#f3f3f8] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${dynamicColorClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {/* Input chỉnh hạn mức */}
                  <div className="flex justify-between items-center bg-[#f9f9fe] p-2 rounded-lg">
                    <span className="text-[9px] font-bold text-[#616470] uppercase tracking-wider">
                      Giới hạn
                    </span>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-[#e2e2e7]">
                      <input
                        type="text"
                        value={formatCurrency(budget.limit)}
                        onChange={(e) =>
                          handleBudgetChange(budget.id, e.target.value)
                        }
                        className="w-20 text-right bg-transparent border-none focus:outline-none font-headline font-bold p-0 text-[#1a1c1f] text-xs"
                      />
                      <span className="text-xs font-bold text-[#767681]">
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================
            Section 3: Settings - THU GỌN
            ========================================= */}
        <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white p-5 rounded-2xl shadow-lg shadow-[#4b5b9a]/20">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-2xl">
              notifications_active
            </span>
            <h3 className="font-headline font-bold text-base">Thông báo</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs">Cảnh báo hạn mức</p>
                <p className="text-[9px] opacity-80 mt-0.5">Khi đạt 85%</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={alertLimit}
                  onChange={() => setAlertLimit(!alertLimit)}
                />
                <div className="w-10 h-5 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#94a3e8]"></div>
              </label>
            </div>

            <div className="h-px bg-white/20"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs">Báo cáo hàng tuần</p>
                <p className="text-[9px] opacity-80 mt-0.5">
                  Tóm tắt sáng Thứ Hai
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={weeklyReport}
                  onChange={() => setWeeklyReport(!weeklyReport)}
                />
                <div className="w-10 h-5 bg-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#94a3e8]"></div>
              </label>
            </div>
          </div>
        </section>

        {/* =========================================
            Footer
            ========================================= */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-[#fff0ee] hover:bg-[#ffdad6] text-[#ba1a1a] font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Đăng xuất
          </button>
          <p className="text-[9px] text-[#767681] font-black tracking-widest uppercase">
            TIÊU TỈNH v2.4.0 • Made for {profile.name}
          </p>
        </div>
      </div>
    </main>
  );
}
