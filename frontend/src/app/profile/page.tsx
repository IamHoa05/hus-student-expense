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
  icon: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    hasChangedId: false,
  });

  const [editName, setEditName] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);

  const [budgets, setBudgets] = useState<Record<number, number>>({});

  const [toast, setToast] = useState<{
    show: boolean;
    msg: string;
  }>({
    show: false,
    msg: "",
  });

  const triggerToast = (msg: string) => {
    setToast({
      show: true,
      msg,
    });

    setTimeout(() => {
      setToast({
        show: false,
        msg: "",
      });
    }, 2500);
  };

  useEffect(() => {
    fetchUser();
    fetchCategories();
    fetchBudgets();
  }, []);

  const fetchUser = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    });

    const data = await response.json();

    setProfile({
      name: data.full_name || "",
      email: data.email || "",
      hasChangedId: false,
    });

    setEditName(data.full_name || "");
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();

      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_URL}/budgets`, {
        credentials: "include",
      });

      if (!response.ok) return;

      const data = await response.json();

      const map: Record<number, number> = {};

      const items = Array.isArray(data) ? data : [data];

      items.forEach((item: any) => {
        map[item.category_id] = item.amount_limit;
      });

      setBudgets(map);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAll = async () => {
    if (!editName.trim()) {
      triggerToast("⚠️ Tên không được để trống!");
      return;
    }

    setProfile((prev) => ({
      ...prev,
      name: editName,
    }));

    triggerToast("✅ Đã lưu thay đổi!");
  };

  return (
    <main className="w-full max-w-md mx-auto min-h-screen bg-[#f9f9fe] pb-24 relative">
      {toast.show && (
        <div className="fixed bottom-28 left-5 right-5 z-[100] flex justify-center animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#1a1c1f] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs">
            {toast.msg}
          </div>
        </div>
      )}

      <header className="sticky top-0 bg-[#f9f9fe]/90 backdrop-blur-md border-b border-[#e2e2e7]/30 flex items-center px-5 py-4 z-40">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 text-[#4b5b9a] hover:bg-[#e2e2e7] rounded-full transition-all"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <h1 className="font-headline font-bold text-lg text-[#4b5b9a] ml-2">
          Cá nhân
        </h1>
      </header>

      <div className="px-5 pt-6 space-y-6">
        <section className="bg-white p-5 rounded-2xl border border-[#e2e2e7]/50 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            {/* avatar giống TopBar */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#e0e2f1] flex items-center justify-center border-2 border-[#dde1ff] shadow-sm">
              <span className="text-xl font-black font-headline text-[#4b5b9a]">
                {getInitials(editName)}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-[#1a1c1f]">{editName}</h4>

              <p className="text-[11px] text-[#767681]">{profile.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-grow bg-[#f3f3f8] border-none rounded-xl py-3 px-4 text-sm font-bold text-[#1a1c1f] outline-none"
            />

            <button
              onClick={handleSaveAll}
              className="bg-[#4b5b9a] text-white px-5 rounded-xl font-bold text-xs active:scale-95 transition-all"
            >
              Lưu
            </button>
          </div>
        </section>

        <h4 className="font-headline font-bold text-lg text-[#1a1c1f]">
          Thiết lập hạn mức
        </h4>

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

                <span className="font-bold text-xs text-[#1a1c1f]">
                  {cat.category_name}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#f9f9fe] px-2 py-1 rounded-lg border border-[#e2e2e7]">
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

                    setBudgets((prev) => ({
                      ...prev,
                      [cat.category_id]: val,
                    }));
                  }}
                  className="w-20 text-right bg-transparent border-none focus:outline-none font-bold text-[#1a1c1f] text-xs outline-none"
                />

                <span className="text-[10px] font-bold text-[#767681]">đ</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full mt-4 py-4 bg-[#fff0ee] text-[#ba1a1a] font-bold text-xs rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all outline-none"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Đăng xuất
        </button>
      </div>
    </main>
  );
}
