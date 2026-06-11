"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopBar from "@/components/layout/TopBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// =======================================================================
// INTERFACES
// =======================================================================
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  time: string;
  monthGroup: string;
  icon: string;
  category: string;
  isScanned: boolean;
}

interface ScannedInvoice {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  time: string;
  monthGroup: string;
  imageUrl: string;
}

const getCurrentMonthGroup = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return `Tháng ${month.toString().padStart(2, "0")}/${year}`;
};

const formatCurrency = (amount: number, type?: string) => {
  const sign = type === "expense" ? "-" : type === "income" ? "+" : "";
  return `${sign}${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

const groupDataByMonthGroup = <T extends { monthGroup: string }>(data: T[]) => {
  return data.reduce((groups: Record<string, T[]>, item) => {
    const groupName = item.monthGroup;
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(item);
    return groups;
  }, {});
};

// =======================================================================
// COMPONENT CHÍNH
// =======================================================================
function TransactionsContent() {
  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  const [isMounted, setIsMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<"all" | "scanned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [selectedInvoice, setSelectedInvoice] = useState<ScannedInvoice | null>(
    null
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<ScannedInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [displayLimitTx, setDisplayLimitTx] = useState(10);
  const [displayLimitInv, setDisplayLimitInv] = useState(10);

  // =======================================================================
  // FETCH DỮ LIỆU
  // =======================================================================
  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, invRes] = await Promise.all([
        fetch(`${API_URL}/transactions`, { credentials: "include" }),
        fetch(`${API_URL}/transactions/invoices`, { credentials: "include" }),
      ]);

      if (txRes.ok) {
        const payload = await txRes.json();
        let dataGroups = Array.isArray(payload?.data?.data)
          ? payload.data.data
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
        if (Array.isArray(payload)) dataGroups = payload;

        const mappedTx: Transaction[] = dataGroups.flatMap((group: any) => {
          const txs = group.transactions || group;
          return Array.isArray(txs)
            ? txs.map((t: any) => {
                const amountVal = Number(t.amount ?? t.total_amount ?? 0);
                const created = new Date(
                  t.transaction_date ?? t.created_at ?? Date.now()
                );
                return {
                  id: String(t.transaction_id ?? t.id),
                  title: t.note || "Giao dịch",
                  amount: isFinite(amountVal) ? amountVal : 0,
                  type: t.transaction_type === "inflow" ? "income" : "expense",
                  date: created.toLocaleDateString("vi-VN"),
                  time: created.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  monthGroup: `Tháng ${String(created.getMonth() + 1).padStart(
                    2,
                    "0"
                  )}/${created.getFullYear()}`,
                  icon: t.icon || "category",
                  category: t.category_name || "Khác",
                  isScanned: Boolean(t.is_scanned || t.source === "ocr"),
                };
              })
            : [];
        });
        setTransactions(mappedTx);
      }

      if (invRes.ok) {
        const invData = await invRes.json();
        const items = Array.isArray(invData) ? invData : invData.data || [];

        const mappedInv: ScannedInvoice[] = items.map(
          (inv: any, idx: number) => {
            const created = new Date(
              inv.transaction_date || inv.created_at || Date.now()
            );
            return {
              id: String(inv.transaction_id || inv.id || `temp-${idx}`),
              merchant: inv.store_name || inv.note || "Hóa đơn OCR",
              amount: Number(inv.total_amount || inv.amount || 0),
              date: created.toLocaleDateString("vi-VN"),
              time: created.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              monthGroup: `Tháng ${String(created.getMonth() + 1).padStart(
                2,
                "0"
              )}/${created.getFullYear()}`,
              imageUrl: inv.image_url || "",
            };
          }
        );

        mappedInv.sort(
          (a, b) =>
            new Date(b.date.split("/").reverse().join("-")).getTime() -
            new Date(a.date.split("/").reverse().join("-")).getTime()
        );
        setInvoices(mappedInv);
      }
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, [refresh]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.title.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }
    if (priceSort === "asc") result.sort((a, b) => a.amount - b.amount);
    if (priceSort === "desc") result.sort((a, b) => b.amount - a.amount);
    return result;
  }, [searchQuery, priceSort, transactions]);

  const groupedTransactions = useMemo(
    () => groupDataByMonthGroup(filteredTransactions.slice(0, displayLimitTx)),
    [filteredTransactions, displayLimitTx]
  );
  const groupedInvoices = useMemo(
    () => groupDataByMonthGroup(invoices.slice(0, displayLimitInv)),
    [invoices, displayLimitInv]
  );

  const currentMonthGroup = getCurrentMonthGroup();
  const currentMonthExpense = useMemo(() => {
    return transactions
      .filter(
        (tx) => tx.type === "expense" && tx.monthGroup === currentMonthGroup
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [currentMonthGroup, transactions]);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-20">
        <span className="material-symbols-outlined animate-spin text-[#4b5b9a] text-4xl">
          autorenew
        </span>
        <p className="font-bold text-[#4b5b9a] text-sm">
          Đang dựng giao diện...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden relative">
      <div className="px-5 pt-4 shrink-0 bg-[#f9f9fe] z-50">
        <TopBar />
      </div>

      <div className="flex-grow overflow-y-auto px-5 pb-32 scrollbar-hide">
        {loading && (
          <div className="w-full py-3 text-center rounded-xl bg-[#dde1ff] text-[#4b5b9a] font-bold text-sm my-4 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">
              autorenew
            </span>
            <p>Đang tải dữ liệu...</p>
          </div>
        )}

        <div className="space-y-5 pt-2 pb-6">
          <section>
            <h2 className="font-headline text-3xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">
              Lịch sử giao dịch
            </h2>
            <p className="text-[#616470] font-medium text-xs">
              Quản lý chi tiêu khoa học
            </p>
          </section>

          <Link
            href="/transactions/export"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white py-4 rounded-2xl font-headline font-bold shadow-lg shadow-[#4b5b9a]/25 active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined">file_download</span>
            Xuất báo cáo PDF / Excel
          </Link>

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5b9a] text-lg">
                search
              </span>
              <input
                className="w-full bg-[#e2e2e7] border-none rounded-xl py-3 pl-10 pr-3 text-sm focus:outline-none outline-none"
                placeholder="Tìm giao dịch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() =>
                setPriceSort((prev) =>
                  prev === "desc" ? "asc" : prev === "asc" ? "none" : "desc"
                )
              }
              className={`px-3 rounded-xl flex flex-col items-center justify-center border transition-all outline-none ${
                priceSort !== "none"
                  ? "bg-[#4b5b9a] text-white border-transparent shadow-md"
                  : "bg-white text-[#767681] border-[#e2e2e7]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {priceSort === "none" ? "filter_list" : "swap_vert"}
              </span>
            </button>
          </div>

          <section className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e2e7]/50 relative overflow-hidden">
            <p className="font-label text-[9px] uppercase font-bold tracking-widest text-[#5b5e6a] mb-1">
              Chi tiêu tháng này
            </p>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="font-headline text-2xl font-black text-[#4b5b9a]">
                {new Intl.NumberFormat("vi-VN").format(currentMonthExpense)}đ
              </h3>
            </div>
          </section>
        </div>

        <div className="sticky top-0 bg-[#f9f9fe] py-3 z-40 flex items-center justify-between mb-3 -mx-1 px-1 transition-all">
          <h4 className="font-headline font-bold text-lg text-[#1a1c1f]">
            {searchQuery ? "Kết quả" : "Giao dịch gần đây"}
          </h4>
          <div className="flex bg-[#e2e2e7] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all outline-none ${
                activeTab === "all"
                  ? "bg-white text-[#4b5b9a] shadow-sm"
                  : "text-[#767681]"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("scanned")}
              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all outline-none ${
                activeTab === "scanned"
                  ? "bg-white text-[#4b5b9a] shadow-sm"
                  : "text-[#767681]"
              }`}
            >
              Đã quét
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {activeTab === "all" ? (
            <>
              {Object.entries(groupedTransactions).map(
                ([monthGroup, trans]) => (
                  <div key={monthGroup} className="space-y-2.5">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-[10px] font-black text-[#767681] uppercase tracking-[0.2em] ml-1">
                        {monthGroup}
                      </p>
                      <div className="h-[1px] flex-grow bg-[#e2e2e7]/60"></div>
                    </div>
                    {trans.map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-white p-3.5 rounded-xl flex items-center justify-between gap-3 border border-[#e2e2e7]/50 shadow-sm"
                      >
                        {/* Khối bên trái: Icon + Tiêu đề + Thời gian */}
                        <div className="flex items-center gap-3 flex-grow flex-shrink min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              tx.type === "income"
                                ? "bg-[#d1f4e0] text-[#059669]"
                                : "bg-[#f3f3f8] text-[#4b5b9a]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {tx.icon}
                            </span>
                          </div>
                          {/* min-w-0 bắt buộc ở đây để kích hoạt truncate */}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-[#1a1c1f] truncate" title={tx.title}>
                              {tx.title}
                            </p>
                            <p className="text-[9px] text-[#767681] mt-0.5">
                              {tx.date} • {tx.time}
                            </p>
                          </div>
                        </div>

                        {/* Khối bên phải: Số tiền + Danh mục cố định không bóp méo */}
                        <div className="text-right shrink-0 min-w-[85px]">
                          <p
                            className={`font-headline font-bold text-xs ${
                              tx.type === "income"
                                ? "text-[#059669]"
                                : "text-[#1a1c1f]"
                            }`}
                          >
                            {formatCurrency(tx.amount, tx.type)}
                          </p>
                          <p className="text-[8px] text-[#767681] font-bold uppercase mt-0.5 truncate">
                            {tx.category}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {displayLimitTx < filteredTransactions.length && (
                <button
                  onClick={() => setDisplayLimitTx((prev) => prev + 10)}
                  className="w-full py-5 text-[#767681] font-bold text-[9px] uppercase tracking-[0.25em]"
                >
                  Xem thêm
                </button>
              )}
            </>
          ) : (
            <>
              {Object.entries(groupedInvoices).map(([monthGroup, invs]) => (
                <div key={monthGroup} className="space-y-2.5">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[10px] font-black text-[#767681] uppercase tracking-[0.2em] ml-1">
                      {monthGroup}
                    </p>
                    <div className="h-[1px] flex-grow bg-[#e2e2e7]/60"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {invs.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => setSelectedInvoice(inv)}
                        className="group bg-white rounded-xl overflow-hidden border border-[#e2e2e7]/50 shadow-sm relative aspect-[3/4] cursor-pointer bg-gray-200"
                      >
                        {inv.imageUrl ? (
                          <img
                            src={inv.imageUrl}
                            alt={inv.merchant}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col justify-center items-center opacity-30">
                            <span className="material-symbols-outlined text-4xl">
                              receipt_long
                            </span>
                            <span className="text-[10px] font-bold mt-2">
                              Bấm để tải ảnh
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-0 p-2.5 w-full text-white text-xs">
                          <p className="font-bold truncate opacity-90 uppercase text-[10px]">
                            {inv.merchant}
                          </p>
                          <p className="font-black mt-0.5 text-sm">
                            {new Intl.NumberFormat("vi-VN").format(inv.amount)}đ
                          </p>
                          <p className="text-[8px] opacity-80 mt-0.5">
                            {inv.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {displayLimitInv < invoices.length && (
                <button
                  onClick={() => setDisplayLimitInv((prev) => prev + 10)}
                  className="w-full py-4 text-[#767681] font-bold text-[9px] uppercase tracking-[0.25em]"
                >
                  Xem thêm hóa đơn
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MODAL XEM ẢNH HÓA ĐƠN FULL SCREEN */}
      {/* ======================================================================= */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="w-full h-full flex items-center justify-center relative p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white border-none outline-none active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {selectedInvoice.imageUrl ? (
              <img
                src={selectedInvoice.imageUrl}
                alt="Ảnh hóa đơn gốc"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8Ww8AAmoBbxM6b38AAAAASUVORK5CYII=";
                }}
              />
            ) : (
              <div className="flex flex-col items-center text-white/50 gap-2">
                <span className="material-symbols-outlined text-4xl animate-spin">
                  autorenew
                </span>
                <span className="text-xs">Đang tải tệp ảnh...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =======================================================================
// EXPORT COMPONENT VỚI SUSPENSE
// =======================================================================
export default function TransactionsPage() {
  return (
    <main className="w-full max-w-md mx-auto h-screen bg-[#f9f9fe] overflow-hidden flex flex-col">
      <Suspense
        fallback = {
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-20">
            <span className="material-symbols-outlined animate-spin text-[#4b5b9a] text-4xl">
              autorenew
            </span>
            <p className="font-bold text-[#4b5b9a] text-sm">
              Đang tải dữ liệu...
            </p>
          </div>
        }
      >
        <TransactionsContent />
      </Suspense>
    </main>
  );
}