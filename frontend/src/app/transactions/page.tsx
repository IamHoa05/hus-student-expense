"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
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
  icon: string;
  category: string;
  isScanned: boolean;
}

interface ScannedInvoice {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  imageUrl: string;
  status: "Chưa chia tiền" | "Đã chia tiền";
}

// Kiểu cho response history từ backend
interface HistoryItem {
  transaction_id: string | number;
  title: string;
  amount: number;
  category?: string;
  time?: string;
  store?: string;
  payment_method?: string;
  location?: string;
}

interface HistoryDay {
  date: string; // YYYY-MM-DD
  daily_total: number;
  items: HistoryItem[];
}

interface RemainingData {
  month: number;
  year: number;
  inflow_total: number;
  outflow_total: number;
  total_remaining: number;
}

// Không còn dùng mock data ở đây — lấy trực tiếp từ API `/budgets/history`.

const formatCurrency = (amount: number, type?: string) => {
  const sign = type === "expense" ? "-" : type === "income" ? "+" : "";
  return `${sign}${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
};

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "scanned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [selectedInvoice, setSelectedInvoice] = useState<ScannedInvoice | null>(
    null
  );
  // Real transactions loaded from backend
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Lưu trữ nhóm lịch sử theo ngày đúng như backend trả về
  const [historyGroups, setHistoryGroups] = useState<HistoryDay[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  // Tổng chi tiêu / thu trong tháng hiện tại (từ API /budgets/remaining)
  const [monthlySummary, setMonthlySummary] = useState<RemainingData | null>(null);
  const [loadingMonthlySummary, setLoadingMonthlySummary] = useState<boolean>(false);
  const [monthlySummaryError, setMonthlySummaryError] = useState<string | null>(null);
  interface ComparisonData {
    current_month: { month: number; year: number; total: number };
    previous_month: { month: number; year: number; total: number };
    growth_rate: number;
    is_increased: boolean;
  }
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      setHistoryError(null);
      try {
        // Tính khoảng thời gian mặc định: 30 ngày gần nhất
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);
        const fmt = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
        const url = `${API_URL}/budgets/history?start_date=${fmt(startDate)}&end_date=${fmt(endDate)}`;

        const res = await fetch(url, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          // Xử lý lỗi 422 (validation) riêng để dễ debug
          if (res.status === 422) {
            const json = await res.json().catch(() => null);
            console.error("budgets/history 422:", json || await res.text());
            setHistoryError("Yêu cầu lấy lịch sử thiếu tham số hoặc không hợp lệ (422)");
            return;
          }

          const text = await res.text();
          console.error("budgets/history returned:", text);
          setHistoryError("Không thể lấy lịch sử từ server");
          return;
        }
        const data = await res.json();

        // Kỳ vọng backend trả về { status: 'success', data: { history: [...] } }
        const historyPayload = data?.data?.history ?? data?.history ?? null;

        let mapped: Transaction[] = [];
        if (Array.isArray(historyPayload)) {
          // Nếu backend trả về nhóm theo ngày, giữ nguyên cấu trúc để render theo nhóm
          setHistoryGroups(historyPayload.map((day: any) => ({
            date: day.date,
            daily_total: Number(day.daily_total ?? day.total ?? 0),
            items: Array.isArray(day.items)
              ? day.items.map((it: any) => ({
                  transaction_id: it.transaction_id ?? it.id,
                  title: it.title || it.note || it.store || it.store_name || "Giao dịch",
                  amount: Number(it.amount ?? it.total ?? 0),
                  category: it.category || it.category_name,
                  time: it.time || it.transaction_time || "",
                  store: it.store_name || it.store,
                  payment_method: it.payment_method,
                  location: it.location,
                }))
              : [],
          })));
          // Và flatten để giữ compatibility với các tính năng search/sort hiện tại
          mapped = historyPayload.flatMap((day: any) => (Array.isArray(day.items) ? day.items : []).map((it: any) => ({
            id: String(it.transaction_id ?? it.id ?? Math.random()),
            title: it.title || it.note || it.store || it.store_name || "Giao dịch",
            amount: Number(it.amount ?? it.total ?? 0),
            type: "expense",
            date: day.date ? (new Date(day.date)).toLocaleDateString("vi-VN") : (it.date || ""),
            time: it.time || "",
            icon: "category",
            category: it.category || it.category_name || "Khác",
            isScanned: Boolean(it.is_scanned || it.scanned || false),
          })));
        } else {
          // Nếu backend trả mảng phẳng (khách), cố map như trước
          if (Array.isArray(data)) {
            mapped = data.map((it: any) => {
              const txDate = it.transaction_date || it.date || it.created_at || null;
              const d = txDate ? new Date(txDate) : null;
              return {
                id: String(it.id ?? it._id ?? Math.random()),
                title: it.title || it.note || it.merchant || "Giao dịch",
                amount: Number(it.amount ?? it.total ?? 0),
                type: (it.type === "inflow" || it.type === "income") ? "income" : "expense",
                date: d ? d.toLocaleDateString("vi-VN") : (it.date || ""),
                time: d ? d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : (it.time || ""),
                icon: it.icon || "category",
                category: it.category_name || it.category || (it.group_name || "Khác"),
                isScanned: Boolean(it.is_scanned || it.scanned || false),
              };
            });
          }
        }

  // Cập nhật transactions flattened để search/sort
  setTransactions(mapped);
      } catch (err) {
        console.error("Lỗi khi gọi budgets/history:", err);
        setHistoryError("Lỗi kết nối");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    const fetchMonthlySummary = async () => {
      setLoadingMonthlySummary(true);
      setMonthlySummaryError(null);
      try {
        const res = await fetch(`${API_URL}/budgets/remaining`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          const txt = await res.text();
          console.error("/budgets/remaining returned:", txt);
          setMonthlySummaryError("Không thể lấy tổng chi tiêu tháng");
          return;
        }
        const payload = await res.json();
        const d = payload?.data ?? null;
        if (d) setMonthlySummary(d as RemainingData);
      } catch (err) {
        console.error("Lỗi khi gọi /budgets/remaining:", err);
        setMonthlySummaryError("Lỗi kết nối");
      } finally {
        setLoadingMonthlySummary(false);
      }
    };

    fetchMonthlySummary();
  }, []);

  useEffect(() => {
    const fetchComparison = async () => {
      setLoadingComparison(true);
      setComparisonError(null);
      try {
        const res = await fetch(`${API_URL}/budgets/comparison`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('/budgets/comparison returned:', res.status, txt);
          setComparisonError('Không thể lấy dữ liệu so sánh');
          return;
        }
        const payload = await res.json();
        const d = payload?.data ?? null;
        if (d && typeof d.growth_rate !== 'undefined') setComparison(d as ComparisonData);
      } catch (err) {
        console.error('Lỗi khi gọi /budgets/comparison:', err);
        setComparisonError('Lỗi kết nối');
      } finally {
        setLoadingComparison(false);
      }
    };

    fetchComparison();
  }, []);

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

  // Lấy nhóm lịch sử đã lọc (theo searchQuery và priceSort) để render theo ngày
  const filteredHistoryGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const groups = historyGroups.map((g) => {
      let items = [...g.items];
      if (q) {
        items = items.filter((it) => (it.title || "").toLowerCase().includes(q) || (it.category || "").toLowerCase().includes(q));
      }
      if (priceSort === "asc") items.sort((a, b) => a.amount - b.amount);
      if (priceSort === "desc") items.sort((a, b) => b.amount - a.amount);
      return { ...g, items };
    });
    // Chỉ giữ nhóm có items
    return groups.filter((g) => g.items && g.items.length > 0);
  }, [historyGroups, searchQuery, priceSort]);

  const togglePriceSort = () => {
    if (priceSort === "none") setPriceSort("desc");
    else if (priceSort === "desc") setPriceSort("asc");
    else setPriceSort("none");
  };

  // Derive scanned invoices from transactions returned by backend
  const scannedInvoices = useMemo<ScannedInvoice[]>(() => {
    return transactions
      .filter((tx) => tx.isScanned)
      .map((tx) => ({
        id: tx.id,
        merchant: tx.title,
        amount: tx.amount,
        date: tx.date,
        // No invoice image available from /budgets/history by default — use a placeholder
        imageUrl: `https://via.placeholder.com/400x600.png?text=${encodeURIComponent(
          tx.title
        )}`,
        status: "Chưa chia tiền",
      }));
  }, [transactions]);

  return (
    /* h-screen và flex-col để quản lý chiều cao toàn màn hình */
    <main className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#f9f9fe] overflow-hidden">
      {/* 1. TOPBAR CỐ ĐỊNH TUYỆT ĐỐI Ở TRÊN CÙNG */}
      <div className="px-6 pt-4 shrink-0 bg-[#f9f9fe] z-50">
        <TopBar />
      </div>

      {/* 2. VÙNG CUỘN CHÍNH (Bao gồm cả Header và List) */}
      <div className="flex-grow overflow-y-auto px-6 pb-32 scrollbar-hide">
        {/* Phần nội dung phía trên (Sẽ bị cuộn mất khi vuốt lên) */}
        <div className="space-y-6 pt-2 pb-6">
          <section>
            <h2 className="font-headline text-4xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">
              Lịch sử giao dịch
            </h2>
            <p className="text-[#616470] font-medium text-sm">
              Quản lý chi tiêu khoa học
            </p>
          </section>

          <button className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white py-4 rounded-2xl font-headline font-bold shadow-lg shadow-[#4b5b9a]/25 active:scale-95 transition-all">
            <span className="material-symbols-outlined">file_download</span>
            Xuất báo cáo PDF / Excel
          </button>

          <div className="flex gap-2">
            <div className="relative flex-grow">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5b9a]">
                search
              </span>
              <input
                className="w-full bg-[#e2e2e7] border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#4b5b9a]/30 transition-all"
                placeholder="Tìm giao dịch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={togglePriceSort}
              className={`px-4 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                priceSort !== "none"
                  ? "bg-[#4b5b9a] text-white border-transparent shadow-md"
                  : "bg-white text-[#767681] border-[#e2e2e7]"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {priceSort === "none" ? "filter_list" : "swap_vert"}
              </span>
              {priceSort !== "none" && (
                <span className="text-[8px] font-black uppercase mt-0.5">
                  {priceSort === "desc" ? "Cao" : "Thấp"}
                </span>
              )}
            </button>
          </div>

          <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#e2e2e7]/50 relative overflow-hidden">
            <p className="font-label text-[10px] uppercase font-bold tracking-widest text-[#5b5e6a] mb-1">
              Tổng chi tiêu tháng này
            </p>
            <div className="flex items-end justify-between relative z-10">
              <h3 className="font-headline text-3xl font-black text-[#4b5b9a]">
                {loadingMonthlySummary ? (
                  <span className="text-sm text-[#767681]">Đang tải...</span>
                ) : monthlySummary ? (
                  <>{new Intl.NumberFormat('vi-VN').format(monthlySummary.outflow_total)}đ</>
                ) : (
                  <span className="text-sm text-[#767681]">—</span>
                )}
              </h3>
              <div className="flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-lg">
                {loadingComparison ? (
                  <span className="text-sm text-[#767681]">Đang tải...</span>
                ) : comparisonError ? (
                  <div className="flex items-center gap-1 text-[#ba1a1a] bg-[#ffdad6]/50 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>+12%</span>
                  </div>
                ) : comparison ? (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${comparison.growth_rate > 0 ? 'text-[#ba1a1a] bg-[#ffdad6]/50' : 'text-[#0b8043] bg-[#d1f7e0]/50'}`}>
                    <span className="material-symbols-outlined text-sm">{comparison.growth_rate > 0 ? 'trending_up' : 'trending_down'}</span>
                    <span>{comparison.growth_rate > 0 ? '+' : ''}{Number(comparison.growth_rate).toFixed(1)}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[#ba1a1a] bg-[#ffdad6]/50 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>+12%</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* 3. THANH TIÊU ĐỀ GIAO DỊCH (STICKY - SẼ DÍNH KHI CUỘN LÊN ĐẾN TOPBAR) */}
        <div className="sticky top-0 bg-[#f9f9fe] py-4 z-40 flex items-center justify-between mb-4 -mx-1 px-1 transition-all">
          <h4 className="font-headline font-bold text-xl text-[#1a1c1f]">
            {searchQuery ? "Kết quả" : "Giao dịch gần đây"}
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

        {/* 4. DANH SÁCH GIAO DỊCH */}
        <div className="space-y-4">
          {activeTab === "all" ? (
            <>
              {loadingHistory && (
                <div className="text-center text-sm text-[#767681] py-6">Đang tải lịch sử...</div>
              )}

              {!loadingHistory && historyError && (
                <div className="text-center text-sm text-red-600 py-4">{historyError}</div>
              )}

              {!loadingHistory && !historyError && (
                // Render theo nhóm ngày trả về từ backend
                <div className="space-y-4">
                  {filteredHistoryGroups.length === 0 && (
                    <div className="text-center text-sm text-[#767681] py-6">Không có giao dịch trong khoảng thời gian này</div>
                  )}

                  {filteredHistoryGroups.map((day) => (
                    <div key={day.date} className="bg-white p-4 rounded-2xl border border-[#e2e2e7]/50 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[12px] text-[#767681] font-bold">{new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}</p>
                          <p className="text-[10px] text-[#94a3e8] font-black">Tổng: {new Intl.NumberFormat('vi-VN').format(day.daily_total)}đ</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {day.items.map((it) => (
                          <div key={String(it.transaction_id)} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#f3f3f8] rounded-full flex items-center justify-center text-[#4b5b9a]">
                                <span className="material-symbols-outlined text-lg">category</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-[#1a1c1f] truncate">{it.title}</p>
                                <p className="text-[10px] text-[#767681] mt-0.5">{it.time || ''}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-headline font-bold text-sm text-[#1a1c1f]">{new Intl.NumberFormat('vi-VN').format(it.amount)}đ</p>
                              <p className="text-[9px] text-[#767681] font-bold uppercase mt-0.5">{it.category || ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full py-6 text-[#767681] font-bold text-[10px] uppercase tracking-[0.25em]">Xem thêm giao dịch</button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {scannedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="group bg-white rounded-2xl overflow-hidden border border-[#e2e2e7]/50 shadow-sm relative aspect-[3/4]"
                  >
                    <Image
                      src={inv.imageUrl}
                      alt={inv.merchant}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 p-3 w-full text-white text-xs">
                      <p className="font-bold truncate opacity-80 uppercase">
                        {inv.merchant}
                      </p>
                      <p className="font-black mt-0.5">
                        {new Intl.NumberFormat("vi-VN").format(inv.amount)}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-6 text-[#767681] font-bold text-[10px] uppercase tracking-[0.25em]">
                Xem thêm hóa đơn
              </button>
            </div>
          )}
        </div>
      </div>
      {/* MODAL CHI TIẾT OCR - CÓ THỂ CHỈNH SỬA */}
      {selectedInvoice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="w-full h-full max-w-md bg-[#f9f9fe] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden lg:rounded-[2.5rem] lg:h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Ảnh hóa đơn (Phóng to, chiếm 40% màn hình) */}
            <div className="relative w-full h-[40vh] bg-black shrink-0 group">
              <Image
                src={selectedInvoice.imageUrl}
                alt="Invoice Original"
                fill
                className="object-scale-down"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
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
            {/* 2. Form chỉnh sửa thông tin */}
            <div className="flex-grow overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide rounded-t-[2.5rem] -mt-6 bg-[#f9f9fe] shadow-2xl relative z-10">
              {/* Header Thông tin chung - Đã sửa hiện Ngày Tháng Năm */}
              <div className="grid grid-cols-2 gap-4 border-b border-[#e2e2e7] pb-6">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#4b5b9a] uppercase tracking-[0.15em]">
                    Ngày giao dịch
                  </p>
                  <div className="relative">
                    <input
                      type="date"
                      defaultValue="2026-04-01" // Định dạng YYYY-MM-DD để input date hiểu, nhưng hiển thị sẽ theo vùng
                      className="text-sm font-bold text-[#1a1c1f] bg-[#f3f3f8] border-none rounded-xl py-2 px-3 focus:ring-2 focus:ring-[#94a3e8] w-full appearance-none"
                    />
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#4b5b9a] text-sm pointer-events-none">
                      calendar_month
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#4b5b9a] uppercase tracking-[0.15em]">
                    Trạng thái
                  </p>
                  <select className="w-full text-xs font-bold text-[#4b5b9a] bg-[#dde1ff] border-none rounded-xl py-2.5 px-3 focus:ring-2 focus:ring-[#94a3e8] appearance-none">
                    <option>Cá nhân</option>
                    <option>Nhóm</option>
                  </select>
                </div>
              </div>

              {/* DANH SÁCH SẢN PHẨM (Giữ nguyên logic Input nhưng tối ưu layout) */}
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
                  {[
                    {
                      id: 1,
                      name: "Caramel Macchiato",
                      qty: 1,
                      price: 65000,
                      cat: "Ăn uống",
                    },
                    {
                      id: 2,
                      name: "Croissant Cheese",
                      qty: 2,
                      price: 80000,
                      cat: "Ăn uống",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-2xl border border-[#e2e2e7] shadow-sm focus-within:border-[#4b5b9a] focus-within:ring-1 focus-within:ring-[#4b5b9a] transition-all"
                    >
                      <div className="flex gap-3 items-start mb-3">
                        <input
                          type="text"
                          defaultValue={item.name}
                          placeholder="Tên sản phẩm"
                          className="flex-grow font-bold text-[#1a1c1f] text-sm bg-transparent border-none p-0 focus:ring-0"
                        />
                        <div className="flex items-center gap-1 shrink-0 bg-[#f3f3f8] px-2 py-1 rounded-lg">
                          <input
                            type="text"
                            defaultValue={new Intl.NumberFormat("vi-VN").format(
                              item.price
                            )}
                            className="w-16 text-right font-black text-[#4b5b9a] text-sm bg-transparent border-none p-0 focus:ring-0"
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
                          <select className="text-[10px] font-black text-[#4b5b9a] bg-[#dde1ff] px-3 py-1 rounded-full border-none focus:ring-0 cursor-pointer">
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
                            defaultValue={item.qty}
                            className="w-10 text-center text-xs font-black bg-[#f3f3f8] rounded-lg border-none py-1 focus:ring-2 focus:ring-[#94a3e8]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TỔNG CỘNG */}
              <div className="pt-6 border-t-2 border-dashed border-[#e2e2e7] flex justify-between items-center">
                <span className="font-headline font-bold text-[#616470]">
                  Tổng thanh toán
                </span>
                <div className="text-right">
                  <p className="font-headline font-black text-3xl text-[#1a1c1f]">
                    {new Intl.NumberFormat("vi-VN").format(
                      selectedInvoice.amount
                    )}
                    đ
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Nút hành động */}
            <div className="p-6 bg-[#f9f9fe] border-t border-[#e2e2e7] shrink-0 grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-full py-4 bg-[#e2e2e7] text-[#454650] font-headline font-bold rounded-2xl active:scale-95 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  alert("Đã cập nhật dữ liệu hóa đơn!");
                  setSelectedInvoice(null);
                }}
                className="w-full py-4 bg-[#1a1c1f] text-white font-headline font-bold rounded-2xl active:scale-95 transition-all shadow-lg shadow-black/20"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
