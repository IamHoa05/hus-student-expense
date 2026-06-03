"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// 1. Định nghĩa Hạng mục Frontend (Khớp với file seeder để map icon chuẩn, không có Nhóm)
const CATEGORIES = [
  // Chi tiêu
  { id: "c1", name: "Ăn uống", icon: "restaurant" },
  { id: "c2", name: "Học tập", icon: "school" },
  { id: "c3", name: "Di chuyển", icon: "directions_bus" },
  { id: "c4", name: "Dịch vụ", icon: "settings_suggest" },
  { id: "c5", name: "Mua sắm", icon: "shopping_bag" },
  { id: "c6", name: "Giải trí", icon: "sports_esports" },
  { id: "c7", name: "Sức khỏe", icon: "favorite" },
  { id: "c8", name: "Cố định", icon: "home_work" },
  { id: "c9", name: "Khác", icon: "more_horiz" },
  // Thu nhập
  { id: "in1", name: "Lương", icon: "payments" },
  { id: "in2", name: "Thưởng", icon: "card_giftcard" },
  { id: "in3", name: "Tiền tiêu vặt", icon: "savings" },
  { id: "in4", name: "Thu nhập khác", icon: "account_balance" },
];

interface ProductItem {
  id: number | string;
  name: string;
  qty: number;
  price: number;
  category_id?: number;
}

const hideNumberSpinners =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

// Hàm hỗ trợ loại bỏ dấu chấm/phẩy trong chuỗi tiền tệ (VD: "54.900" -> 54900)
const parseCurrencyString = (str: string | number) => {
  if (!str) return 0;
  return parseInt(String(str).replace(/\D/g, ""), 10) || 0;
};

