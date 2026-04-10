"use client";

import React from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "đ";
const formatCompact = (num: number) => {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "Tr";
  if (num >= 1000) return (num / 1000).toFixed(0) + "K";
  return num.toString();
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const rawCategoryId = (params?.categoryId as string) || "danh-muc";
  const categoryName = rawCategoryId
    .replace(/-/g, " ")
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  const contextLabel = searchParams.get("label") || "Khoảng thời gian này";

  // Dữ liệu biểu đồ giả lập (6 ngày gần nhất)
  const chartData = [
    { label: "11/04", amount: 150000 },
    { label: "12/04", amount: 0 },
    { label: "13/04", amount: 320000 },
    { label: "14/04", amount: 120000 },
    { label: "15/04", amount: 500000 },
    { label: "16/04", amount: 250000 },
  ];
  const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);
  const totalAmount = chartData.reduce((sum, d) => sum + d.amount, 0);

  // Dữ liệu giao dịch giả lập
  const transactions = [
    {
      id: "1",
      title: "Cơm tấm Sà Bì Chưởng",
      date: "16/04/2026",
      amount: 250000,
    },
    { id: "2", title: "Cà phê Highlands", date: "15/04/2026", amount: 80000 },
    { id: "3", title: "Ăn lẩu Hadilao", date: "15/04/2026", amount: 420000 },
    { id: "4", title: "Bánh mì buổi sáng", date: "14/04/2026", amount: 120000 },
    { id: "5", title: "Trà sữa Phê La", date: "13/04/2026", amount: 320000 },
  ];

  return (
    <main className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-[100dvh] flex flex-col relative overflow-x-hidden">
      {/* Header */}
      <header className="w-full top-0 sticky z-50 bg-[#f9f9fe]/90 backdrop-blur-xl flex items-center px-6 py-4 border-b border-[#e2e2e7]/30">
        <button
          onClick={() => router.back()}
          className="flex items-center text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full px-2 py-1 -ml-2 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
          <span className="font-headline font-bold text-lg ml-1">Quay lại</span>
        </button>
      </header>

      {/* Trả lại khung lớn max-w-md */}
      <div className="flex-grow overflow-y-auto px-6 pb-12 scrollbar-hide flex flex-col items-center mx-auto w-full max-w-md">
        <div className="w-full space-y-6 pt-4">
          <div>
            <h1 className="font-headline font-bold text-2xl text-[#1a1c1f] tracking-tight">
              {categoryName}
            </h1>
          </div>

          <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white p-6 rounded-2xl shadow-md shadow-[#4b5b9a]/20">
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">
              Tổng chi ({contextLabel})
            </p>
            <h2 className="font-headline text-4xl font-black">
              {formatCurrency(totalAmount)}
            </h2>
            <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
              <div>
                <p className="text-[10px] opacity-80 uppercase tracking-wider">
                  Trung bình
                </p>
                <p className="font-bold text-sm">
                  {formatCurrency(Math.round(totalAmount / 6))}/kỳ
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] opacity-80 uppercase tracking-wider">
                  Giao dịch
                </p>
                <p className="font-bold text-sm">{transactions.length} lần</p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
            <h3 className="font-headline font-bold text-base text-[#1a1c1f] mb-8">
              Biến động chi tiêu
            </h3>

            <div className="relative overflow-hidden h-48 flex flex-col justify-end">
              <div className="flex items-end justify-between w-full h-full pb-2">
                {chartData.map((data, idx) => {
                  const barHeight = (data.amount / maxAmount) * 120;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1.5 shrink-0 relative flex-1"
                    >
                      {data.amount > 0 && (
                        <span className="absolute -top-6 text-[10px] font-black text-[#4b5b9a]">
                          {formatCompact(data.amount)}
                        </span>
                      )}
                      <div
                        className="w-3/5 max-w-[24px] rounded-t-md bg-[#94a3e8]"
                        style={{ height: `${barHeight}px` }}
                      ></div>
                      <span className="text-[10px] font-bold text-[#616470] text-center mt-2">
                        {data.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
            <h3 className="font-headline font-bold text-base text-[#1a1c1f] mb-4">
              Lịch sử giao dịch
            </h3>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-[#f3f3f8] last:border-0 last:pb-0"
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-sm text-[#1a1c1f] truncate">
                      {tx.title}
                    </p>
                    <p className="text-[10px] text-[#767681] mt-1 font-medium">
                      {tx.date}
                    </p>
                  </div>
                  <p className="font-headline font-bold text-sm text-[#ba1a1a] shrink-0">
                    -{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
