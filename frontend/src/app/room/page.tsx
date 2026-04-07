"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Giả sử ID của bạn là "u123"
const MY_USER_ID = "u123";

// =======================================================================
// 1. MOCK DATA
// =======================================================================
const MOCK_GROUPS = [
  {
    id: "g1",
    name: "Phòng 302 - Cầu Giấy",
    type: "Home",
    balance: 4250000,
    creatorId: "u123",
  },
  {
    id: "g2",
    name: "Hội bạn thân",
    type: "Travel",
    balance: 120000,
    creatorId: "u456",
  },
];

const MOCK_DATA_BY_GROUP: Record<string, any> = {
  g1: {
    members: [
      {
        id: "u123",
        name: "Minh Tuấn (Bạn)",
        role: "Trưởng phòng",
        balance: 240000,
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDy0pdjoA4C7o5aB2fysBXRedlEzw1wgj1TTRL9grpN_GjAdNgQO8ktZujCrxyRdFiFT7UVTQAvN9ii3v-5yKgcyyDPHBCZbE-LZ_sSuC62OlMqA3ttM4iPv2hKazzVSq3P2tx-AWL_Ax_w4y9O8Vcvrh83s-IeA6hCHd5cQxepLGJ5F7cpEgjzTRydBVe-MCejxQ9yLAQ-RIZ04WUZpgH5zm6ARDgw5rCCuiHDFNsHojCY1RLwgCTotJ_AIYXSmY9TheU40WGT-qM",
      },
      {
        id: "u456",
        name: "Hà Vy",
        role: "Thành viên",
        balance: -120000,
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBXz9F4BNhpwsFrqN7fkTGjQ1PsuokawaM1tsxcZtbm5ZkoyUBoVC6yNkMMkkfJOv_cCzbpLVzQ2ZlJkp_UbF_RcG_UaNT7oOpSOeNBoTVf50finFof3a0bGxtSJBdLqnSdKJ098krEijTXUiszyd1VFA-gxssnx5uRBx0gE0UWl9uyJ-HCl1TECq9QhlCpDQxzDKyw4x_mNkLFeoJcXrCjE05RpCxdv4IdaFpTxV8tqjkktXdeuwWZA8blqL_bo4oH4CHNVkUNcDg",
      },
    ],
    history: [
      {
        id: "tx_deposit_1",
        title: "Nạp quỹ tháng 4",
        spender: "Đức Duy", // Tên người nạp
        amount: 500000, // Số dương
        date: "02/04",
        isAdvance: false,
        type: "deposit", // Loại giao dịch nạp tiền
        note: "Đã chuyển khoản cho trưởng phòng",
      },
      {
        id: "tx1",
        title: "Cơm trưa nhóm",
        spender: "Minh Tuấn",
        amount: -300000,
        date: "01/04",
        isAdvance: true,
        note: "Tuấn ứng trước tiền cơm",
      },
      {
        id: "tx2",
        title: "Tiền điện tháng 3",
        spender: "Quỹ chung",
        amount: -1450000,
        date: "28/03",
        isAdvance: false,
        note: "Thanh toán từ quỹ",
      },
    ],
  },
  g2: {
    members: [
      {
        id: "u456",
        name: "Hà Vy",
        role: "Trưởng đoàn",
        balance: 0,
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBXz9F4BNhpwsFrqN7fkTGjQ1PsuokawaM1tsxcZtbm5ZkoyUBoVC6yNkMMkkfJOv_cCzbpLVzQ2ZlJkp_UbF_RcG_UaNT7oOpSOeNBoTVf50finFof3a0bGxtSJBdLqnSdKJ098krEijTXUiszyd1VFA-gxssnx5uRBx0gE0UWl9uyJ-HCl1TECq9QhlCpDQxzDKyw4x_mNkLFeoJcXrCjE05RpCxdv4IdaFpTxV8tqjkktXdeuwWZA8blqL_bo4oH4CHNVkUNcDg",
      },
    ],
    history: [],
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";

export default function RoomFundPage() {
  const router = useRouter();
  const [activeGroupId, setActiveGroupId] = useState("g1");
  const [searchMemberId, setSearchMemberId] = useState("");

  // State cho Tìm kiếm & Lọc Lịch sử nhóm
  const [historySearch, setHistorySearch] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");

  const groupInfo = MOCK_GROUPS.find((g) => g.id === activeGroupId);
  const groupContent = MOCK_DATA_BY_GROUP[activeGroupId] || {
    members: [],
    history: [],
  };
  const isCreator = groupInfo?.creatorId === MY_USER_ID;

  // Logic lọc lịch sử
  const filteredHistory = useMemo(() => {
    let result = [...groupContent.history];
    if (historySearch.trim()) {
      result = result.filter((tx) =>
        tx.title.toLowerCase().includes(historySearch.toLowerCase())
      );
    }
    if (priceSort === "asc") result.sort((a, b) => a.amount - b.amount);
    if (priceSort === "desc") result.sort((a, b) => b.amount - a.amount);
    return result;
  }, [groupContent.history, historySearch, priceSort]);

  return (
    <main className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#f9f9fe] overflow-hidden relative">
      {/* TOPBAR CỐ ĐỊNH */}
      <div className="px-6 pt-4 shrink-0 bg-[#f9f9fe] z-50">
        <TopBar />
      </div>

      {/* VÙNG CUỘN CHÍNH */}
      <div className="flex-grow overflow-y-auto scrollbar-hide">
        <div className="px-6 pt-6 space-y-8 pb-8">
          <section className="flex justify-between items-center">
            <h1 className="font-headline font-black text-3xl text-[#1a1c1f]">
              Nhóm của tôi
            </h1>
            <Link
              href="/room/create"
              className="w-10 h-10 bg-[#4b5b9a] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined">add</span>
            </Link>
          </section>

          {/* THANH CHỌN NHÓM - STICKY LEVEL 1 */}
          <div className="sticky top-0 z-40 bg-[#f9f9fe]/95 backdrop-blur-md -mx-6 px-6 py-4 border-b border-[#e2e2e7]/30">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {MOCK_GROUPS.map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    setActiveGroupId(group.id);
                    setHistorySearch("");
                  }}
                  className={`shrink-0 px-5 py-2.5 rounded-2xl border transition-all ${
                    activeGroupId === group.id
                      ? "bg-[#4b5b9a] text-white border-transparent shadow-md"
                      : "bg-white text-[#767681] border-[#e2e2e7]"
                  }`}
                >
                  <span className="text-xs font-bold">{group.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CARD QUỸ & ACTION */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-8 text-white shadow-xl shadow-[#4b5b9a]/20 italic">
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-white/70 font-black tracking-[0.2em] uppercase text-[10px] mb-2">
                Số dư hiện tại
              </span>
              <h2 className="font-headline font-extrabold text-4xl tracking-tight mb-8">
                {formatCurrency(groupInfo?.balance || 0)}
              </h2>
              <div className="flex gap-3 w-full">
                <Link
                  href={`/room/deposit?id=${activeGroupId}`}
                  className="flex-1 bg-white/20 backdrop-blur-md py-3.5 rounded-2xl font-bold flex items-center justify-center text-xs"
                >
                  Nạp quỹ
                </Link>
                {/* <Link
                  href={`/room/split?id=${activeGroupId}`}
                  className="flex-1 bg-[#1a1c1f] text-white py-3.5 rounded-2xl font-bold flex items-center justify-center text-xs shadow-lg"
                >
                  Chia bill
                </Link> */}
              </div>
            </div>
          </section>

          {/* TÌM KIẾM THÀNH VIÊN */}
          <section className="bg-white p-6 rounded-3xl border border-[#e2e2e7]/50 shadow-sm space-y-4">
            <h3 className="font-headline font-bold text-sm text-[#4b5b9a] uppercase tracking-widest">
              Thêm thành viên
            </h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập ID (u789 để test)..."
                value={searchMemberId}
                onChange={(e) => setSearchMemberId(e.target.value)}
                className="w-full bg-[#f3f3f8] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#4b5b9a]/30 transition-all"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5b9a]">
                person_search
              </span>
            </div>
            {searchMemberId === "u789" && (
              <div className="flex items-center justify-between p-3 bg-[#f9f9fe] border border-[#dde1ff] rounded-2xl animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dde1ff] flex items-center justify-center text-[#4b5b9a] font-bold">
                    Q
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1c1f]">
                      Lê Anh Quân
                    </p>
                    <p className="text-[10px] text-[#767681]">ID: u789</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert("Đã gửi lời mời!");
                    setSearchMemberId("");
                  }}
                  className="bg-[#4b5b9a] text-white text-[10px] font-black px-4 py-2 rounded-xl"
                >
                  Thêm
                </button>
              </div>
            )}
          </section>

          {/* DANH SÁCH THÀNH VIÊN */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
                Thành viên ({groupContent.members.length})
              </h3>
              <button
                onClick={() =>
                  isCreator ? alert("Giải tán") : alert("Rời nhóm")
                }
                className={`text-[10px] font-black uppercase underline tracking-wider ${
                  isCreator ? "text-[#ba1a1a]" : "text-[#4b5b9a]"
                }`}
              >
                {isCreator ? "Giải tán nhóm" : "Rời khỏi nhóm"}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {groupContent.members.map((mate: any) => (
                <div
                  key={mate.id}
                  className="bg-white rounded-2xl p-4 border border-[#e2e2e7]/50 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#dde1ff]">
                      <Image
                        src={mate.avatar}
                        alt="avatar"
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1a1c1f]">
                        {mate.name}
                      </p>
                      <p className="text-[10px] font-black text-[#4b5b9a] uppercase">
                        {mate.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`text-xs font-black ${
                          mate.balance >= 0
                            ? "text-[#059669]"
                            : "text-[#ba1a1a]"
                        }`}
                      >
                        {mate.balance >= 0 ? "+" : ""}
                        {formatCurrency(mate.balance)}
                      </p>
                    </div>
                    {isCreator && mate.id !== MY_USER_ID && (
                      <button
                        onClick={() => alert(`Đã xóa ${mate.name}`)}
                        className="text-[#c6c5d1] hover:text-[#ba1a1a] transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          person_remove
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* THANH TÌM KIẾM & LỌC LỊCH SỬ NHÓM (GIỐNG ANALYTICS) */}
          <section className="flex gap-2">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5b9a] text-xl">
                search
              </span>
              <input
                className="w-full bg-[#e2e2e7] border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#4b5b9a]/30 transition-all"
                placeholder="Tìm giao dịch trong nhóm..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
            <button
              onClick={() =>
                setPriceSort((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className={`px-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${
                priceSort !== "none"
                  ? "bg-[#4b5b9a] text-white border-transparent"
                  : "bg-white text-[#767681] border-[#e2e2e7]"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                swap_vert
              </span>
              {priceSort !== "none" && (
                <span className="text-[8px] font-black uppercase">
                  {priceSort === "desc" ? "Cao" : "Thấp"}
                </span>
              )}
            </button>
          </section>
        </div>

        {/* LỊCH SỬ NHÓM - STICKY HEADER LEVEL 2 */}
        <section className="pb-40">
          <div className="sticky top-0 z-40 bg-[#f9f9fe]/95 backdrop-blur-md px-6 py-4 flex flex-col gap-1 border-b border-[#e2e2e7]/30 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-black text-lg text-[#1a1c1f]">
                {historySearch ? "Kết quả tìm kiếm" : "Lịch sử giao dịch"}
              </h3>
              {/* TÊN NHÓM SẼ HIỆN Ở ĐÂY VÀ DÍNH KÈM VỚI LỊCH SỬ */}
              <span className="text-[9px] font-black text-[#4b5b9a] bg-[#dde1ff] px-2.5 py-1 rounded-full uppercase tracking-wider">
                {groupInfo?.name}
              </span>
            </div>
            {!historySearch && (
              <p className="text-[10px] font-bold text-[#767681] opacity-70 italic">
                Dữ liệu đồng bộ mới nhất
              </p>
            )}
          </div>

          <div className="px-6 pt-4 space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((tx: any) => (
                <div
                  key={tx.id}
                  className="bg-white p-5 rounded-3xl border border-[#e2e2e7]/50 shadow-sm animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.isAdvance
                            ? "bg-[#fff0ee] text-[#ba1a1a]"
                            : "bg-[#f3f3f8] text-[#4b5b9a]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {tx.isAdvance ? "emergency_share" : "payments"}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[#1a1c1f]">
                          {tx.title}
                        </p>
                        <p className="text-[10px] font-medium text-[#767681]">
                          {tx.spender} • {tx.date}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-headline font-black text-sm ${
                        tx.amount < 0 ? "text-[#ba1a1a]" : "text-[#059669]"
                      }`}
                    >
                      {/* Nếu số tiền > 0 thì hiện dấu cộng phía trước */}
                      {tx.amount > 0 ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </p>
                  </div>
                  {tx.note && !tx.isAdvance && (
                    <div className="mt-3 px-4 py-2 bg-[#f3f3f8] rounded-xl border-l-2 border-[#c6c5d1]">
                      <p className="text-[10px] font-medium text-[#616470] italic">
                        <span className="material-symbols-outlined text-[10px] mr-1 inline-block translate-y-0.5">
                          sticky_note_2
                        </span>
                        {tx.note}
                      </p>
                    </div>
                  )}
                  {tx.isAdvance && (
                    <div className="bg-[#f3f3f8] rounded-2xl p-4 mt-3 border-l-4 border-[#ba1a1a]">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold text-[#616470] italic">
                          "{tx.note}"
                        </p>
                        <span className="text-[9px] font-black uppercase text-[#ba1a1a] bg-[#ffdad6] px-1.5 py-0.5 rounded">
                          Người khác ứng
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[#e2e2e7]">
                        <p className="text-[10px] text-[#767681]">
                          Phần của bạn (đã trừ cá nhân):
                        </p>
                        <p className="text-[11px] font-black text-[#1a1c1f]">
                          {formatCurrency(
                            tx.amount / (groupContent.members.length || 1)
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-30">
                <span className="material-symbols-outlined text-5xl">
                  search_off
                </span>
                <p className="text-sm font-bold mt-2">
                  Không tìm thấy giao dịch
                </p>
              </div>
            )}

            {/* NÚT XEM THÊM ĐỘNG */}
            {filteredHistory.length > 0 && !historySearch && (
              <button className="w-full py-8 flex flex-col items-center gap-2 group">
                <div className="w-10 h-10 bg-white border border-[#e2e2e7] rounded-full flex items-center justify-center text-[#767681] group-hover:text-[#4b5b9a] group-hover:border-[#4b5b9a] transition-all">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Lớp phủ đáy mượt mà */}
      <div className="absolute bottom-20 left-0 right-0 h-16 bg-gradient-to-t from-[#f9f9fe] to-transparent pointer-events-none z-10"></div>
    </main>
  );
}
