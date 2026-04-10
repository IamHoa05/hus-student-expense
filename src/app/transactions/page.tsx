"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import { toast } from "sonner";

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

// =======================================================================
// 2. BỘ DỮ LIỆU ẢO (MOCK DATA)
// =======================================================================
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    title: "Cơm tấm Sà Bì Chưởng",
    amount: 35000,
    type: "expense",
    date: "16/04/2026",
    time: "12:30",
    monthGroup: "Tháng 04/2026",
    icon: "restaurant",
    category: "Ăn uống",
    isScanned: true,
  },
  {
    id: "t2",
    title: "Grab Bike - Về nhà",
    amount: 22000,
    type: "expense",
    date: "15/04/2026",
    time: "18:15",
    monthGroup: "Tháng 04/2026",
    icon: "directions_car",
    category: "Di chuyển",
    isScanned: false,
  },
  {
    id: "t3",
    title: "Nhà sách Fahasa",
    amount: 158000,
    type: "expense",
    date: "15/10/2025",
    time: "09:00",
    monthGroup: "Tháng 10/2025",
    icon: "school",
    category: "Học tập",
    isScanned: true,
  },
  {
    id: "t4",
    title: "Highlands Coffee",
    amount: 45000,
    type: "expense",
    date: "14/10/2025",
    time: "20:30",
    monthGroup: "Tháng 10/2025",
    icon: "local_cafe",
    category: "Ăn uống",
    isScanned: true,
  },
  {
    id: "t5",
    title: "Nạp tiền điện thoại",
    amount: 100000,
    type: "expense",
    date: "12/10/2025",
    time: "10:00",
    monthGroup: "Tháng 10/2025",
    icon: "phone_iphone",
    category: "Khác",
    isScanned: false,
  },
  {
    id: "t6",
    title: "Vé xem phim CGV",
    amount: 120000,
    type: "expense",
    date: "10/10/2025",
    time: "19:00",
    monthGroup: "Tháng 10/2025",
    icon: "movie",
    category: "Giải trí",
    isScanned: true,
  },
  {
    id: "t7",
    title: "Tiền tiêu vặt bố mẹ cho",
    amount: 2000000,
    type: "income",
    date: "01/10/2025",
    time: "08:00",
    monthGroup: "Tháng 10/2025",
    icon: "payments",
    category: "Thu nhập",
    isScanned: false,
  },
];

