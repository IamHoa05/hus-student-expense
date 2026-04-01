"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// 1. Định nghĩa Hạng mục mở rộng
const CATEGORIES = [
  { id: "c1", name: "Ăn uống", icon: "restaurant" },
  { id: "c2", name: "Học tập", icon: "school" },
  { id: "c3", name: "Di chuyển", icon: "directions_bus" },
  { id: "c4", name: "Dịch vụ", icon: "settings_suggest" },
  { id: "c5", name: "Mua sắm", icon: "shopping_bag" },
  { id: "c6", name: "Giải trí", icon: "sports_esports" },
  { id: "c7", name: "Cố định", icon: "home_work" },
  { id: "group", name: "Nhóm", icon: "groups" }, // Nút Nhóm nằm ở đây
  { id: "c8", name: "Khác", icon: "more_horiz" },
];

interface ProductItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

export default function AddTransactionPage() {
  const router = useRouter();

  // States cơ bản
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("c1");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState<string>("");
  const [customCategory, setCustomCategory] = useState("");

  // States cho danh sách sản phẩm
  const [products, setProducts] = useState<ProductItem[]>([
    { id: Date.now(), name: "", qty: 1, price: 0 },
  ]);

  // States cho OCR
  const [isScanning, setIsScanning] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  // Tính tổng tiền
  const totalAmount = useMemo(() => {
    return products.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [products]);

  // Logic sản phẩm
  const addProduct = () =>
    setProducts([...products, { id: Date.now(), name: "", qty: 1, price: 0 }]);
  const updateProduct = (id: number, field: keyof ProductItem, value: any) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };
  const removeProduct = (id: number) =>
    setProducts(products.filter((p) => p.id !== id));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      const reader = new FileReader();
      reader.onload = (ev) => setOcrPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setTimeout(() => {
        setIsScanning(false);
        setProducts([
          { id: 1, name: "Sữa tươi Vinamilk", qty: 2, price: 15000 },
          { id: 2, name: "Bánh mì gối", qty: 1, price: 25000 },
        ]);
      }, 2500);
    }
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto pb-40 relative min-h-screen bg-[#f9f9fe]">
      <div className="px-6 pt-6 space-y-6">
        {/* Header - Đã bỏ nút Cá nhân/Nhóm ở đây */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="material-symbols-outlined text-[#1a1c1f]"
          >
            arrow_back
          </button>
          <h1 className="font-headline font-bold text-xl text-[#1a1c1f]">
            {transactionType === "expense" ? "Thêm chi tiêu" : "Thêm thu nhập"}
          </h1>
        </div>

        {/* Toggle Thu/Chi */}
        <section className="flex p-1 bg-[#ededf2] rounded-full w-full shadow-inner">
          <button
            onClick={() => setTransactionType("expense")}
            className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${
              transactionType === "expense"
                ? "bg-white text-[#4b5b9a] shadow-md"
                : "text-[#767681]"
            }`}
          >
            Khoản chi
          </button>
          <button
            onClick={() => setTransactionType("income")}
            className={`flex-1 py-3 text-sm font-bold rounded-full transition-all ${
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
                className={`bg-white p-6 rounded-[2rem] border-2 border-dashed border-[#4b5b9a]/20 flex flex-col items-center justify-center text-center transition-all ${
                  isScanning ? "opacity-50" : "hover:border-[#4b5b9a]"
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-[#dde1ff] flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[#4b5b9a] text-3xl">
                    photo_camera
                  </span>
                </div>
                <h3 className="font-headline font-bold text-sm text-[#1a1c1f]">
                  Quét hóa đơn
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
              </div>
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-[2rem] z-10 backdrop-blur-sm">
                  <div className="w-6 h-6 border-4 border-[#4b5b9a] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </section>

            {/* 2. Chi tiết sản phẩm */}
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-[#e2e2e7]/50 space-y-5">
              <div className="flex justify-between items-center px-1">
                <h2 className="font-headline font-bold text-[#1a1c1f]">
                  Danh sách sản phẩm
                </h2>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#767681] uppercase tracking-tighter">
                    Tổng tiền
                  </p>
                  <p className="font-headline font-black text-xl text-[#4b5b9a]">
                    {new Intl.NumberFormat("vi-VN").format(totalAmount)}đ
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-[#f3f3f8] rounded-2xl space-y-3"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tên sản phẩm..."
                        value={p.name}
                        onChange={(e) =>
                          updateProduct(p.id, "name", e.target.value)
                        }
                        className="flex-grow bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-[#1a1c1f]"
                      />
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="material-symbols-outlined text-[#767681] text-sm"
                      >
                        close
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-[#e2e2e7]">
                        <span className="text-[10px] font-bold text-[#767681]">
                          SL:
                        </span>
                        <input
                          type="number"
                          value={p.qty}
                          onChange={(e) =>
                            updateProduct(p.id, "qty", parseInt(e.target.value))
                          }
                          className="w-8 bg-transparent border-none p-0 text-center text-xs font-black"
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
                              parseInt(e.target.value)
                            )
                          }
                          className="w-20 text-right bg-transparent border-none p-0 text-sm font-black text-[#4b5b9a] focus:ring-0"
                        />
                        <span className="text-[10px] font-bold text-[#4b5b9a]">
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addProduct}
                  className="w-full py-3 border-2 border-dashed border-[#c6c5d1] rounded-2xl text-[10px] font-bold uppercase text-[#767681]"
                >
                  + Thêm món mới
                </button>
              </div>

              {/* Hạng mục (Có nút Nhóm ở đây) */}
              <div className="pt-4 border-t border-[#f3f3f8] space-y-4">
                <p className="text-[10px] font-black uppercase text-[#4b5b9a] tracking-widest">
                  Chọn hạng mục chi tiêu
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                        selectedCategory === cat.id
                          ? cat.id === "group"
                            ? "bg-[#dde1ff] text-[#4b5b9a] border border-[#4b5b9a]/20"
                            : "bg-[#4b5b9a] text-white"
                          : "bg-[#f3f3f8] text-[#454650]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {cat.icon}
                      </span>
                      <span className="text-[10px] font-bold truncate">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Tên hạng mục khác (ví dụ: Thú cưng...)"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f3f8] rounded-xl border-none text-[10px] font-bold focus:ring-1 focus:ring-[#4b5b9a]"
                />
              </div>
            </section>

            {/* Box Chia tiền - Hiện ra khi chọn hạng mục Nhóm */}
            {selectedCategory === "group" && (
              <section className="bg-[#dde1ff] p-5 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#4b5b9a] rounded-full flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-xl">
                      groups
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#4b5b9a] uppercase">
                      Hóa đơn nhóm
                    </p>
                    <p className="text-[11px] font-bold text-[#1a1c1f]">
                      Chia đều cho 3 thành viên
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black text-[#4b5b9a]">
                  {new Intl.NumberFormat("vi-VN").format(totalAmount / 3)}đ/ng
                </p>
              </section>
            )}
          </>
        )}

        {/* --- GIAO DIỆN KHOẢN THU --- */}
        {transactionType === "income" && (
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#e2e2e7]/50 space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-[#10b981] tracking-widest ml-1">
                Số tiền nhận được
              </label>
              <div className="relative flex items-center border-b-2 border-[#10b981]/20 pb-2 transition-all focus-within:border-[#10b981]">
                <span className="text-3xl font-black text-[#10b981] mr-3">
                  ₫
                </span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-transparent border-none p-0 text-5xl font-headline font-black text-[#1a1c1f] focus:ring-0 placeholder:text-[#e2e2e7]"
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
            </div>
            {/* Thu nhập chỉ cần Ngày & Ghi chú */}
          </section>
        )}

        {/* Thông tin chung: Ngày & Ghi chú (Cho cả 2 loại) */}
        <section className="space-y-4">
          <div className="flex items-center bg-white p-4 rounded-2xl gap-3 border border-[#e2e2e7]/50 shadow-sm">
            <span
              className={`material-symbols-outlined ${
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
              className="bg-transparent border-none p-0 text-sm font-bold flex-grow focus:ring-0 text-[#1a1c1f]"
            />
          </div>
          <div className="flex items-center bg-white p-4 rounded-2xl gap-3 border border-[#e2e2e7]/50 shadow-sm">
            <span
              className={`material-symbols-outlined ${
                transactionType === "income"
                  ? "text-[#10b981]"
                  : "text-[#4b5b9a]"
              }`}
            >
              description
            </span>
            <input
              type="text"
              placeholder="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-medium flex-grow focus:ring-0 text-[#1a1c1f] placeholder:text-[#c6c5d1]"
            />
          </div>
        </section>

        {/* Nút Save */}
        <button
          onClick={() => {
            alert(`Đã ghi nhận ${totalAmount}đ vào ví cá nhân!`);
            router.push("/dashboard");
          }}
          disabled={totalAmount <= 0}
          className={`w-full py-5 rounded-[2rem] font-headline font-black text-lg transition-all active:scale-[0.98] shadow-xl ${
            totalAmount <= 0
              ? "bg-[#c6c5d1] text-white"
              : transactionType === "expense"
              ? "bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white shadow-[#4b5b9a]/30"
              : "bg-[#10b981] text-white shadow-[#10b981]/30"
          }`}
        >
          {selectedCategory === "group" && transactionType === "expense"
            ? "Lưu & Chia tiền nhóm"
            : "Xác nhận lưu"}
        </button>
      </div>

      {/* Ảnh nhỏ nổi lên khi dùng OCR */}
      {ocrPreview && (
        <div className="fixed bottom-32 right-6 w-14 h-18 rounded-lg border-2 border-white shadow-xl overflow-hidden z-40 rotate-6">
          <img
            src={ocrPreview}
            alt="Bill Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </main>
  );
}