export default function AddTransactionPage() {
  const router = useRouter();

  // =======================================================================
  // STATES CƠ BẢN
  // =======================================================================
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense"
  );
  const [isManualMode, setIsManualMode] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState<string>(""); // Sẽ được dùng làm Tên cửa hàng khi quét OCR

  const [customCategory, setCustomCategory] = useState("");

  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [products, setProducts] = useState<ProductItem[]>([
    { id: Date.now(), name: "", qty: 1, price: 0 },
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);
  const [rawOcrData, setRawOcrData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =======================================================================
  // FETCH CATEGORIES
  // =======================================================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [resOut, resIn] = await Promise.all([
          fetch(`${API_URL}/categories?type=outflow`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/categories?type=inflow`, {
            credentials: "include",
          }),
        ]);

        const outData = resOut.ok ? await resOut.json() : [];
        const inData = resIn.ok ? await resIn.json() : [];

        const mapIcon = (backendCat: any) => {
          const backendName = backendCat.name ?? backendCat.category_name ?? "";
          const frontendInfo = CATEGORIES.find(
            (f) => f.name.toLowerCase() === backendName.toLowerCase()
          );
          return {
            ...backendCat,
            name: backendName,
            icon: backendCat.icon || frontendInfo?.icon || "category",
          };
        };

        setExpenseCategories(
          Array.isArray(outData)
            ? outData
                .map(mapIcon)
                .filter((cat) => cat.name.toLowerCase() !== "string")
            : []
        );
        setIncomeCategories(
          Array.isArray(inData)
            ? inData
                .map(mapIcon)
                .filter((cat) => cat.name.toLowerCase() !== "string")
            : []
        );
      } catch (error) {
        console.error("Lỗi lấy categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (customCategory.trim() === "") {
      if (transactionType === "expense" && expenseCategories.length > 0) {
        setSelectedCategory(expenseCategories[0].category_id.toString());
      } else if (transactionType === "income" && incomeCategories.length > 0) {
        setSelectedCategory(incomeCategories[0].category_id.toString());
      }
    }
  }, [transactionType, expenseCategories, incomeCategories, customCategory]);

  // =======================================================================
  // LOGIC SẢN PHẨM & TỔNG TIỀN
  // =======================================================================
  const totalAmount = useMemo(() => {
    return products.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [products]);

  const handleQuickAmountChange = (value: string) => {
    const amount = parseInt(value) || 0;
    setProducts([
      {
        id: Date.now(),
        name: note || "Giao dịch thủ công",
        qty: 1,
        price: amount,
      },
    ]);
  };

  const addProduct = () => {
    setIsManualMode(false);
    setProducts([...products, { id: Date.now(), name: "", qty: 1, price: 0 }]);
  };

  const updateProduct = (
    id: number | string,
    field: keyof ProductItem,
    value: any
  ) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const removeProduct = (id: number | string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // =======================================================================
  // XỬ LÝ ẢNH OCR
  // =======================================================================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setOcrPreview(ev.target?.result as string);
      setHasUploadedImage(true);
    };
    reader.readAsDataURL(file);

    try {
      // BƯỚC 1: TRÍCH XUẤT ẢNH
      const formData = new FormData();
      formData.append("file", file);

      const extractRes = await fetch(`${API_URL}/transactions/ocr/extract`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!extractRes.ok) throw new Error("Lỗi khi trích xuất văn bản OCR");
      const extData = await extractRes.json();

      // BƯỚC 2: PHÂN LOẠI (Có thể gộp chung vào 1 luồng nếu Backend tự động bóc tách)
      const classifyRes = await fetch(`${API_URL}/transactions/ocr/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(extData),
      });

      let finalData = extData;
      if (classifyRes.ok) {
        finalData = await classifyRes.json();
      }

      setRawOcrData(finalData);

      // --- MAPPING DỮ LIỆU LÊN UI ---
      if (finalData.ten_cua_hang) setNote(finalData.ten_cua_hang);

      // Chuyển ngày dạng DD/MM/YYYY sang YYYY-MM-DD
      if (finalData.ngay_mua) {
        const parts = finalData.ngay_mua.split("/");
        if (parts.length === 3) {
          setDate(
            `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
              2,
              "0"
            )}`
          );
        }
      }

      // Xử lý danh sách sản phẩm
      const itemsList =
        finalData.danh_sach_san_pham || finalData.transactions_preview || [];
      if (itemsList.length > 0) {
        const mappedProducts = itemsList.map((item: any, idx: number) => {
          const catStr = item.phan_loai || "";
          // Tìm Category ID tương ứng bằng cách so sánh chuỗi
          const matchedCat = expenseCategories.find(
            (c) => c.name.toLowerCase() === catStr.toLowerCase()
          );

          return {
            id: Date.now() + idx,
            name: item.ten_san_pham || item.note || "Sản phẩm",
            qty: parseCurrencyString(item.so_luong) || 1,
            price: parseCurrencyString(item.don_gia || item.amount || 0),
            category_id: matchedCat?.category_id || undefined,
          };
        });
        setProducts(mappedProducts);
      } else {
        // Fallback nếu không bóc tách được từng món
        const totalNum = parseCurrencyString(finalData.tong_tien_hoa_don);
        setProducts([
          { id: Date.now(), name: "Tổng hóa đơn", qty: 1, price: totalNum },
        ]);
      }

      setIsManualMode(false);
      alert("✅ Quét và phân tích hóa đơn thành công!");
    } catch (err) {
      console.error("Lỗi quy trình OCR:", err);
      alert("❌ Có lỗi xảy ra khi xử lý hóa đơn, vui lòng kiểm tra lại ảnh.");
      handleRemoveImage();
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setIsScanning(false);
    setOcrPreview(null);
    setHasUploadedImage(false);
    setIsManualMode(true);
    setProducts([
      { id: Date.now(), name: note || "Giao dịch thủ công", qty: 1, price: 0 },
    ]);
    setRawOcrData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // =======================================================================
  // BƯỚC 3: XÁC NHẬN LƯU HÓA ĐƠN
  // =======================================================================
  const handleSave = async () => {
    if (totalAmount <= 0) return alert("Vui lòng nhập số tiền!");

    let finalCategoryId = parseInt(selectedCategory);
    const isIncome = transactionType === "income";

    if (!isIncome && customCategory.trim() !== "") {
      try {
        const catRes = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: customCategory.trim(),
            transaction_type: "outflow",
            icon: "category",
          }),
        });

        if (!catRes.ok) throw new Error("Lỗi tạo danh mục");
        const newCat = await catRes.json();
        finalCategoryId = newCat.category_id;
      } catch (error) {
        console.error("Lỗi tạo hạng mục:", error);
        return alert("❌ Lỗi kết nối khi tạo hạng mục mới!");
      }
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`;

    try {
      if (hasUploadedImage && rawOcrData && !isIncome) {
        // Gửi Confirm OCR
        const payloadOCR = {
          image_url: rawOcrData.image_url || "",
          ten_cua_hang: note || rawOcrData.ten_cua_hang || "Cửa hàng",
          ngay_mua: date,
          tong_tien_hoa_don: String(totalAmount),
          payment_method: "Cash",
          location: "Vietnam",
          danh_sach_san_pham: rawOcrData.danh_sach_san_pham || [],
          // Map danh sách mặt hàng người dùng vừa chỉnh sửa trên giao diện
          transactions: products.map((p) => ({
            amount: p.price * p.qty,
            category_id:
              p.category_id ||
              finalCategoryId ||
              expenseCategories[0]?.category_id ||
              1,
            note: p.name || "Sản phẩm OCR",
          })),
        };

        const response = await fetch(`${API_URL}/transactions/ocr/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payloadOCR),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Có lỗi khi xác nhận hóa đơn");
        }

        alert("✅ Đã lưu hóa đơn thành công!");
        router.push("/transactions?tab=scanned&refresh=" + Date.now());
      } else {
        // Lưu giao dịch thủ công
        let finalNote = note;
        if (!isManualMode && products.length > 0) {
          const itemsStr = products
            .map((p) => `${p.name} (x${p.qty})`)
            .join(", ");
          finalNote = note ? `${note} - ${itemsStr}` : itemsStr;
        }

        const payload = {
          amount: totalAmount,
          category_id: finalCategoryId,
          note: finalNote || (isIncome ? "Khoản thu mới" : "Khoản chi mới"),
          transaction_date: `${date}T${currentTime}`,
          transaction_type: isIncome ? "inflow" : "outflow",
        };

        const response = await fetch(`${API_URL}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Lỗi khi lưu giao dịch");

        alert(`✅ Đã lưu ${isIncome ? "khoản thu" : "khoản chi"} thành công!`);
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Lỗi fetch:", error);
      alert(`❌ ${error.message || "Lỗi kết nối đến Server!"}`);
    }
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto pb-32 relative min-h-screen bg-[#f9f9fe]">
      <div className="px-5 pt-4 space-y-5">
        <header className="flex items-center gap-3 py-1">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95 outline-none"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-lg text-[#1a1c1f]">
            {transactionType === "expense" ? "Thêm chi tiêu" : "Thêm thu nhập"}
          </h1>
        </header>

        <section className="flex p-1 bg-[#ededf2] rounded-full w-full shadow-inner">
          <button
            onClick={() => {
              setTransactionType("expense");
              setCustomCategory("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all outline-none ${
              transactionType === "expense"
                ? "bg-white text-[#4b5b9a] shadow-md"
                : "text-[#767681]"
            }`}
          >
            Khoản chi
          </button>
          <button
            onClick={() => {
              setTransactionType("income");
              setCustomCategory("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all outline-none ${
              transactionType === "income"
                ? "bg-white text-[#10b981] shadow-md"
                : "text-[#767681]"
            }`}
          >
            Khoản thu
          </button>
        </section>

        {transactionType === "expense" && (
          <>
            <section className="relative">
              <div
                className={`bg-white rounded-2xl border-2 border-dashed border-[#4b5b9a]/20 flex flex-col items-center justify-center text-center transition-all overflow-hidden ${
                  isScanning ? "opacity-50" : "hover:border-[#4b5b9a]"
                } ${hasUploadedImage ? "p-0" : "p-6"}`}
              >
                {hasUploadedImage && ocrPreview ? (
                  <div className="relative w-full aspect-[4/3]">
                    {/* Dùng img chuẩn thay cho Next Image */}
                    <img
                      src={ocrPreview}
                      alt="Hóa đơn"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors outline-none z-20"
                    >
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                    </button>
                    {!isScanning && (
                      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full z-20">
                        <p className="text-white text-[10px] font-bold">
                          Đã phân tích hóa đơn
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[#dde1ff] flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[#4b5b9a] text-2xl">
                        document_scanner
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-sm text-[#1a1c1f] mb-1">
                      Quét hóa đơn thông minh
                    </h3>
                    <p className="text-[9px] text-[#767681]">
                      Chạm để tải ảnh hóa đơn của bạn lên
                    </p>
                  </>
                )}

                {!hasUploadedImage && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={handleFileUpload}
                  />
                )}
              </div>

              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl z-10 backdrop-blur-sm pointer-events-none">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#4b5b9a] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-[#4b5b9a]">
                      AI đang xử lý ảnh...
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e2e7]/50 space-y-4">
              <div className="flex justify-between items-end px-1 border-b border-[#e2e2e7] pb-3">
                <h2 className="font-headline font-bold text-[#1a1c1f]">
                  {isManualMode ? "Số tiền chi tiêu" : "Chi tiết đơn hàng"}
                </h2>
                {!isManualMode && (
                  <div className="text-right">
                    <p className="text-[9px] font-black text-[#767681] uppercase tracking-tighter">
                      Tổng tiền
                    </p>
                    <p className="font-headline font-black text-lg text-[#4b5b9a]">
                      {new Intl.NumberFormat("vi-VN").format(totalAmount)}đ
                    </p>
                  </div>
                )}
              </div>

              {isManualMode ? (
                <div className="py-2 space-y-4 px-1">
                  <div className="relative flex items-center border-b border-[#e2e2e7] pb-2 focus-within:border-[#4b5b9a] transition-all">
                    <span className="text-3xl font-black text-[#4b5b9a] mr-3 underline decoration-2 underline-offset-4">
                      ₫
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      className={`w-full bg-transparent border-none p-0 text-5xl font-headline font-medium text-[#1a1c1f] focus:outline-none placeholder:text-[#d1d1d6] ${hideNumberSpinners}`}
                      onChange={(e) => handleQuickAmountChange(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between items-start">
                    <p className="text-[11px] text-[#767681] italic font-medium leading-relaxed">
                      * Nhập nhanh số tiền bạn đã chi
                    </p>
                    <button
                      onClick={() => setIsManualMode(false)}
                      className="text-[10px] font-bold text-[#4b5b9a] underline whitespace-nowrap ml-2 outline-none"
                    >
                      Nhập chi tiết
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsManualMode(true)}
                      className="text-[10px] font-bold text-[#767681] underline mb-1 outline-none"
                    >
                      Quay lại nhập tổng tiền
                    </button>
                  </div>
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-[#f9f9fe] rounded-xl space-y-3 shadow-sm border border-[#e2e2e7]"
                    >
                      <div className="flex gap-2 border-b border-[#e2e2e7] pb-2">
                        <input
                          type="text"
                          placeholder="Tên sản phẩm..."
                          value={p.name}
                          onChange={(e) =>
                            updateProduct(p.id, "name", e.target.value)
                          }
                          className="flex-grow bg-transparent border-none p-0 focus:outline-none text-xs font-bold text-[#1a1c1f]"
                        />
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="material-symbols-outlined text-[#767681] text-base outline-none hover:text-[#ba1a1a]"
                        >
                          close
                        </button>
                      </div>

                      {/* Đơn giá x Số lượng = Thành tiền */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex flex-col gap-1 w-[35%]">
                          <span className="text-[9px] font-bold text-[#767681] uppercase tracking-wider">
                            Đơn giá
                          </span>
                          <input
                            type="number"
                            value={p.price || ""}
                            onChange={(e) =>
                              updateProduct(
                                p.id,
                                "price",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-full bg-white border border-[#e2e2e7] px-2 py-1.5 rounded-lg text-xs font-black text-[#1a1c1f] focus:outline-none ${hideNumberSpinners}`}
                          />
                        </div>
                        <span className="text-[#c6c5d1] text-xs font-bold mt-3">
                          x
                        </span>
                        <div className="flex flex-col gap-1 w-[20%] text-center">
                          <span className="text-[9px] font-bold text-[#767681] uppercase tracking-wider">
                            SL
                          </span>
                          <input
                            type="number"
                            value={p.qty}
                            onChange={(e) =>
                              updateProduct(
                                p.id,
                                "qty",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className={`w-full text-center bg-white border border-[#e2e2e7] px-2 py-1.5 rounded-lg text-xs font-black text-[#1a1c1f] focus:outline-none ${hideNumberSpinners}`}
                          />
                        </div>
                        <span className="text-[#c6c5d1] text-xs font-bold mt-3">
                          =
                        </span>
                        <div className="flex flex-col gap-1 w-[35%] text-right">
                          <span className="text-[9px] font-bold text-[#767681] uppercase tracking-wider">
                            Thành tiền
                          </span>
                          <span className="text-sm font-black text-[#4b5b9a] pt-1">
                            {new Intl.NumberFormat("vi-VN").format(
                              p.price * p.qty
                            )}
                            đ
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#e2e2e7]">
                        <span className="text-[9px] font-bold text-[#767681]">
                          Hạng mục phân loại:
                        </span>
                        <select
                          value={p.category_id || ""}
                          onChange={(e) =>
                            updateProduct(
                              p.id,
                              "category_id",
                              parseInt(e.target.value) || undefined
                            )
                          }
                          className="text-[10px] font-black text-[#4b5b9a] bg-[#dde1ff] px-2 py-1 rounded-lg border-none focus:outline-none max-w-[130px] truncate"
                        >
                          <option value="">-- Mặc định --</option>
                          {expenseCategories.map((c) => (
                            <option key={c.category_id} value={c.category_id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addProduct}
                    className="w-full py-3 border-2 border-dashed border-[#c6c5d1] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#767681] hover:border-[#4b5b9a] hover:text-[#4b5b9a] hover:bg-[#dde1ff]/30 transition-colors outline-none mt-2"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
              )}

              <div className="pt-5 border-t border-[#f3f3f8] space-y-4">
                <p className="text-[9px] font-black uppercase text-[#4b5b9a] tracking-widest text-center">
                  Hạng mục tổng quát
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {loadingCategories ? (
                    <p className="text-[10px] col-span-3 text-center py-4 text-[#767681]">
                      Đang tải hạng mục...
                    </p>
                  ) : (
                    expenseCategories.map((cat: any) => (
                      <button
                        key={cat.category_id}
                        onClick={() => {
                          setSelectedCategory(cat.category_id.toString());
                          setCustomCategory("");
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all outline-none ${
                          selectedCategory === cat.category_id.toString()
                            ? "bg-[#4b5b9a] text-white shadow-md shadow-[#4b5b9a]/20 scale-105"
                            : "bg-[#f3f3f8] text-[#454650] hover:bg-[#dde1ff] hover:text-[#4b5b9a]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {cat.icon}
                        </span>
                        <span className="text-[10px] font-bold text-center leading-tight whitespace-normal w-full break-words">
                          {cat.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Tên hạng mục khác..."
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    if (e.target.value.trim() !== "") setSelectedCategory("");
                  }}
                  className="w-full px-4 py-3.5 bg-[#f3f3f8] rounded-xl border-none text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#4b5b9a]/40 placeholder:italic placeholder:font-medium"
                />
              </div>
            </section>
          </>
        )}

        {/* --- GIAO DIỆN KHOẢN THU (Không áp dụng OCR) --- */}
        {transactionType === "income" && (
          <section className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e2e7]/50 space-y-5 animate-in fade-in duration-500">
            <div className="space-y-4 px-1">
              <label className="text-[9px] font-black uppercase text-[#10b981] tracking-widest">
                Số tiền nhận được
              </label>
              <div className="relative flex items-end border-b border-[#e2e2e7] pb-2 transition-all focus-within:border-[#10b981]">
                <span className="text-3xl font-black text-[#10b981] mr-3 underline decoration-2 underline-offset-4">
                  ₫
                </span>
                <input
                  type="number"
                  placeholder="0"
                  className={`w-full bg-transparent border-none p-0 text-5xl font-headline font-medium text-[#1a1c1f] focus:outline-none placeholder:text-[#d1d1d6] ${hideNumberSpinners}`}
                  onChange={(e) =>
                    setProducts([
                      {
                        id: 1,
                        name: "Thu nhập",
                        qty: 1,
                        price: parseInt(e.target.value) || 0,
                      },
                    ])
                  }
                />
              </div>
              <div className="pt-5 space-y-4 border-t border-[#f3f3f8]">
                <p className="text-[9px] font-black uppercase text-[#10b981] tracking-widest text-center">
                  Chọn hạng mục thu nhập
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {loadingCategories ? (
                    <p className="text-[10px] col-span-3 text-center py-4 text-[#767681]">
                      Đang tải hạng mục...
                    </p>
                  ) : (
                    incomeCategories.map((cat: any) => (
                      <button
                        key={cat.category_id}
                        onClick={() =>
                          setSelectedCategory(cat.category_id.toString())
                        }
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all outline-none ${
                          selectedCategory === cat.category_id.toString()
                            ? "bg-[#10b981] text-white shadow-md shadow-[#10b981]/20 scale-105"
                            : "bg-[#f3f3f8] text-[#454650] hover:bg-[#d1f4e0] hover:text-[#10b981]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-2xl">
                          {cat.icon}
                        </span>
                        <span className="text-[10px] font-bold text-center leading-tight whitespace-normal w-full break-words">
                          {cat.name}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center bg-white p-3.5 rounded-xl gap-3 border border-[#e2e2e7]/50 shadow-sm">
            <span
              className={`material-symbols-outlined text-lg ${
                transactionType === "income"
                  ? "text-[#10b981]"
                  : "text-[#4b5b9a]"
              }`}
            >
              calendar_today
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-bold flex-grow focus:outline-none text-[#1a1c1f]"
            />
          </div>
          <div className="flex items-center bg-white p-3.5 rounded-xl gap-3 border border-[#e2e2e7]/50 shadow-sm">
            <span
              className={`material-symbols-outlined text-lg ${
                transactionType === "income"
                  ? "text-[#10b981]"
                  : "text-[#4b5b9a]"
              }`}
            >
              description
            </span>
            {/* Khi dùng OCR, Tên cửa hàng sẽ được gán vào Ghi chú tự động */}
            <input
              type="text"
              placeholder={
                hasUploadedImage ? "Tên cửa hàng..." : "Ghi chú thêm..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-medium flex-grow focus:outline-none text-[#1a1c1f] placeholder:text-[#c6c5d1]"
            />
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={totalAmount <= 0 && isManualMode}
          className={`w-full py-4 rounded-xl font-headline font-black text-base transition-all active:scale-[0.98] shadow-lg outline-none ${
            totalAmount <= 0 && isManualMode
              ? "bg-[#c6c5d1] text-white"
              : transactionType === "expense"
              ? "bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white shadow-[#4b5b9a]/30"
              : "bg-[#10b981] text-white shadow-[#10b981]/30"
          }`}
        >
          Xác nhận lưu
        </button>
      </div>
    </main>
  );
}