const MOCK_INVOICES: ScannedInvoice[] = [
  {
    id: "inv1",
    merchant: "Starbucks Coffee",
    amount: 145000,
    date: "16/04/2026",
    time: "14:20",
    monthGroup: "Tháng 04/2026",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD7ISXMn9TDpaV3Lgs-g4NwJC7yVq34vuCkycUdDs3un1WpjWUQWKj2Szo2aumYWVf2Y2gVnBKTGjqbyTmtK4leRdYpjurGlhr8tQnTXietVLElokVFCcN-NMWArskItY78zC13_qv5vdoO6OUAKIprrk48SLPOJgm3eL9kD3LNocNUCEvZCFvtFmsc68gpB_MqDEtM-KRkz3IufO-RmR2pdZO4R9DvrMUbSp1xmmQVcxo1n3DjOzr9klCqBtet8R9LB8RGWvq-e6o",
    status: "Chưa chia tiền",
  },
  {
    id: "inv2",
    merchant: "Siêu thị WinMart",
    amount: 1230000,
    date: "15/04/2026",
    time: "19:45",
    monthGroup: "Tháng 04/2026",
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
// HÀM GOM NHÓM DỮ LIỆU BẰNG monthGroup
// =======================================================================
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
  const [activeTab, setActiveTab] = useState<"all" | "scanned">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [selectedInvoice, setSelectedInvoice] = useState<ScannedInvoice | null>(
    null
  );
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // =======================================================================
  // LOGIC: STATE QUẢN LÝ DANH SÁCH MÓN HÀNG TRONG MODAL & LƯU TRỮ
  // =======================================================================
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Xử lý bàn phím ảo
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

  const handleOpenInvoice = (inv: ScannedInvoice) => {
    setSelectedInvoice(inv);
    setItems([
      {
        id: 1,
        name: "Caramel Macchiato",
        qty: 1,
        price: 65000,
        cat: "Ăn uống",
      },
      { id: 2, name: "Croissant Cheese", qty: 2, price: 40000, cat: "Ăn uống" },
    ]);
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
      toast.success("Cập nhật hóa đơn thành công");
      setSelectedInvoice(null);
      setItems([]);
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  // =======================================================================
  // LOGIC: XỬ LÝ NÚT "XEM THÊM" (PHÂN TRANG)
  // =======================================================================
  const [displayLimitTx, setDisplayLimitTx] = useState(5);
  const [displayLimitInv, setDisplayLimitInv] = useState(4);

  const handleLoadMoreTx = () => setDisplayLimitTx((prev) => prev + 5);
  const handleLoadMoreInv = () => setDisplayLimitInv((prev) => prev + 4);

  useEffect(() => {
    setDisplayLimitTx(5);
    setDisplayLimitInv(4);
  }, [activeTab, searchQuery, priceSort]);

  // =======================================================================
  // LOGIC: TÍNH CHI TIÊU THÁNG HIỆN TẠI (Giống Dashboard)
  // =======================================================================
  const currentMonthGroup = getCurrentMonthGroup();

  const currentMonthExpense = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(
      (tx) => tx.type === "expense" && tx.monthGroup === currentMonthGroup
    ).reduce((sum, tx) => sum + tx.amount, 0);
  }, [currentMonthGroup]);

  // Tính trend so với tháng trước
  const trend = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthGroup = `Tháng ${(lastMonth.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${lastMonth.getFullYear()}`;

    const lastMonthExpense = MOCK_TRANSACTIONS.filter(
      (tx) => tx.type === "expense" && tx.monthGroup === lastMonthGroup
    ).reduce((sum, tx) => sum + tx.amount, 0);

    if (lastMonthExpense === 0 && currentMonthExpense === 0) return 0;
    if (lastMonthExpense === 0 && currentMonthExpense > 0) return 100;
    const percentage =
      ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
    return Math.round(percentage);
  }, [currentMonthExpense]);

  const isExpenseUp = trend > 0;

  // Lấy tên tháng hiện tại để hiển thị
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
    const currentDate = new Date();
    return months[currentDate.getMonth()];
  };

  // =======================================================================
  // LOGIC: BỘ LỌC VÀ TÌM KIẾM
  // =======================================================================
  const filteredTransactions = useMemo(() => {
    let result = [...MOCK_TRANSACTIONS];
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
  }, [searchQuery, priceSort]);

  const groupedTransactions = useMemo(() => {
    return groupDataByMonthGroup(filteredTransactions.slice(0, displayLimitTx));
  }, [filteredTransactions, displayLimitTx]);

  const groupedInvoices = useMemo(() => {
    return groupDataByMonthGroup(MOCK_INVOICES.slice(0, displayLimitInv));
  }, [displayLimitInv]);

  const togglePriceSort = () => {
    if (priceSort === "none") setPriceSort("desc");
    else if (priceSort === "desc") setPriceSort("asc");
    else setPriceSort("none");
  };

  return (
    // ĐỔI px-6 THÀNH px-5 ĐỂ ĐỒNG BỘ VỚI PROFILE
    <main className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#f9f9fe] overflow-hidden">
      <div className="px-5 pt-4 shrink-0 bg-[#f9f9fe] z-50">
        <TopBar />
      </div>

      <div className="flex-grow overflow-y-auto px-5 pb-32 scrollbar-hide">
        <div className="space-y-5 pt-2 pb-6">
          <section>
            <h2 className="font-headline text-3xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">
              Lịch sử giao dịch
            </h2>
            <p className="text-[#616470] font-medium text-xs">
              Quản lý chi tiêu khoa học
            </p>
          </section>

          {/* Search và Filter - Thu gọn */}
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

          {/* Chi tiêu tháng hiện tại - Giống Dashboard */}
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
              {Object.entries(groupedTransactions).map(
                ([monthGroup, transactions]) => (
                  <div key={monthGroup} className="space-y-2.5">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-[10px] font-black text-[#767681] uppercase tracking-[0.2em] ml-1">
                        {monthGroup}
                      </p>
                      <div className="h-[1px] flex-grow bg-[#e2e2e7]/60"></div>
                    </div>

                    {transactions.map((tx) => (
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
              {Object.entries(groupedInvoices).map(([monthGroup, invoices]) => (
                <div key={monthGroup} className="space-y-2.5">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[10px] font-black text-[#767681] uppercase tracking-[0.2em] ml-1">
                      {monthGroup}
                    </p>
                    <div className="h-[1px] flex-grow bg-[#e2e2e7]/60"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {invoices.map((inv) => (
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

              {displayLimitInv < MOCK_INVOICES.length && (
                <button
                  onClick={handleLoadMoreInv}
                  className="w-full py-4 text-[#767681] font-bold text-[9px] uppercase tracking-[0.25em] hover:text-[#4b5b9a] transition-colors active:scale-95 focus:outline-none outline-none"
                >
                  Xem thêm hóa đơn ({MOCK_INVOICES.length - displayLimitInv})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT OCR - Ẩn/Hiện dựa trên bàn phím ảo */}
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
                      className="text-sm font-bold text-[#1a1c1f] bg-[#f3f3f8] border-none rounded-xl py-2 px-3 focus:outline-none appearance-none focus:outline-none outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#4b5b9a] uppercase tracking-[0.15em]">
                    Trạng thái
                  </p>
                  <select className="w-full text-xs font-bold text-[#4b5b9a] bg-[#dde1ff] border-none rounded-xl py-2.5 px-3 focus:outline-none appearance-none focus:outline-none outline-none">
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
