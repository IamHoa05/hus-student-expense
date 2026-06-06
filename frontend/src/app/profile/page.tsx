"use client";

import React, { useEffect, useState, useRef } from "react";
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

  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({ name: "", email: "", number: "" });
  const [editName, setEditName] = useState("");
  const [avtUrl, setAvtUrl] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Record<number, number>>({});
  // originalBudgets: lưu những category_id đã có budget trên server
  const [originalBudgets, setOriginalBudgets] = useState<
    Record<number, number>
  >({});
  const [changedBudgets, setChangedBudgets] = useState<Record<number, number>>(
    {}
  );
  // editingCategories: những category đang ở trạng thái cho phép sửa
  const [editingCategories, setEditingCategories] = useState<
    Record<number, boolean>
  >({});

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBudgets, setIsSavingBudgets] = useState(false);
  const [isUploadingAvt, setIsUploadingAvt] = useState(false);

  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  const triggerToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  useEffect(() => {
    setIsMounted(true);
    fetchUser();
    fetchCategories();
    fetchBudgets();
  }, []);

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
      if (data.avt_url && data.avt_url !== "string") {
        setAvtUrl(data.avt_url);
      } else {
        setAvtUrl(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải thông tin user:", err);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingAvt(true);
    try {
      const res = await fetch(`${API_URL}/avatars/me`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAvtUrl(data.avt_url);
      triggerToast("✅ Đã cập nhật ảnh đại diện!");
    } catch {
      triggerToast("❌ Lỗi tải ảnh lên!");
    } finally {
      setIsUploadingAvt(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/avatars/me`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setAvtUrl(null);
      triggerToast("✅ Đã xóa ảnh đại diện!");
    } catch {
      triggerToast("❌ Lỗi khi xóa ảnh!");
    }
  };

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

  const fetchBudgets = async () => {
    try {
      const now = new Date();
      const m = now.getMonth() + 1;
      const y = now.getFullYear();
      const response = await fetch(
        `${API_URL}/budgets/remaining?month=${m}&year=${y}`,
        { credentials: "include" }
      );
      if (!response.ok) return;
      const data = await response.json();
      const amountMap: Record<number, number> = {};
      const allocations = data.allocations || data.data?.allocations || [];
      allocations.forEach((item: any) => {
        if (item.amount_limit && item.amount_limit > 0) {
          amountMap[item.category_id] = item.amount_limit;
        }
      });
      setBudgets(amountMap);
      // Lưu lại snapshot để biết category nào đã tồn tại trên server
      setOriginalBudgets(amountMap);
    } catch (err) {
      console.error("Lỗi khi tải hạn mức:", err);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      triggerToast("⚠️ Tên không được để trống!");
      return;
    }
    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ full_name: editName.trim() }),
      });
      if (!res.ok) throw new Error();
      setProfile((prev) => ({ ...prev, name: editName.trim() }));
      triggerToast("✅ Đã cập nhật họ và tên!");
    } catch {
      triggerToast("❌ Không thể cập nhật tên!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Toggle chế độ edit cho một category đã có budget
  const toggleEdit = (categoryId: number) => {
    setEditingCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Kiểm tra một category có thể nhập liệu không:
  // - Chưa có budget => luôn cho nhập
  // - Đã có budget => chỉ cho nhập khi đang ở chế độ edit
  const isEditable = (categoryId: number) => {
    if (!originalBudgets[categoryId]) return true;
    return !!editingCategories[categoryId];
  };

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

      const budgetPromises = Object.entries(changedBudgets).map(
        async ([catIdStr, amountLimit]) => {
          const catId = Number(catIdStr);
          // Đã có trên server => PATCH, chưa có => POST
          const isExisting = originalBudgets[catId] !== undefined;
          return fetch(`${API_URL}/budgets`, {
            method: isExisting ? "PATCH" : "POST",
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
      setChangedBudgets({});
      setEditingCategories({});
      await fetchBudgets();
      triggerToast("✅ Đã lưu tất cả hạn mức mới!");
    } catch {
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
      {toast.show && (
        <div className="fixed bottom-28 left-5 right-5 z-[100] flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#1a1c1f] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs max-w-[90%] text-center">
            {toast.msg}
          </div>
        </div>
      )}

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
            <div className="relative group shrink-0">
              <div
                className="w-16 h-16 rounded-full overflow-hidden bg-[#e0e2f1] flex items-center justify-center border-2 border-[#dde1ff] shadow-sm cursor-pointer transition-transform active:scale-95"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploadingAvt ? (
                  <span className="material-symbols-outlined text-2xl text-[#4b5b9a] animate-spin">
                    autorenew
                  </span>
                ) : avtUrl ? (
                  <img
                    src={avtUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-black font-headline text-[#4b5b9a]">
                    {getInitials(editName)}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined text-white text-lg drop-shadow-md">
                    edit
                  </span>
                </div>
              </div>
              {avtUrl && !isUploadingAvt && (
                <button
                  onClick={handleDeleteAvatar}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white border border-[#e2e2e7] text-[#ba1a1a] rounded-full flex items-center justify-center shadow-sm hover:bg-[#ffdad6] active:scale-90 transition-all outline-none"
                >
                  <span className="material-symbols-outlined text-[12px]">
                    close
                  </span>
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUploadAvatar}
              />
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
            {Object.keys(changedBudgets).length > 0 && (
              <span className="text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full animate-pulse">
                Đang sửa {Object.keys(changedBudgets).length} mục
              </span>
            )}
          </div>

          <div className="space-y-2">
            {categories.map((cat) => {
              const hasExistingBudget =
                originalBudgets[cat.category_id] !== undefined;
              const canEdit = isEditable(cat.category_id);

              return (
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
                    <span className="font-bold text-xs text-[#1a1c1f] max-w-[100px] truncate">
                      {cat.category_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Nút edit — chỉ hiển thị khi đã có budget */}
                    {hasExistingBudget && (
                      <button
                        onClick={() => toggleEdit(cat.category_id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all outline-none ${
                          editingCategories[cat.category_id]
                            ? "bg-[#4b5b9a] text-white"
                            : "bg-[#f3f3f8] text-[#4b5b9a] hover:bg-[#e0e2f1]"
                        }`}
                        title={
                          editingCategories[cat.category_id]
                            ? "Hủy chỉnh sửa"
                            : "Chỉnh sửa hạn mức"
                        }
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {editingCategories[cat.category_id]
                            ? "close"
                            : "edit"}
                        </span>
                      </button>
                    )}

                    {/* Input hạn mức */}
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${
                        canEdit
                          ? "bg-[#f9f9fe] border-[#e2e2e7] focus-within:border-[#4b5b9a]"
                          : "bg-[#f3f3f8] border-transparent"
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="0"
                        disabled={!canEdit}
                        value={
                          budgets[cat.category_id]
                            ? new Intl.NumberFormat("vi-VN").format(
                                budgets[cat.category_id]
                              )
                            : ""
                        }
                        onChange={(e) => {
                          const val =
                            parseInt(e.target.value.replace(/\D/g, ""), 10) ||
                            0;
                          setBudgets((prev) => ({
                            ...prev,
                            [cat.category_id]: val,
                          }));
                          setChangedBudgets((prev) => ({
                            ...prev,
                            [cat.category_id]: val,
                          }));
                        }}
                        className={`w-24 text-right bg-transparent border-none focus:outline-none font-bold text-xs outline-none ${
                          canEdit ? "text-[#1a1c1f]" : "text-[#767681]"
                        }`}
                      />
                      <span className="text-[10px] font-bold text-[#767681]">
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
