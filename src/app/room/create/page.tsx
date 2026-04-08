"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Các loại hình nhóm phổ biến
const GROUP_TYPES = [
  { id: "home", name: "Gia đình / Phòng", icon: "home" },
  { id: "travel", name: "Du lịch / Chuyến đi", icon: "flight" },
  { id: "work", name: "Công việc / Dự án", icon: "work" },
  { id: "other", name: "Khác", icon: "category" },
];

export default function CreateGroupPage() {
  const router = useRouter();

  // States cho form
  const [groupName, setGroupName] = useState("");
  const [selectedType, setSelectedType] = useState("home");
  const [initialBalance, setInitialBalance] = useState("");

  const handleCreate = () => {
    if (!groupName.trim()) {
      alert("Vui lòng nhập tên nhóm!");
      return;
    }
    // Giả lập tạo nhóm thành công
    alert(`Đã tạo nhóm "${groupName}" thành công!`);
    router.push("/room");
  };

  return (
    <main className="w-full max-w-md mx-auto min-h-screen bg-[#f9f9fe] flex flex-col relative overflow-hidden">
      {/* 1. NÚT BACK CỐ ĐỊNH */}
      <div className="px-6 pt-8 shrink-0 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#e2e2e7]/50 active:scale-90 transition-all text-[#4b5b9a]"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#767681]">
          Bắt đầu quỹ mới
        </span>
      </div>

      <div className="px-6 pt-10 flex-grow space-y-10">
        {/* 2. TIÊU ĐỀ TRANG */}
        <section>
          <h1 className="font-headline font-black text-4xl text-[#1a1c1f] leading-tight">
            Xây dựng
            <br />
            <span className="text-[#4b5b9a]">vương quốc chung</span>
          </h1>
          <p className="text-[#616470] text-sm mt-3 font-medium">
            Quản lý chi tiêu minh bạch cùng bạn bè và người thân.
          </p>
        </section>

        {/* 3. FORM NHẬP LIỆU */}
        <div className="space-y-8 pb-32">
          {/* Tên nhóm */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-[#4b5b9a] tracking-widest ml-1">
              Tên nhóm của bạn
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Ví dụ: Phòng 402, Team Phượt..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-white border border-[#e2e2e7] rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-[#4b5b9a]/30 transition-all placeholder:font-medium"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c6c5d1] group-focus-within:text-[#4b5b9a]">
                label
              </span>
            </div>
          </div>

          {/* Loại hình nhóm */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-[#4b5b9a] tracking-widest ml-1">
              Loại hình nhóm
            </label>
            <div className="grid grid-cols-2 gap-3">
              {GROUP_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                    selectedType === type.id
                      ? "bg-[#4b5b9a] text-white border-transparent shadow-lg shadow-[#4b5b9a]/20 scale-[1.02]"
                      : "bg-white text-[#454650] border-[#e2e2e7] hover:border-[#4b5b9a]/50"
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {type.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tight text-center">
                    {type.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vốn quỹ ban đầu (Tùy chọn) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-[#4b5b9a] tracking-widest ml-1">
              Quỹ ban đầu (nếu có)
            </label>
            <div className="relative flex items-center border-b-2 border-[#e2e2e7] focus-within:border-[#4b5b9a] transition-all pb-2 px-1">
              <span className="text-2xl font-black text-[#4b5b9a] mr-3">₫</span>
              <input
                type="number"
                placeholder="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full bg-transparent border-none p-0 text-3xl font-headline font-black text-[#1a1c1f] focus:outline-none placeholder:text-[#e2e2e7]"
              />
            </div>
            <p className="text-[9px] text-[#767681] italic">
              Số tiền này sẽ được tính là số dư khởi tạo của quỹ.
            </p>
          </div>
        </div>
      </div>

      {/* 4. NÚT XÁC NHẬN CỐ ĐỊNH Ở ĐÁY */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto p-6 bg-gradient-to-t from-[#f9f9fe] via-[#f9f9fe] to-transparent">
        <button
          onClick={handleCreate}
          className="w-full py-5 bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-black text-lg rounded-[2rem] shadow-xl shadow-[#4b5b9a]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <span>Xác nhận</span>
        </button>
      </div>

      {/* Trang trí nền */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#dde1ff]/20 rounded-full blur-[80px] -z-10 -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f3f3f8]/50 rounded-full blur-[80px] -z-10 -ml-32 -mb-32"></div>
    </main>
  );
}
