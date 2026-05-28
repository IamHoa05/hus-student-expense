"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  id: number;
  name: string;
  qty: number;
  price: number;
}

// Class Tailwind dùng để ẩn mũi tên tăng giảm số ở input type="number"
const hideNumberSpinners =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

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
  const [note, setNote] = useState<string>("");

  // State cho hạng mục tạo mới bằng tay (Chỉ dùng bên Chi tiêu)
  const [customCategory, setCustomCategory] = useState("");

  // States API Hạng mục
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // States cho danh sách sản phẩm
  const [products, setProducts] = useState<ProductItem[]>([
    { id: Date.now(), name: "", qty: 1, price: 0 },
  ]);

  // States & Refs cho OCR
  const [isScanning, setIsScanning] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =======================================================================
  // FETCH CATEGORIES TỪ API
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

        const finalOut = Array.isArray(outData)
          ? outData
              .map(mapIcon)
              .filter((cat) => cat.name.toLowerCase() !== "string")
          : [];
        const finalIn = Array.isArray(inData)
          ? inData
              .map(mapIcon)
              .filter((cat) => cat.name.toLowerCase() !== "string")
          : [];

        setExpenseCategories(finalOut);
        setIncomeCategories(finalIn);
      } catch (error) {
        console.error("Lỗi lấy categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Tự động chọn mục đầu tiên khi chuyển tab hoặc tải xong data (nếu ô custom đang trống)
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
  // LOGIC SẢN PHẨM & OCR
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

  const updateProduct = (id: number, field: keyof ProductItem, value: any) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const removeProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOcrPreview(ev.target?.result as string);
        setHasUploadedImage(true);
      };
      reader.readAsDataURL(file);

      scanTimeoutRef.current = setTimeout(() => {
        setIsScanning(false);
        setIsManualMode(false);
        setProducts([
          { id: 1, name: "Sữa tươi Vinamilk", qty: 2, price: 15000 },
          { id: 2, name: "Bánh mì gối", qty: 1, price: 25000 },
        ]);
        alert("Đã quét hóa đơn thành công!");
      }, 2500);
    }
  };

  const handleRemoveImage = () => {
    if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    setIsScanning(false);
    setOcrPreview(null);
    setHasUploadedImage(false);
    setIsManualMode(true);
    setProducts([
      { id: Date.now(), name: note || "Giao dịch thủ công", qty: 1, price: 0 },
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // =======================================================================
  // LƯU GIAO DỊCH (POST) & TẠO HẠNG MỤC NẾU CẦN
  // =======================================================================
  const handleSave = async () => {
    if (totalAmount <= 0) return alert("Vui lòng nhập số tiền!");

    let finalCategoryId = parseInt(selectedCategory);
    const isIncome = transactionType === "income";

    // NẾU NGƯỜI DÙNG TẠO HẠNG MỤC MỚI BÊN CHI TIÊU -> Gọi API tạo trước
    if (!isIncome && customCategory.trim() !== "") {
      try {
        const catRes = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: customCategory.trim(), // Sửa thành name cho khớp Backend
            transaction_type: "outflow",
            icon: "category", // Icon mặc định cho danh mục tự tạo
          }),
        });

        if (!catRes.ok) {
          const err = await catRes.json();
          return alert(
            `❌ Lỗi tạo hạng mục mới: ${err.detail || JSON.stringify(err)}`
          );
        }

        const newCat = await catRes.json();
        finalCategoryId = newCat.category_id;
      } catch (error) {
        console.error("Lỗi tạo hạng mục:", error);
        return alert("❌ Lỗi kết nối khi tạo hạng mục mới!");
      }
    } else if (!selectedCategory) {
      return alert("Vui lòng chọn hạng mục cho giao dịch này.");
    }

    // TẠO GIAO DỊCH
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`;

    const payload = {
      amount: totalAmount,
      category_id: finalCategoryId,
      note: note || (isIncome ? "Khoản thu mới" : "Khoản chi mới"),
      transaction_date: `${date}T${currentTime}`,
      transaction_type: isIncome ? "inflow" : "outflow",
    };

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Đã lưu ${isIncome ? "khoản thu" : "khoản chi"} thành công!`);
        router.push("/dashboard");
      } else {
        const errorMsg = result.detail || "Có lỗi xảy ra khi lưu.";
        alert(
          `❌ Lỗi từ Server: ${
            typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg)
          }`
        );
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
      alert("❌ Lỗi kết nối đến Server!");
    }
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto pb-32 relative min-h-screen bg-[#f9f9fe]">
      <div className="px-5 pt-4 space-y-5">
        {/* Header */}
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

        {/* Toggle Thu/Chi */}
        <section className="flex p-1 bg-[#ededf2] rounded-full w-full shadow-inner">
          <button
            onClick={() => {
              setTransactionType("expense");
              setCustomCategory(""); // Reset category input
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
              setCustomCategory(""); // Reset category input
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

        {/* --- GIAO DIỆN KHOẢN CHI --- */}
        {transactionType === "expense" && (
          <>
            {/* 1. OCR */}
            <section className="relative">
              <div
                className={`bg-white rounded-2xl border-2 border-dashed border-[#4b5b9a]/20 flex flex-col items-center justify-center text-center transition-all overflow-hidden ${
                  isScanning ? "opacity-50" : "hover:border-[#4b5b9a]"
                } ${hasUploadedImage ? "p-0" : "p-6"}`}
              >
                {hasUploadedImage && ocrPreview ? (
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={ocrPreview}
                      alt="Hóa đơn"
                      fill
                      className="object-cover"
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
                          Đã quét hóa đơn
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[#dde1ff] flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-[#4b5b9a] text-2xl">
                        photo_camera
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-sm text-[#1a1c1f] mb-1">
                      Quét hóa đơn
                    </h3>
                    <p className="text-[9px] text-[#767681]">
                      Chạm để chọn ảnh từ thư viện
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
                      Đang xử lý ảnh...
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* 2. Chi tiết sản phẩm & Nhập tổng tiền */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-[#e2e2e7]/50 space-y-4">
              <div className="flex justify-between items-end px-1 border-b border-[#e2e2e7] pb-3">
                <h2 className="font-headline font-bold text-[#1a1c1f]">
                  {isManualMode ? "Số tiền chi tiêu" : "Danh sách sản phẩm"}
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
                /* GIAO DIỆN NHẬP NHANH SỐ TIỀN TỔNG */
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
                      * Nhập nhanh số tiền bạn đã chi mà không cần hóa đơn
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
                /* GIAO DIỆN DANH SÁCH CHI TIẾT */
                <div className="space-y-2.5">
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
                      className="p-3 bg-[#f3f3f8] rounded-xl space-y-2.5"
                    >
                      <div className="flex gap-2">
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
                          className="material-symbols-outlined text-[#767681] text-base outline-none"
                        >
                          close
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-[#e2e2e7]">
                          <span className="text-[9px] font-bold text-[#767681]">
                            SL:
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
                            className={`w-8 bg-transparent border-none p-0 text-center text-xs font-black focus:outline-none ${hideNumberSpinners}`}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="0"
                            value={p.price || ""}
                            onChange={(e) =>
                              updateProduct(
                                p.id,
                                "price",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-20 text-right bg-transparent border-none p-0 text-xs font-black text-[#4b5b9a] focus:outline-none ${hideNumberSpinners}`}
                          />
                          <span className="text-[9px] font-bold text-[#4b5b9a]">
                            đ
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addProduct}
                    className="w-full py-2.5 border-2 border-dashed border-[#c6c5d1] rounded-xl text-[9px] font-bold uppercase text-[#767681] hover:border-[#4b5b9a] hover:text-[#4b5b9a] transition-colors outline-none"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
              )}

              {/* Hạng mục chi tiêu */}
              <div className="pt-5 border-t border-[#f3f3f8] space-y-4">
                <p className="text-[9px] font-black uppercase text-[#4b5b9a] tracking-widest text-center">
                  Chọn hạng mục chi tiêu
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
                          setCustomCategory(""); // Xóa text custom
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
                {/* Chỉ có tab Chi Tiêu mới được tạo Hạng Mục Khác */}
                <input
                  type="text"
                  placeholder="Tên hạng mục khác..."
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    if (e.target.value.trim() !== "") {
                      setSelectedCategory(""); // Bỏ chọn hạng mục ở trên
                    }
                  }}
                  className="w-full px-4 py-3.5 bg-[#f3f3f8] rounded-xl border-none text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-[#4b5b9a]/40 placeholder:italic placeholder:font-medium"
                />
              </div>
            </section>
          </>
        )}

        {/* --- GIAO DIỆN KHOẢN THU --- */}
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

              {/* Hạng mục Thu nhập (Không có ô tạo mục mới) */}
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

        {/* Thông tin chung: Ngày & Ghi chú */}
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
            <input
              type="text"
              placeholder="Ghi chú thêm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-transparent border-none p-0 text-xs font-medium flex-grow focus:outline-none text-[#1a1c1f] placeholder:text-[#c6c5d1]"
            />
          </div>
        </section>

        {/* Nút Save */}
        <button
          onClick={handleSave}
          disabled={totalAmount <= 0 && isManualMode} // Block nếu không nhập tiền ở Manual Mode
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
