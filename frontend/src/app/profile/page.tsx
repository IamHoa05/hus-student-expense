"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getInitials = (name: string) => {
  if (!name.trim()) return "U";
  const names = name.trim().split(" ");
  return names.length >= 2
    ? (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    : name.charAt(0).toUpperCase();
};

type Category = {
  category_id: number;
  category_name: string;
  transaction_type: string;
  icon: string;
};

export default function ProfilePage() {
  const router = useRouter();

  // Chặn lỗi Hydration (Lệch giao diện Server/Client)
  const [isMounted, setIsMounted] = useState(false);

  // States thông tin người dùng
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    number: "",
  });
  const [editName, setEditName] = useState("");

  // States quản lý hạng mục và hạn mức
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Record<number, number>>({});
  const [changedBudgets, setChangedBudgets] = useState<Record<number, number>>(
    {}
  );

  // States quản lý trạng thái loading riêng biệt
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBudgets, setIsSavingBudgets] = useState(false);

  // Quản lý thông báo Popup (Toast)
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => {
      setToast({ show: false, msg: "" });
    }, 2500);
  };

  useEffect(() => {
    setIsMounted(true);
    fetchUser();
    fetchCategories();
    fetchBudgets();
  }, []);

  // 1. LẤY THÔNG TIN NGƯỜI DÙNG
  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: "include",
      });
      if (!response.ok) return;
      const data = await response.json();

      setProfile({
        name: data.full_name || "",
        email: data.email || "",
        number: data.phone || data.number || "",
      });
      setEditName(data.full_name || "");
    } catch (err) {
      console.error("Lỗi khi tải thông tin user:", err);
    }
  };

  // 2. LẤY DANH SÁCH HẠNG MỤC CHI TIÊU
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        credentials: "include",
      });
      if (!response.ok) return;
      const data = await response.json();

      const outflowCategories = Array.isArray(data)
        ? data.filter((cat: any) => cat.transaction_type === "outflow")
        : [];
      setCategories(outflowCategories);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  };

  // 3. LẤY HẠN MỨC HIỆN TẠI (Dùng API remaining theo tháng để đảm bảo chuẩn xác 100%)
  const fetchBudgets = async () => {
    try {
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();

      const response = await fetch(
        `${API_URL}/budgets/remaining?month=${m}&year=${y}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) return;
      const data = await response.json();

      const amountMap: Record<number, number> = {};

      // Lấy mảng allocations từ API remaining (hỗ trợ cả trường hợp bọc trong data)
      const allocations = data.allocations || data.data?.allocations || [];

      allocations.forEach((item: any) => {
        // Gán đúng amount_limit vào map theo category_id
        amountMap[item.category_id] = item.amount_limit || 0;
      });

      // Điền số tiền lên giao diện
      setBudgets(amountMap);
    } catch (err) {
      console.error("Lỗi khi tải hạn mức:", err);
    }
  };

  // 4. CHỈ LƯU THÔNG TIN CÁ NHÂN (TÊN)
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      triggerToast("⚠️ Tên không được để trống!");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          full_name: editName.trim(),
          avt_url: "string",
        }),
      });

      if (!res.ok) throw new Error();

      setProfile((prev) => ({ ...prev, name: editName.trim() }));
      triggerToast("✅ Đã cập nhật họ và tên!");
    } catch (err) {
      triggerToast("❌ Lỗi cập nhật thông tin cá nhân!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 5. CHỈ LƯU THIẾT LẬP HẠN MỨC NGÂN SÁCH
  const handleSaveBudgets = async () => {
    const totalChanges = Object.keys(changedBudgets).length;
    if (totalChanges === 0) {
      triggerToast("⚠️ Bạn chưa thay đổi hạn mức nào!");
      return;
    }

    setIsSavingBudgets(true);
    try {
      const now = new Date();
      const formatDate = (d: Date) => {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${d.getFullYear()}-${mm}-${dd}`;
      };
      const todayStr = formatDate(now);

      // Chỉ gửi lên API những hạn mức có sự thay đổi thực tế
      const budgetPromises = Object.entries(changedBudgets).map(
        async ([catIdStr, amountLimit]) => {
          const catId = Number(catIdStr);

          return fetch(`${API_URL}/budgets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              category_id: catId,
              amount_limit: amountLimit,
              start_date: todayStr,
              end_date: todayStr,
              period: "monthly",
              alert_threshold: 80,
            }),
          });
        }
      );

      await Promise.all(budgetPromises);

      setChangedBudgets({}); // Reset mảng tạm
      await fetchBudgets(); // Tải lại dữ liệu từ Server để đồng bộ giao diện cứng
      triggerToast("✅ Đã lưu tất cả hạn mức mới!");
    } catch (err) {
      triggerToast("❌ Không thể lưu hạn mức ngân sách!");
    } finally {
      setIsSavingBudgets(false);
    }
  };

  if (!isMounted) {
    return (
      <main className="w-full max-w-md mx-auto min-h-screen bg-[#f9f9fe]"></main>
    );
  }

  return (
    <main className="w-full max-w-md mx-auto min-h-screen bg-[#f9f9fe] pb-32 relative">
      {/* Thông báo popup */}
      {toast.show && (
        <div className="fixed bottom-28 left-5 right-5 z-[100] flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#1a1c1f] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs max-w-[90%] text-center">
            {toast.msg}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 bg-[#f9f9fe]/90 backdrop-blur-md border-b border-[#e2e2e7]/30 flex items-center px-5 py-4 z-40">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-[#4b5b9a] hover:bg-[#e2e2e7] rounded-full transition-all outline-none focus:outline-none"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 className="font-headline font-bold text-lg text-[#4b5b9a] ml-2">
          Cá nhân
        </h1>
      </header>

      <div className="px-5 pt-6 space-y-6">
        {/* KHỐI 1: THÔNG TIN CÁ NHÂN */}
        <section className="bg-white p-5 rounded-2xl border border-[#e2e2e7]/50 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#e0e2f1] flex items-center justify-center border-2 border-[#dde1ff] shadow-sm shrink-0">
              <span className="text-xl font-black font-headline text-[#4b5b9a]">
                {getInitials(editName)}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-[#1a1c1f] truncate">
                {profile.name || "Người dùng"}
              </h4>
              <p className="text-[11px] text-[#767681] truncate mt-0.5">
                {profile.email}
              </p>
              <p className="text-[11px] text-[#767681] truncate">
                {profile.number || "Chưa có SĐT"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Họ và tên"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-grow bg-[#f3f3f8] border-none rounded-xl py-3 px-4 text-sm font-bold text-[#1a1c1f] outline-none"
            />
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className={`px-5 rounded-xl font-bold text-xs transition-all flex items-center justify-center outline-none shrink-0 ${
                isSavingProfile
                  ? "bg-[#c6c5d1] text-white cursor-not-allowed"
                  : "bg-[#4b5b9a] text-white active:scale-95"
              }`}
            >
              {isSavingProfile ? (
                <span className="material-symbols-outlined animate-spin text-sm">
                  autorenew
                </span>
              ) : (
                "Lưu"
              )}
            </button>
          </div>
        </section>

        {/* KHỐI 2: THIẾT LẬP HẠN MỨC */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-headline font-bold text-lg text-[#1a1c1f]">
              Thiết lập hạn mức
            </h4>
            {/* Hiện số lượng ô đã sửa để người dùng biết */}
            {Object.keys(changedBudgets).length > 0 && (
              <span className="text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full animate-pulse">
                Đang sửa {Object.keys(changedBudgets).length} mục
              </span>
            )}
          </div>

          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.category_id}
                className="bg-white p-3.5 rounded-xl flex items-center justify-between border border-[#e2e2e7]/50 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f3f3f8] flex items-center justify-center text-[#4b5b9a]">
                    <span className="material-symbols-outlined text-lg">
                      {cat.icon}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-[#1a1c1f] max-w-[120px] truncate">
                    {cat.category_name}
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-[#f9f9fe] px-2 py-1 rounded-lg border border-[#e2e2e7] focus-within:border-[#4b5b9a] transition-colors">
                  <input
                    type="text"
                    placeholder="0"
                    value={
                      budgets[cat.category_id]
                        ? new Intl.NumberFormat("vi-VN").format(
                            budgets[cat.category_id]
                          )
                        : ""
                    }
                    onChange={(e) => {
                      const val =
                        parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;

                      // Cập nhật giao diện lập tức
                      setBudgets((prev) => ({
                        ...prev,
                        [cat.category_id]: val,
                      }));

                      // Đánh dấu để nút Lưu hạn mức hoạt động
                      setChangedBudgets((prev) => ({
                        ...prev,
                        [cat.category_id]: val,
                      }));
                    }}
                    className="w-24 text-right bg-transparent border-none focus:outline-none font-bold text-[#1a1c1f] text-xs outline-none"
                  />
                  <span className="text-[10px] font-bold text-[#767681]">
                    đ
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* NÚT LƯU HẠN MỨC RIÊNG BIỆT */}
          <button
            onClick={handleSaveBudgets}
            disabled={
              isSavingBudgets || Object.keys(changedBudgets).length === 0
            }
            className={`w-full py-3.5 rounded-xl font-headline font-black text-xs uppercase tracking-wider transition-all active:scale-[0.99] shadow-md outline-none ${
              Object.keys(changedBudgets).length === 0
                ? "bg-[#ededf2] text-[#767681] border border-[#e2e2e7]/50 shadow-none cursor-not-allowed"
                : isSavingBudgets
                ? "bg-[#c6c5d1] text-white cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white shadow-[#4b5b9a]/20"
            }`}
          >
            {isSavingBudgets ? (
              <div className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined animate-spin text-sm">
                  autorenew
                </span>
                Đang lưu hạn mức...
              </div>
            ) : (
              "Xác nhận lưu hạn mức"
            )}
          </button>
        </section>

        {/* ĐĂNG XUẤT */}
        <button
          onClick={() => router.push("/login")}
          className="w-full py-4 bg-[#fff0ee] text-[#ba1a1a] font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all outline-none"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Đăng xuất
        </button>
      </div>
    </main>
  );
}
