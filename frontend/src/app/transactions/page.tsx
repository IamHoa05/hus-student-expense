"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
// import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// =======================================================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU
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
  isSettled?: boolean;
  source?: string;
}

interface ScannedInvoice {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  time: string;
  monthGroup: string;
  imageUrl: string;
  status: "Chưa chia tiền" | "Đã chia tiền";
}

interface InvoiceItem {
  id: number;
  name: string;
  qty: number;
  price: number;
  cat: string;
}

// Lấy tháng hiện tại để tính chi tiêu
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

// Hàm gom nhóm dữ liệu
const groupDataByMonthGroup = <T extends { monthGroup: string }>(data: T[]) => {
  return data.reduce((groups: Record<string, T[]>, item) => {
    const groupName = item.monthGroup;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item);
    return groups;
  }, {});
};

export default function TransactionsPage() {
  // =======================================================================
  // STATE CƠ BẢN
  // =======================================================================
  const [activeTab, setActiveTab] = useState<"all" | "scanned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [selectedInvoice, setSelectedInvoice] = useState<ScannedInvoice | null>(
    null
  );
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Dữ liệu API
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<ScannedInvoice[]>([]); // Sẵn sàng cho API hóa đơn OCR
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{
    status?: number;
    length?: number;
    raw?: any;
  } | null>(null);

  // Quản lý Modal & Phân trang
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [displayLimitTx, setDisplayLimitTx] = useState(5);
  const [displayLimitInv, setDisplayLimitInv] = useState(4);

  // =======================================================================
  // GỌI API LẤY DỮ LIỆU
  // =======================================================================
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      console.debug("GET /transactions payload:", payload);

      let dataGroups = [];
      if (payload?.data?.data && Array.isArray(payload.data.data)) {
        dataGroups = payload.data.data;
      } else if (payload?.data && Array.isArray(payload.data)) {
        dataGroups = payload.data;
      }

      setDebugInfo({
        status: res.status,
        length: dataGroups.length,
        raw: payload,
      });

      const mapped: Transaction[] = dataGroups.flatMap((dayGroup: any) => {
        const txs = dayGroup.transactions || [];

        return txs.map((t: any) => {
          const amountVal = Number(t.amount ?? t.total_amount ?? 0);
          const created = new Date(
            t.created_at ?? t.transaction_date ?? Date.now()
          );

          const month = created.getMonth() + 1;
          const year = created.getFullYear();
          const monthGroup = `Tháng ${month
            .toString()
            .padStart(2, "0")}/${year}`;

          return {
            id: String(t.transaction_id ?? t.id ?? Math.random()),
            // YÊU CẦU: Lấy category_name thay vì note
            title: t.note || "Giao dịch",
            amount: isFinite(amountVal) ? amountVal : 0,
            type: t.transaction_type === "inflow" ? "income" : "expense",
            date: created.toLocaleDateString("vi-VN"),
            time: created.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            monthGroup: monthGroup,
            icon: t.icon || "category",
            category:
              t.category_name || (t.category_id ? String(t.category_id) : ""),
            isScanned: Boolean(t.is_scanned || t.source === "ocr" || false),
            isSettled: Boolean(t.is_settled || false),
            source: t.source || undefined,
          };
        });
      });

      setTransactions(mapped);
    } catch (err) {
      console.error("Lỗi khi lấy transactions:", err);
      setError("Không thể lấy lịch sử giao dịch.");
      setDebugInfo((d) => ({ ...(d || {}), raw: { error: String(err) } }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Xử lý ẩn hiện Modal khi bật bàn phím
  useEffect(() => {
    const handleResize = () => {
      const isKeyboard = window.visualViewport
        ? window.visualViewport.height < window.innerHeight * 0.8
        : window.innerHeight < 700;
      setIsKeyboardVisible(isKeyboard);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    } else {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      } else {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // =======================================================================
  // LOGIC & BỘ LỌC
  // =======================================================================
  const handleLoadMoreTx = () => setDisplayLimitTx((prev) => prev + 5);
  const handleLoadMoreInv = () => setDisplayLimitInv((prev) => prev + 4);

  useEffect(() => {
    setDisplayLimitTx(5);
    setDisplayLimitInv(4);
  }, [activeTab, searchQuery, priceSort]);

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

  const groupedTransactions = useMemo(() => {
    return groupDataByMonthGroup(filteredTransactions.slice(0, displayLimitTx));
  }, [filteredTransactions, displayLimitTx]);

  const groupedInvoices = useMemo(() => {
    return groupDataByMonthGroup(invoices.slice(0, displayLimitInv));
  }, [invoices, displayLimitInv]);

  const togglePriceSort = () => {
    if (priceSort === "none") setPriceSort("desc");
    else if (priceSort === "desc") setPriceSort("asc");
    else setPriceSort("none");
  };

  // Tính chi tiêu tháng hiện tại
  const currentMonthGroup = getCurrentMonthGroup();
  const currentMonthExpense = useMemo(() => {
    return transactions
      .filter(
        (tx) => tx.type === "expense" && tx.monthGroup === currentMonthGroup
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [currentMonthGroup, transactions]);

  const trend = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthGroup = `Tháng ${(lastMonth.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${lastMonth.getFullYear()}`;

    const lastMonthExpense = transactions
      .filter((tx) => tx.type === "expense" && tx.monthGroup === lastMonthGroup)
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (lastMonthExpense === 0 && currentMonthExpense === 0) return 0;
    if (lastMonthExpense === 0 && currentMonthExpense > 0) return 100;
    const percentage =
      ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
    return Math.round(percentage);
  }, [currentMonthExpense, transactions]);

  const isExpenseUp = trend > 0;

  const getCurrentMonthName = () => {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    return months[new Date().getMonth()];
  };

  // Logic Modal
  const handleOpenInvoice = (inv: ScannedInvoice) => {
    setSelectedInvoice(inv);
    // Có thể truyền dữ liệu thật từ API tại đây
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const calculatedTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [items]);

  const handleSaveInvoice = async () => {
    if (isSaving) return;
    try {
      setIsSaving(true);
      await new Promise((res) => setTimeout(res, 1200));

      // Dùng alert thay cho toast
      alert("Cập nhật hóa đơn thành công");

      setSelectedInvoice(null);
      setItems([]);
    } catch (err) {
      // Dùng alert thay cho toast
      alert("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#f9f9fe] overflow-hidden">
      <div className="px-5 pt-4 shrink-0 bg-[#f9f9fe] z-50">
        <TopBar />
      </div>

      <div className="flex-grow overflow-y-auto px-5 pb-32 scrollbar-hide">
        {loading && (
          <div className="w-full py-3 text-center rounded-xl bg-[#dde1ff] text-[#4b5b9a] font-bold text-sm my-4 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">
              autorenew
            </span>
            Đang tải dữ liệu...
          </div>
        )}
        {error && (
          <div className="w-full py-3 px-4 rounded-xl text-center bg-[#ffdad6]/50 text-[#ba1a1a] text-sm my-4 font-bold border border-[#ffdad6]">
            {error}
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
              onClick={togglePriceSort}
              className={`px-3 rounded-xl flex flex-col items-center justify-center border transition-all focus:outline-none outline-none ${
                priceSort !== "none"
                  ? "bg-[#4b5b9a] text-white border-transparent shadow-md"
                  : "bg-white text-[#767681] border-[#e2e2e7]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {priceSort === "none" ? "filter_list" : "swap_vert"}
              </span>
              {priceSort !== "none" && (
                <span className="text-[7px] font-black uppercase mt-0.5">
                  {priceSort === "desc" ? "Cao" : "Thấp"}
                </span>
              )}
            </button>
          </div>

          <section className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e2e7]/50 relative overflow-hidden">
            <p className="font-label text-[9px] uppercase font-bold tracking-widest text-[#5b5e6a] mb-1">
              Chi tiêu {getCurrentMonthName()}
            </p>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="font-headline text-2xl font-black text-[#4b5b9a]">
                {new Intl.NumberFormat("vi-VN").format(currentMonthExpense)}đ
              </h3>

              <div
                className={`flex items-center gap-1 font-bold text-[10px] px-2 py-1 rounded-lg ${
                  isExpenseUp
                    ? "text-[#ba1a1a] bg-[#ffdad6]/50"
                    : "text-[#059669] bg-[#d1f4e0]/50"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {isExpenseUp ? "trending_up" : "trending_down"}
                </span>
                <span>
                  {isExpenseUp ? "+" : ""}
                  {trend}%
                </span>
              </div>
            </div>
            <p className="text-[9px] text-[#767681] mt-2">So với tháng trước</p>
          </section>
        </div>

        <div className="sticky top-0 bg-[#f9f9fe] py-3 z-40 flex items-center justify-between mb-3 -mx-1 px-1 transition-all">
          <h4 className="font-headline font-bold text-lg text-[#1a1c1f]">
            {searchQuery ? "Kết quả" : "Giao dịch gần đây"}
          </h4>
          <div className="flex bg-[#e2e2e7] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all focus:outline-none outline-none ${
                activeTab === "all"
                  ? "bg-white text-[#4b5b9a] shadow-sm"
                  : "text-[#767681]"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("scanned")}
              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all focus:outline-none outline-none ${
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
              {Object.keys(groupedTransactions).length === 0 && !loading && (
                <div className="bg-white p-6 rounded-2xl text-center text-[#767681] shadow-sm border border-[#e2e2e7]/50">
                  <p className="font-bold text-sm">Không có giao dịch nào.</p>
                  <button
                    onClick={() => fetchTransactions()}
                    className="px-6 py-2.5 mt-4 bg-[#f3f3f8] text-[#4b5b9a] font-bold text-xs rounded-xl active:scale-95 outline-none transition-all"
                  >
                    Tải lại dữ liệu
                  </button>
                </div>
              )}

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
                        className="bg-white p-3.5 rounded-xl flex items-center justify-between border border-[#e2e2e7]/50 shadow-sm active:scale-95 transition-all"
                      >
                        <div className="flex items-center gap-3">
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
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-[#1a1c1f] truncate">
                              {tx.title}
                            </p>
                            <p className="text-[9px] text-[#767681] mt-0.5">
                              {tx.date} • {tx.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className={`font-headline font-bold text-xs ${
                              tx.type === "income"
                                ? "text-[#059669]"
                                : "text-[#1a1c1f]"
                            }`}
                          >
                            {formatCurrency(tx.amount, tx.type)}
                          </p>
                          <p className="text-[8px] text-[#767681] font-bold uppercase mt-0.5">
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
                  onClick={handleLoadMoreTx}
                  className="w-full py-5 text-[#767681] font-bold text-[9px] uppercase tracking-[0.25em] hover:text-[#4b5b9a] transition-colors active:scale-95 focus:outline-none outline-none"
                >
                  Xem thêm giao dịch (
                  {filteredTransactions.length - displayLimitTx})
                </button>
              )}
            </>
          ) : (
            <>
              {Object.keys(groupedInvoices).length === 0 && !loading && (
                <div className="bg-white p-6 rounded-2xl text-center text-[#767681] shadow-sm border border-[#e2e2e7]/50">
                  <p className="font-bold text-sm">
                    Chưa có hóa đơn nào được quét.
                  </p>
                </div>
              )}
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
                        onClick={() => handleOpenInvoice(inv)}
                        className="group bg-white rounded-xl overflow-hidden border border-[#e2e2e7]/50 shadow-sm relative aspect-[3/4] cursor-pointer"
                      >
                        <Image
                          src={inv.imageUrl}
                          alt={inv.merchant}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <div className="absolute top-2 right-2">
                          {inv.status === "Đã chia tiền" ? (
                            <span className="bg-[#10b981] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                              Đã chia
                            </span>
                          ) : (
                            <span className="bg-[#ba1a1a] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                              Chưa chia
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-0 p-2.5 w-full text-white text-xs">
                          <p className="font-bold truncate opacity-90 uppercase text-[10px]">
                            {inv.merchant}
                          </p>
                          <p className="font-black mt-0.5 text-sm">
                            {new Intl.NumberFormat("vi-VN").format(inv.amount)}đ
                          </p>
                          <p className="text-[8px] opacity-80 mt-0.5">
                            {inv.date} • {inv.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {displayLimitInv < invoices.length && (
                <button
                  onClick={handleLoadMoreInv}
                  className="w-full py-4 text-[#767681] font-bold text-[9px] uppercase tracking-[0.25em] hover:text-[#4b5b9a] transition-colors active:scale-95 focus:outline-none outline-none"
                >
                  Xem thêm hóa đơn ({invoices.length - displayLimitInv})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT OCR */}
      {selectedInvoice && !isKeyboardVisible && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
          onClick={() => {
            if (!isSaving) {
              setSelectedInvoice(null);
              setItems([]);
            }
          }}
        >
          <div
            className="w-full h-full max-w-md bg-[#f9f9fe] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden lg:rounded-[2.5rem] lg:h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[40vh] bg-black shrink-0 group">
              <Image
                src={selectedInvoice.imageUrl}
                alt="Invoice Original"
                fill
                className="object-scale-down"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button
                onClick={() => {
                  if (!isSaving) {
                    setSelectedInvoice(null);
                    setItems([]);
                  }
                }}
                className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform focus:outline-none outline-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  Hình ảnh gốc
                </p>
                <h3 className="text-xl font-headline font-black">
                  {selectedInvoice.merchant}
                </h3>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto px-5 py-8 space-y-8 scrollbar-hide rounded-t-[2.5rem] -mt-6 bg-[#f9f9fe] shadow-2xl relative z-10">
              <div className="grid grid-cols-2 gap-4 border-b border-[#e2e2e7] pb-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#4b5b9a] uppercase tracking-[0.15em]">
                    Ngày giao dịch
                  </p>
                  <div className="relative">
                    <input
                      type="date"
                      defaultValue="2026-04-01"
                      className="text-sm font-bold text-[#1a1c1f] bg-[#f3f3f8] border-none rounded-xl py-2 px-3 focus:outline-none appearance-none outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#4b5b9a] uppercase tracking-[0.15em]">
                    Trạng thái
                  </p>
                  <select className="w-full text-xs font-bold text-[#4b5b9a] bg-[#dde1ff] border-none rounded-xl py-2.5 px-3 focus:outline-none appearance-none outline-none">
                    <option>Cá nhân</option>
                    <option>Nhóm</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-black text-[#767681] uppercase tracking-[0.2em]">
                    Chi tiết đơn hàng
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse"></span>
                    <span className="text-[10px] text-[#ba1a1a] font-bold">
                      Chạm để sửa
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-2xl border border-[#e2e2e7] shadow-sm focus:outline-none transition-all"
                    >
                      <div className="flex gap-3 items-start mb-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(item.id, "name", e.target.value)
                          }
                          placeholder="Tên sản phẩm"
                          className="flex-grow font-bold text-[#1a1c1f] text-sm bg-transparent border-none p-0 focus:outline-none outline-none"
                        />
                        <div className="flex items-center gap-1 shrink-0 bg-[#f3f3f8] px-2 py-1 rounded-lg">
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "price",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 text-right font-black text-[#4b5b9a] text-sm bg-transparent border-none p-0 focus:outline-none outline-none"
                          />
                          <span className="text-[10px] font-bold text-[#4b5b9a]">
                            đ
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-[#f3f3f8]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#767681]">
                            Nhóm:
                          </span>
                          <select
                            value={item.cat}
                            onChange={(e) =>
                              updateItem(item.id, "cat", e.target.value)
                            }
                            className="text-[10px] font-black text-[#4b5b9a] bg-[#dde1ff] px-3 py-1 rounded-full border-none focus:outline-none outline-none cursor-pointer"
                          >
                            <option>Ăn uống</option>
                            <option>Học tập</option>
                            <option>Di chuyển</option>
                            <option>Khác</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#767681]">
                            Số lượng:
                          </span>
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "qty",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-10 text-center text-xs font-black bg-[#f3f3f8] rounded-lg border-none py-1 focus:outline-none outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t-2 border-dashed border-[#e2e2e7] flex justify-between items-center">
                <span className="font-headline font-bold text-[#616470]">
                  Tổng thanh toán
                </span>
                <div className="text-right">
                  <p className="font-headline font-black text-3xl text-[#1a1c1f]">
                    {new Intl.NumberFormat("vi-VN").format(calculatedTotal)}đ
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#f9f9fe] border-t border-[#e2e2e7] shrink-0 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setSelectedInvoice(null);
                  setItems([]);
                }}
                disabled={isSaving}
                className="w-full py-3.5 bg-[#e2e2e7] text-[#454650] font-headline font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 focus:outline-none outline-none"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveInvoice}
                disabled={isSaving}
                className={`w-full py-3.5 font-headline font-bold rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 focus:outline-none outline-none ${
                  isSaving
                    ? "bg-[#c6c5d1] text-white shadow-none cursor-not-allowed"
                    : "bg-[#1a1c1f] text-white shadow-black/20 hover:bg-black"
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">
                      autorenew
                    </span>
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
