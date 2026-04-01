"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =======================================================================
// MOCK DATA (Dữ liệu ảo cho trang Chi tiết hạng mục)
// =======================================================================
// Lưu ý: Trong thực tế, bạn sẽ lấy data này dựa trên `categoryId` truyền vào
const CATEGORY_DATA = {
  id: "cat_food",
  name: "Ăn uống",
  totalAmount: 4250000,
  trendPercentage: "+12%",
  transactionCount: 24,
  transactions: [
    {
      date: "Hôm qua",
      items: [
        {
          id: "tx1",
          title: "The Coffee House",
          amount: 45000,
          time: "14:30",
          method: "Thẻ ngân hàng",
          icon: "coffee",
        },
        {
          id: "tx2",
          title: "Phở Thìn Lò Đúc",
          amount: 90000,
          time: "12:15",
          method: "Tiền mặt",
          icon: "lunch_dining",
        },
      ],
    },
    {
      date: "24 Tháng 10",
      items: [
        {
          id: "tx3",
          title: "HaidiLao Hotpot",
          amount: 1200000,
          time: "19:45",
          method: "Thẻ ngân hàng",
          icon: "dinner_dining",
        },
        {
          id: "tx4",
          title: "Siêu thị WinMart",
          amount: 320000,
          time: "08:30",
          method: "Tiền mặt",
          icon: "shopping_bag",
        },
      ],
    },
  ],
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(amount)
    .replace("₫", "đ");
};

export default function CategoryDetailPage() {
  const router = useRouter();

  return (
    <main className="flex-grow w-full max-w-md mx-auto pb-28 relative min-h-screen">
      {/* TopAppBar  */}
      <header className="fixed top-0 w-full max-w-md z-50 bg-[#f9f9fe]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-[#e2e2e7]/30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95 duration-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[#4b5b9a]">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-[#4b5b9a]">
            {CATEGORY_DATA.name}
          </h1>
        </div>
      </header>

      {/* Nội dung chính, đẩy xuống để không bị TopBar che mất */}
      <div className="pt-24 px-6 space-y-10">
        {/* Hero Section: Stats & Mini-Chart */}
        <section>
          <div className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-8 rounded-2xl shadow-[0_20px_40px_rgba(75,91,154,0.12)] text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm opacity-80 mb-2">Tổng chi trong tháng</p>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-6">
                {formatCurrency(CATEGORY_DATA.totalAmount)}
              </h2>

              {/* Mini Trend Chart (Visual Representation) */}
              <div className="h-24 w-full flex items-end gap-2 mt-4">
                <div className="flex-1 bg-white/20 hover:bg-white/40 transition-colors rounded-t-lg h-[40%]"></div>
                <div className="flex-1 bg-white/20 hover:bg-white/40 transition-colors rounded-t-lg h-[60%]"></div>
                <div className="flex-1 bg-white/40 hover:bg-white/60 transition-colors rounded-t-lg h-[90%]"></div>
                <div className="flex-1 bg-white/20 hover:bg-white/40 transition-colors rounded-t-lg h-[50%]"></div>
                <div className="flex-1 bg-white/20 hover:bg-white/40 transition-colors rounded-t-lg h-[30%]"></div>
                <div className="flex-1 bg-white/60 hover:bg-white/80 transition-colors rounded-t-lg h-[100%]"></div>
                <div className="flex-1 bg-white/30 hover:bg-white/50 transition-colors rounded-t-lg h-[70%]"></div>
              </div>
              <div className="flex justify-between text-[10px] mt-2 opacity-80 font-medium">
                <span>Tuần 1</span>
                <span>Tuần 2</span>
                <span>Tuần 3</span>
                <span>Hôm nay</span>
              </div>
            </div>
          </div>
        </section>

        {/* Insights Bento */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#f3f3f8] p-5 rounded-2xl border border-[#e2e2e7]/50">
            <span className="material-symbols-outlined text-[#4b5b9a] mb-3">
              trending_up
            </span>
            <p className="text-xs text-[#616470] font-medium">
              So với tháng trước
            </p>
            <p className="font-headline font-bold text-lg text-[#ba1a1a] mt-1">
              {CATEGORY_DATA.trendPercentage}
            </p>
          </div>
          <div className="bg-[#f3f3f8] p-5 rounded-2xl border border-[#e2e2e7]/50">
            <span className="material-symbols-outlined text-[#4b5b9a] mb-3">
              restaurant
            </span>
            <p className="text-xs text-[#616470] font-medium">
              Số lượt giao dịch
            </p>
            <p className="font-headline font-bold text-lg text-[#1a1c1f] mt-1">
              {CATEGORY_DATA.transactionCount} lượt
            </p>
          </div>
        </section>

        {/* Transaction List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline font-bold text-xl text-[#1a1c1f]">
              Lịch sử giao dịch
            </h3>
            <button className="text-[#4b5b9a] text-sm font-semibold hover:opacity-80 transition-opacity">
              Xem tất cả
            </button>
          </div>

          <div className="space-y-6">
            {CATEGORY_DATA.transactions.map((group, index) => (
              <div key={index}>
                <p className="text-xs font-bold text-[#767681] uppercase tracking-widest mb-4">
                  {group.date}
                </p>
                <div className="space-y-3">
                  {group.items.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-[#e2e2e7]/50 hover:border-[#dde1ff] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#e0e2f1] group-hover:bg-[#dde1ff] transition-colors rounded-full flex items-center justify-center text-[#4b5b9a]">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            {tx.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1c1f] text-sm">
                            {tx.title}
                          </p>
                          <p className="text-xs text-[#616470] mt-0.5">
                            {tx.method} • {tx.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-headline font-bold text-[#1a1c1f]">
                          -{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
