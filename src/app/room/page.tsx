"use client";

import React from "react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";

// =======================================================================
// MOCK DATA (Dữ liệu ảo cho trang Quản lý Quỹ Phòng)
// =======================================================================
const MOCK_FUND = {
  currentBalance: 4250000,
  totalIncome: 5000000,
  totalExpense: 1770000,
  spendLimitPercent: 65,
};

const MOCK_ROOMMATES = [
  {
    id: "r1",
    name: "Minh Tuấn",
    role: "Trưởng phòng",
    balance: 240000,
    statusText: "Đang dư quỹ",
    statusType: "positive",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDy0pdjoA4C7o5aB2fysBXRedlEzw1wgj1TTRL9grpN_GjAdNgQO8ktZujCrxyRdFiFT7UVTQAvN9ii3v-5yKgcyyDPHBCZbE-LZ_sSuC62OlMqA3ttM4iPv2hKazzVSq3P2tx-AWL_Ax_w4y9O8Vcvrh83s-IeA6hCHd5cQxepLGJ5F7cpEgjzTRydBVe-MCejxQ9yLAQ-RIZ04WUZpgH5zm6ARDgw5rCCuiHDFNsHojCY1RLwgCTotJ_AIYXSmY9TheU40WGT-qM",
  },
  {
    id: "r2",
    name: "Hà Vy",
    role: "Thành viên",
    balance: -120000,
    statusText: "Chưa đóng tiền điện",
    statusType: "negative",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXz9F4BNhpwsFrqN7fkTGjQ1PsuokawaM1tsxcZtbm5ZkoyUBoVC6yNkMMkkfJOv_cCzbpLVzQ2ZlJkp_UbF_RcG_UaNT7oOpSOeNBoTVf50finFof3a0bGxtSJBdLqnSdKJ098krEijTXUiszyd1VFA-gxssnx5uRBx0gE0UWl9uyJ-HCl1TECq9QhlCpDQxzDKyw4x_mNkLFeoJcXrCjE05RpCxdv4IdaFpTxV8tqjkktXdeuwWZA8blqL_bo4oH4CHNVkUNcDg",
  },
  {
    id: "r3",
    name: "Đức Duy",
    role: "Thành viên",
    balance: 0,
    statusText: "Đã tất toán",
    statusType: "neutral",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuATR5J9z5G1t84sXR8bl77_0c3tyhoEWt3ZcjERkE1A8xqu82gPO6-J1F7jOetWySkqSEXDIMRkXzP3iGikU0yh_o8GbKvEgPL1z9eJVJgjhreYLHTKVD-4skJwnOn4SzMOT6fkRExPVP9bQZw9Ywow5bqYEK7ZzNApV7FozHOR3-wIZw0axGnUz8A3xheOtIPBikA_Ppv7VI941t6fvNe4SnKjRkLUd3_tSSL75AI8byp9KLZxhHu3Zq51aaYPcszZ9IzOVDGGy-Q",
  },
  {
    id: "r4",
    name: "Thanh Thảo",
    role: "Thành viên",
    balance: -85000,
    statusText: "Nợ tiền nước",
    statusType: "negative",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC57iKE7FxwvkoCD2Syb3qj9exMliY-sYttqnwkYi1qMSBz6CfX6uPNAFQezJ8ug2WBXIf0HVnJ5pi75FTrMgVxrw-SqPlCgkEAiN1Lqe-lvlLQs0RYEq2K8onhpynV9iW0AiUiQEYWaTTUAMV5kFARiBMLH_aOg0qlyEG8tLGMTsanlpFCLGNtuhYfnGBaDKfTO_oTOEK8n1ssusibft2OC5yIBdJufF9PF0Xwfc0dewIRFnk53XAw_tnL-q-XRFz1f0_k09wU0YE",
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: "tx1",
    title: "Đóng quỹ tháng 10",
    subtitle: "Minh Tuấn • 14:20, 15/10",
    amount: 1000000,
    type: "income",
    icon: "payments",
  },
  {
    id: "tx2",
    title: "Tiền điện tháng 9",
    subtitle: "Thanh toán tự động • 08:30, 10/10",
    amount: -1450000,
    type: "expense",
    icon: "electric_bolt",
  },
  {
    id: "tx3",
    title: "Tiền nước tháng 9",
    subtitle: "Thanh toán tự động • 08:29, 10/10",
    amount: -320000,
    type: "expense",
    icon: "water_drop",
  },
];

// Hàm hỗ trợ format tiền tệ (có tự động thêm dấu + hoặc -)
const formatCurrency = (amount: number, showSign: boolean = false) => {
  const sign = showSign && amount > 0 ? "+" : "";
  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(amount)
    .replace("₫", "đ");
  return `${sign}${formatted}`;
};

