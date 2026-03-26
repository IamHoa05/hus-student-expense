"use client";

import React, { useState } from "react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";

// =======================================================================
// 1. DATA TYPES & MOCK DATA (Giữ nguyên logic của bạn)
// =======================================================================
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  time: string;
  icon: string;
  category: string;
  isScanned: boolean;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    title: "Cơm tấm Sà Bì Chưởng",
    amount: 35000,
    type: "expense",
    date: "Hôm nay",
    time: "12:30",
    icon: "restaurant",
    category: "Ăn uống",
    isScanned: true,
  },
  {
    id: "t2",
    title: "Grab Bike - Về nhà",
    amount: 22000,
    type: "expense",
    date: "Hôm qua",
    time: "18:15",
    icon: "directions_car",
    category: "Di chuyển",
    isScanned: false,
  },
  {
    id: "t3",
    title: "Nhà sách Fahasa",
    amount: 158000,
    type: "expense",
    date: "15 Tháng 10",
    time: "09:00",
    icon: "school",
    category: "Học tập",
    isScanned: true,
  },
  {
    id: "t4",
    title: "Highlands Coffee",
    amount: 45000,
    type: "expense",
    date: "14 Tháng 10",
    time: "20:30",
    icon: "local_cafe",
    category: "Ăn uống",
    isScanned: true,
  },
];

const MOCK_INVOICES = [
  {
    id: "inv1",
    merchant: "Starbucks Coffee",
    amount: 145000,
    date: "Hôm nay",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7ISXMn9TDpaV3Lgs-g4NwJC7yVq34vuCkycUdDs3un1WpjWUQWKj2Szo2aumYWVf2Y2gVnBKTGjqbyTmtK4leRdYpjurGlhr8tQnTXietVLElokVFCcN-NMWArskItY78zC13_qv5vdoO6OUAKIprrk48SLPOJgm3eL9kD3LNocNUCEvZCFvtFmsc68gpB_MqDEtM-KRkz3IufO-RmR2pdZO4R9DvrMUbSp1xmmQVcxo1n3DjOzr9klCqBtet8R9LB8RGWvq-e6o",
    status: "Chưa chia tiền",
  },
  {
    id: "inv2",
    merchant: "Siêu thị WinMart",
    amount: 1230000,
    date: "Hôm qua",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0eezip6wiSl636UqWiB4AgXAYgCsYqAAl6xYksFdNx_3IrajIReL_Kkhqmar62DeFMKSCFkkqhMwPoGpsy49RaQhOMWSD2hfA28XDC4V1k6cnL887EWnrljpDIg59uuAgIwwjJo9BXbybUHQKXj1cHqQhW_1rm4q3XTUO13kq2YLoYT8r4sXH_8EBVkU8TXOgKCdlMjxcDqvm7Qzdbqrh6m0QG8qWi3d4yyfea-M2r9LK-VKCmatjjq6uC6AFctuVPu34zdFvfLs",
    status: "Đã chia tiền",
  },
];

