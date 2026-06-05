"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

export default function ExportPage() {
  const router = useRouter();

  // State chọn thời gian
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // State Dữ liệu API
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewOutflows, setPreviewOutflows] = useState<any[]>([]);
  const [previewInflows, setPreviewInflows] = useState<any[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // =======================================================
  // 1. GỌI ĐỒNG THỜI CÁC API ĐỂ LẤY ĐẦY ĐỦ THÔNG TIN CHU KỲ
  // =======================================================
  useEffect(() => {
    const fetchPreview = async () => {
      setLoadingPreview(true);
      try {
        const [remainRes, statsRes, txRes, catInRes] = await Promise.all([
          // 1. Tổng quan số dư
          fetch(`${API_URL}/budgets/remaining?month=${month}&year=${year}`, {
            credentials: "include",
          }),
          // 2. Chi tiết Chi tiêu (API Statistics mặc định chỉ trả outflow)
          fetch(`${API_URL}/stats/statistics?month=${month}&year=${year}`, {
            credentials: "include",
          }),
          // 3. Lịch sử giao dịch để Frontend tự gom nhóm Khoản thu
          fetch(`${API_URL}/transactions`, { credentials: "include" }),
          // 4. Lấy chuẩn icon/tên của Hạng mục Thu nhập
          fetch(`${API_URL}/categories?type=inflow`, {
            credentials: "include",
          }),
        ]);

        // --- XỬ LÝ TỔNG QUAN ---
        if (remainRes.ok) {
          const json = await remainRes.json();
          setPreviewData(json.data || json);
        } else setPreviewData(null);

        // --- XỬ LÝ CHI TIẾT CHI TIÊU ---
        if (statsRes.ok) {
          const json = await statsRes.json();
          const arr = Array.isArray(json) ? json : json.data || [];
          setPreviewOutflows(
            arr.sort((a: any, b: any) => (b.total || 0) - (a.total || 0))
          );
        } else setPreviewOutflows([]);

        // --- XỬ LÝ CHI TIẾT THU NHẬP (Gom nhóm từ Transactions) ---
        let inflowsMap = new Map();
        if (txRes.ok) {
          const txJson = await txRes.json();
          let allTx = [];
          if (txJson?.data?.data)
            allTx = txJson.data.data.flatMap((g: any) => g.transactions || []);
          else if (txJson?.data)
            allTx = txJson.data.flatMap((g: any) => g.transactions || g);
          else if (Array.isArray(txJson))
            allTx = txJson.flatMap((g: any) => g.transactions || g);

          allTx.forEach((tx: any) => {
            const d = new Date(
              tx.transaction_date || tx.created_at || Date.now()
            );
            // Lọc đúng tháng/năm đang xem và là khoản thu (inflow)
            if (
              d.getMonth() + 1 === month &&
              d.getFullYear() === year &&
              tx.transaction_type === "inflow"
            ) {
              const catId = tx.category_id;
              if (!inflowsMap.has(catId)) {
                inflowsMap.set(catId, {
                  category_id: catId,
                  category_name: tx.category_name || "Khoản thu",
                  icon: tx.icon || "payments",
                  total: 0,
                  transaction_count: 0,
                });
              }
              const cat = inflowsMap.get(catId);
              cat.total += Number(tx.amount || tx.total_amount || 0);
              cat.transaction_count += 1;
            }
          });
        }

        // Map tên/icon từ API Categories cho chuẩn xác nhất
        if (catInRes.ok) {
          const catInJson = await catInRes.json();
          const catInArr = Array.isArray(catInJson)
            ? catInJson
            : catInJson.data || [];
          catInArr.forEach((c: any) => {
            if (inflowsMap.has(c.category_id)) {
              const cat = inflowsMap.get(c.category_id);
              cat.category_name = c.category_name || cat.category_name;
              cat.icon = c.icon || cat.icon;
            }
          });
        }

        // Đẩy vào mảng và sắp xếp số tiền lớn lên đầu
        setPreviewInflows(
          Array.from(inflowsMap.values()).sort(
            (a: any, b: any) => b.total - a.total
          )
        );
      } catch (error) {
        console.error("Lỗi lấy dữ liệu preview:", error);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [month, year]);

  // =======================================================
  // 3. GỌI API XUẤT EXCEL TẢI FILE
  // =======================================================
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(
        `${API_URL}/export/excel?month=${month}&year=${year}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Không thể xuất báo cáo");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_Cao_Chi_Tieu_T${month}_${year}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi xuất file:", error);
      alert("❌ Có lỗi xảy ra khi tải file Excel!");
    } finally {
      setIsExporting(false);
    }
  };

  const inflow = previewData?.inflow_total || 0;
  const outflow = previewData?.outflow_total || 0;
  const remaining = previewData?.total_remaining || 0;

  return (
    <main className="flex-grow w-full max-w-md mx-auto relative min-h-screen bg-[#f9f9fe] pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-[#f9f9fe]/90 backdrop-blur-md border-b border-[#e2e2e7]/30 flex items-center gap-3 px-5 py-4 z-40">
        <button
          onClick={() => router.back()}
          className="p-1.5 -ml-1.5 text-[#4b5b9a] hover:bg-[#e2e2e7] rounded-full transition-colors outline-none"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 className="font-headline font-bold text-lg text-[#1a1c1f]">
          Xuất báo cáo Excel
        </h1>
      </header>

      <div className="px-5 pt-4 space-y-5">
        {/* BỘ LỌC THỜI GIAN */}
        <section className="bg-white p-4 rounded-2xl border border-[#e2e2e7]/50 shadow-sm flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black uppercase text-[#4b5b9a] tracking-widest ml-1">
              Tháng
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full bg-[#f3f3f8] text-[#1a1c1f] font-bold text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4b5b9a]/30 transition-all"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-black uppercase text-[#4b5b9a] tracking-widest ml-1">
              Năm
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full bg-[#f3f3f8] text-[#1a1c1f] font-bold text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#4b5b9a]/30 transition-all text-center"
            />
          </div>
        </section>

        {/* TỔNG QUAN SỐ LIỆU BAN ĐẦU */}
        <section
          className={`space-y-4 transition-opacity duration-300 ${
            loadingPreview ? "opacity-50" : "opacity-100"
          }`}
        >
          <div className="bg-white rounded-2xl border border-[#e2e2e7]/50 shadow-sm p-4 grid grid-cols-2 gap-4">
            <div className="space-y-1 border-r border-[#e2e2e7]">
              <p className="text-[10px] text-[#767681] font-bold uppercase tracking-wider">
                Tổng thu nhập
              </p>
              <p className="font-headline font-black text-[#10b981] text-lg">
                {formatCurrency(inflow)}
              </p>
            </div>
            <div className="space-y-1 pl-2">
              <p className="text-[10px] text-[#767681] font-bold uppercase tracking-wider">
                Tổng chi tiêu
              </p>
              <p className="font-headline font-black text-[#ba1a1a] text-lg">
                {formatCurrency(outflow)}
              </p>
            </div>
            <div className="col-span-2 pt-3 border-t border-[#f3f3f8] flex justify-between items-center">
              <p className="text-xs text-[#454650] font-bold">Số dư còn lại</p>
              <p className="font-headline font-black text-[#4b5b9a] text-xl">
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {/* KHỐI PREVIEW CHI TIẾT */}
          <div className="bg-white rounded-2xl border border-[#e2e2e7]/50 shadow-sm p-5 space-y-6">
            {/* PHẦN 1: KHOẢN THU */}
            <div className="space-y-3">
              <p className="text-[10px] text-[#10b981] font-black uppercase tracking-widest border-b border-[#f3f3f8] pb-1.5">
                ✦ Chi tiết các khoản thu
              </p>
              {previewInflows.length === 0 ? (
                <p className="text-[11px] text-[#767681] italic py-1">
                  Không phát sinh khoản thu nào.
                </p>
              ) : (
                <div className="space-y-3">
                  {previewInflows.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center animate-in fade-in duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#10b981] text-lg bg-[#d1f4e0]/40 p-2 rounded-xl">
                          {item.icon || "payments"}
                        </span>
                        <p className="text-sm font-bold text-[#1a1c1f] truncate max-w-[120px]">
                          {item.category_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#059669]">
                          {formatCurrency(item.total || 0)}
                        </p>
                        <p className="text-[9px] text-[#767681] font-bold uppercase mt-0.5">
                          {item.transaction_count} giao dịch
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PHẦN 2: KHOẢN CHI */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] text-[#4b5b9a] font-black uppercase tracking-widest border-b border-[#f3f3f8] pb-1.5">
                ✦ Chi tiết các khoản chi
              </p>
              {previewOutflows.length === 0 ? (
                <p className="text-[11px] text-[#767681] italic py-1">
                  Không phát sinh khoản chi nào.
                </p>
              ) : (
                <div className="space-y-3">
                  {previewOutflows.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center animate-in fade-in duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#4b5b9a] text-lg bg-[#f3f3f8] p-2 rounded-xl">
                          {item.icon || "category"}
                        </span>
                        <p className="text-sm font-bold text-[#1a1c1f] truncate max-w-[120px]">
                          {item.category_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#1a1c1f]">
                          {formatCurrency(item.total || 0)}
                        </p>
                        <p className="text-[9px] text-[#767681] font-bold uppercase mt-0.5">
                          {item.transaction_count} giao dịch
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-dashed border-[#e2e2e7] text-center bg-[#f9f9fe] p-2 rounded-xl">
              <p className="text-[9px] text-[#4b5b9a] font-bold">
                💡 Bản Excel khi tải về máy sẽ chứa chi tiết ngày giờ, ghi chú,
                v.v.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* NÚT TẢI XUỐNG DÍNH ĐÁY */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-[#e2e2e7]/50 p-5 z-40 pb-safe">
        <button
          onClick={handleExport}
          disabled={isExporting || (inflow === 0 && outflow === 0)}
          className={`w-full py-4 rounded-xl font-headline font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 outline-none ${
            isExporting || (inflow === 0 && outflow === 0)
              ? "bg-[#c6c5d1] text-white cursor-not-allowed shadow-none"
              : "bg-[#059669] text-white active:scale-95 shadow-[#059669]/30 hover:bg-[#047857]"
          }`}
        >
          {isExporting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg">
                autorenew
              </span>
              Đang xuất file Excel...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">
                download
              </span>
              Tải xuống báo cáo (.xlsx)
            </>
          )}
        </button>
      </div>
    </main>
  );
}