export default function RoomFundPage() {
  return (
    <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-28 relative min-h-screen">
      {/* Sử dụng TopBar chung */}
      <TopBar />

      <div className="space-y-8 mt-2">
        {/* =========================================
            Hero Section: Wallet Balance 
            ========================================= */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-8 text-white shadow-lg shadow-[#4b5b9a]/20">
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-white/80 font-medium tracking-wide font-label uppercase text-sm mb-2">
              Quỹ phòng hiện tại
            </span>
            <h1 className="font-headline font-extrabold text-4xl tracking-tight mb-6 text-white">
              {formatCurrency(MOCK_FUND.currentBalance)}
            </h1>
            <div className="flex gap-3 w-full justify-center">
              <Link
                href="/room/deposit"
                className="flex-1 bg-white/20 backdrop-blur-md py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white/30 transition-all active:scale-95 text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  add_circle
                </span>
                Nạp quỹ
              </Link>
              <Link
                href="/room/split"
                className="flex-1 bg-[#94a3e8] text-[#283775] py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-md text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  receipt_long
                </span>
                Split Bill
              </Link>
            </div>
          </div>

          {/* Organic shapes for "Fluid Scholar" theme */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#e0e2f1]/20 rounded-full blur-2xl"></div>
        </section>

        {/* =========================================
            Roommates Grid (Bento Style) 
            ========================================= */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline font-bold text-xl text-[#4b5b9a]">
              Thành viên phòng ({MOCK_ROOMMATES.length})
            </h2>
            <button className="text-[#4b5b9a] font-semibold text-sm flex items-center gap-1 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-base">
                person_add
              </span>
              Thêm mới
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {MOCK_ROOMMATES.map((mate) => (
              <div
                key={mate.id}
                className="bg-white rounded-2xl p-5 flex flex-col items-center text-center space-y-3 shadow-sm border border-[#e2e2e7]/50 hover:border-[#dde1ff] transition-colors cursor-pointer group"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#f3f3f8] group-hover:border-[#94a3e8] transition-colors">
                  <Image
                    src={mate.avatarUrl}
                    alt={mate.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-headline font-bold text-[#1a1c1f] text-sm">
                    {mate.name}
                  </p>
                  <p className="text-[10px] text-[#767681] uppercase tracking-widest font-label mt-0.5">
                    {mate.role}
                  </p>
                </div>

                <div
                  className={`w-full py-1.5 rounded-full ${
                    mate.statusType === "positive"
                      ? "bg-[#f3f3f8]"
                      : mate.statusType === "negative"
                      ? "bg-[#ffdad6]/40"
                      : "bg-[#f3f3f8]"
                  }`}
                >
                  <span
                    className={`font-bold text-xs ${
                      mate.statusType === "positive"
                        ? "text-[#4b5b9a]"
                        : mate.statusType === "negative"
                        ? "text-[#ba1a1a]"
                        : "text-[#616470]"
                    }`}
                  >
                    {formatCurrency(mate.balance, true)}
                  </span>
                </div>

                <p
                  className={`text-[10px] font-medium ${
                    mate.statusType === "positive"
                      ? "text-[#616470]"
                      : mate.statusType === "negative"
                      ? "text-[#ba1a1a]"
                      : "text-[#616470]"
                  }`}
                >
                  {mate.statusText}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================
            Settlement Stats Card 
            ========================================= */}
        <section>
          <div className="bg-[#f3f3f8] rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-[#e2e2e7]/60">
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-lg mb-5 text-[#454650]">
                Thống kê tháng này
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-label text-[#616470] mb-0.5">
                      Tổng thu
                    </p>
                    <p className="text-xl font-bold text-[#4b5b9a]">
                      {formatCurrency(MOCK_FUND.totalIncome)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#94a3e8]">
                    trending_up
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-label text-[#616470] mb-0.5">
                      Tổng chi
                    </p>
                    <p className="text-xl font-bold text-[#ba1a1a]">
                      {formatCurrency(MOCK_FUND.totalExpense)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#ffdad6]">
                    trending_down
                  </span>
                </div>
              </div>
            </div>

            {/* Mini momentum tracker style visual */}
            <div className="mt-6 relative z-10">
              <div className="flex justify-between text-[10px] font-bold mb-1.5 text-[#616470]">
                <span>Hạn mức chi tiêu</span>
                <span>{MOCK_FUND.spendLimitPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#e2e2e7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] rounded-full"
                  style={{ width: `${MOCK_FUND.spendLimitPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Abstract Background */}
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#4b5b9a]/5 rounded-full blur-2xl"></div>
          </div>
        </section>

        {/* =========================================
            Settlement Log Section 
            ========================================= */}
        <section className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline font-bold text-xl text-[#4b5b9a]">
              Lịch sử giao dịch quỹ
            </h2>
            <button className="text-[#616470] text-sm font-medium hover:text-[#4b5b9a] transition-colors">
              Xem tất cả
            </button>
          </div>

          <div className="bg-white border border-[#e2e2e7]/50 rounded-2xl p-2 shadow-sm">
            {MOCK_TRANSACTIONS.map((tx, index) => (
              <React.Fragment key={tx.id}>
                <div className="flex items-center justify-between group cursor-pointer p-4 hover:bg-[#f3f3f8] transition-colors rounded-xl">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform ${
                        tx.type === "income"
                          ? "bg-[#f3f3f8] text-[#4b5b9a]"
                          : "bg-[#fff0ee] text-[#ba1a1a]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {tx.icon}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1a1c1f] text-sm">
                        {tx.title}
                      </h4>
                      <p className="text-[11px] text-[#616470] mt-0.5">
                        {tx.subtitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm shrink-0 ${
                      tx.type === "income" ? "text-[#4b5b9a]" : "text-[#ba1a1a]"
                    }`}
                  >
                    {formatCurrency(tx.amount, true)}
                  </span>
                </div>
                {/* Divider (không render ở item cuối) */}
                {index < MOCK_TRANSACTIONS.length - 1 && (
                  <div className="h-px bg-[#e2e2e7]/50 mx-4"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