const formatCurrency = (amount: number, type?: string) => {
  const sign = type === "expense" ? "-" : type === "income" ? "+" : "";
  return `${sign}${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

// =======================================================================
// 2. GIAO DIỆN CHÍNH (Thứ tự từ trên xuống dưới)
// =======================================================================
export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "scanned">("all");

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-32 relative min-h-screen">
      {/* 1. TopBar */}
      <TopBar />

      <div className="space-y-8 mt-6">
        {/* 2. Tiêu đề: Lịch sử giao dịch & Theo dõi */}
        <section>
          <h2 className="font-headline text-4xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">
            Lịch sử giao dịch
          </h2>
          <p className="text-[#616470] font-medium text-sm leading-relaxed">
            Theo dõi các khoản chi tiêu thông minh của bạn
          </p>
        </section>

        {/* 3. Xuất báo cáo */}
        <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white py-4 rounded-2xl font-headline font-bold shadow-lg shadow-[#4b5b9a]/20 active:scale-95 transition-transform">
          <span className="material-symbols-outlined">file_download</span>
          Xuất báo cáo PDF/Excel
        </button>

        {/* 4. Tìm kiếm */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[#4b5b9a]">
            search
          </span>
          <input
            className="w-full bg-[#e2e2e7] border-none rounded-2xl py-5 pl-14 pr-12 text-[#1a1c1f] focus:ring-2 focus:ring-[#4b5b9a]/40 transition-all placeholder:text-[#767681]"
            placeholder="Tìm 'Cơm < 40k' hoặc 'Grab'"
            type="text"
          />
          <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#767681]">
            tune
          </span>
        </div>

        {/* 5. Tổng chi tiêu tháng này */}
        <section className="bg-white p-7 rounded-3xl shadow-sm border border-[#e2e2e7]/50">
          <p className="font-label text-[10px] uppercase font-bold tracking-[0.15em] text-[#5b5e6a] mb-2">
            Tổng chi tiêu tháng này
          </p>
          <div className="flex items-end justify-between">
            <h3 className="font-headline text-4xl font-black text-[#4b5b9a]">
              4.250.000đ
            </h3>
            <div className="flex items-center gap-1 text-[#ba1a1a] font-bold text-xs mb-1">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              <span>+12%</span>
            </div>
          </div>
        </section>

        {/* 6. Phân loại chi tiêu (Dạng danh sách cuộn dọc) */}
        <section className="bg-[#f3f3f8] p-6 rounded-3xl space-y-5">
          <h4 className="font-headline font-bold text-[#1a1c1f] mb-2">
            Phân loại chi tiêu
          </h4>
          <div className="space-y-4">
            <CategoryRow
              label="Ăn uống"
              amount="1.800k"
              color="bg-[#4b5b9a]"
              percent="65%"
            />
            <CategoryRow
              label="Di chuyển"
              amount="450k"
              color="bg-[#94a3e8]"
              percent="15%"
            />
            <CategoryRow
              label="Học tập"
              amount="1.200k"
              color="bg-[#5b5e6a]"
              percent="20%"
            />
          </div>
          {/* Progress bar tổng */}
          <div className="pt-2">
            <div className="h-2.5 w-full bg-[#e2e2e7] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8]"
                style={{ width: "65%" }}
              ></div>
            </div>
            <p className="text-[10px] mt-3 text-[#767681] font-bold uppercase tracking-widest text-center">
              65% hạn mức đã dùng
            </p>
          </div>
        </section>

        {/* 7. Giao dịch gần đây (Gồm tab Tất cả & Đã quét) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-headline font-bold text-xl text-[#1a1c1f]">
              Giao dịch gần đây
            </h4>
            <div className="flex bg-[#e2e2e7] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeTab === "all"
                    ? "bg-white text-[#4b5b9a] shadow-sm"
                    : "text-[#767681]"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab("scanned")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  activeTab === "scanned"
                    ? "bg-white text-[#4b5b9a] shadow-sm"
                    : "text-[#767681]"
                }`}
              >
                Đã quét
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="space-y-3">
            {activeTab === "all" ? (
              MOCK_TRANSACTIONS.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-white p-4 rounded-2xl flex items-center justify-between border border-[#e2e2e7]/50 shadow-sm active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f3f3f8] rounded-full flex items-center justify-center text-[#4b5b9a]">
                      <span className="material-symbols-outlined">
                        {tx.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1a1c1f] line-clamp-1">
                        {tx.title}
                      </p>
                      <p className="text-[10px] text-[#767681]">
                        {tx.time} • {tx.isScanned ? "AI Scanned" : "Manual"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-headline font-bold text-sm text-[#1a1c1f]">
                      {formatCurrency(tx.amount, tx.type)}
                    </p>
                    <p className="text-[9px] text-[#4b5b9a] font-black uppercase mt-0.5">
                      {tx.category}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Hóa đơn dạng lưới 2 cột cho tiết kiệm diện tích mobile */}
                {MOCK_INVOICES.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white rounded-2xl overflow-hidden border border-[#e2e2e7]/50 shadow-sm"
                  >
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={inv.imageUrl}
                        alt={inv.merchant}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 p-2 bg-black/40 backdrop-blur-sm w-full text-white">
                        <p className="text-[9px] truncate font-bold">
                          {inv.merchant}
                        </p>
                        <p className="text-xs font-black">
                          {new Intl.NumberFormat("vi-VN").format(inv.amount)}đ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="w-full py-4 text-[#4b5b9a] font-bold text-[10px] uppercase tracking-[0.2em] opacity-50">
              Xem thêm giao dịch
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

// Component nhỏ hỗ trợ trình bày dòng phân loại
function CategoryRow({
  label,
  amount,
  color,
  percent,
}: {
  label: string;
  amount: string;
  color: string;
  percent: string;
}) {
  return (
    <div className="flex items-center justify-between bg-white/50 p-3 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
        <span className="text-sm font-semibold text-[#454650]">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm font-bold text-[#1a1c1f]">{amount}</span>
        <span className="text-[10px] ml-2 text-[#767681]">{percent}</span>
      </div>
    </div>
  );
}
