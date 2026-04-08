"use client";

import React, { useState, useMemo } from "react";
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

// MOCK DATA: Danh sách nhóm (Lấy từ hệ thống Room của bạn)
const MOCK_GROUPS = [
  { id: "g1", name: "Phòng 302 - Cầu Giấy", members: 4 },
  { id: "g2", name: "Hội bạn thân", members: 6 },
  { id: "g3", name: "Nhóm dự án AI", members: 3 },
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

  // States cho tính năng Nhóm
  const [selectedGroupId, setSelectedGroupId] = useState(MOCK_GROUPS[0].id);
  const [isAdvancePayment, setIsAdvancePayment] = useState(true); // Mặc định là có ứng trước

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

  const activeGroup =
    MOCK_GROUPS.find((g) => g.id === selectedGroupId) || MOCK_GROUPS[0];

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

  // Logic Xử lý khi Lưu giao dịch
  const handleSave = () => {
    let message = `Đã ghi nhận giao dịch ${new Intl.NumberFormat(
      "vi-VN"
    ).format(totalAmount)}đ!\n`;

    // Xử lý lưu hạng mục tự tạo
    if (customCategory.trim() !== "") {
      message += `\n✅ Hạng mục mới "${customCategory}" đã được lưu vào CSDL để hiển thị ở Dashboard & Phân tích.`;
    }

    // Xử lý logic chia tiền nhóm
    if (transactionType === "expense" && selectedCategory === "group") {
      if (isAdvancePayment) {
        message += `\n✅ Đã ghi nhận bạn ỨNG TRƯỚC cho nhóm "${activeGroup.name}". (Sẽ chia đều cho ${activeGroup.members} người).`;
      } else {
        message += `\n✅ Đã trừ thẳng vào quỹ chung của nhóm "${activeGroup.name}".`;
      }
    }

    alert(message);
    router.push("/dashboard");
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto pb-40 relative min-h-screen bg-[#f9f9fe]">
      <div className="px-6 pt-6 space-y-6">
        {/* Header */}
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
                        className="flex-grow bg-transparent border-none p-0 focus:outline-none text-sm font-bold text-[#1a1c1f]"
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
                          className="w-20 text-right bg-transparent border-none p-0 text-sm font-black text-[#4b5b9a] focus:outline-none"
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
                  + Thêm
                </button>
              </div>

              {/* Hạng mục */}
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
                  placeholder="Tên hạng mục khác"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f3f3f8] rounded-xl border-none text-[10px] font-bold focus:outline-none focus:ring-[#4b5b9a] placeholder:italic"
                />
              </div>
            </section>

            {/* BOX CHIA TIỀN NHÓM - NÂNG CẤP */}
            {selectedCategory === "group" && (
              <section className="bg-[#dde1ff] p-5 rounded-[2rem] animate-in slide-in-from-top-4 space-y-4 border border-[#4b5b9a]/20">
                {/* Chọn nhóm */}
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-[#f3f3f8] rounded-full flex items-center justify-center text-[#4b5b9a] shrink-0">
                    <span className="material-symbols-outlined text-xl">
                      groups
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[9px] font-black text-[#767681] uppercase tracking-widest mb-0.5">
                      Chọn nhóm
                    </p>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-sm font-bold text-[#1a1c1f] focus:outline-none appearance-none"
                    >
                      {MOCK_GROUPS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.members} người)
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="material-symbols-outlined text-[#c6c5d1] pr-2">
                    expand_more
                  </span>
                </div>

                {/* Toggle Ứng trước */}
                <div className="flex items-center justify-between px-2">
                  <div>
                    <p className="text-xs font-bold text-[#1a1c1f]">
                      Tôi đã ứng trước
                    </p>
                    <p className="text-[9px] font-medium text-[#767681] mt-0.5">
                      Trả tiền túi thay vì dùng quỹ chung
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAdvancePayment(!isAdvancePayment)}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 ${
                      isAdvancePayment ? "bg-[#4b5b9a]" : "bg-[#c6c5d1]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${
                        isAdvancePayment ? "left-6" : "left-1"
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#4b5b9a]/10 px-2">
                  <p className="text-[10px] font-bold text-[#4b5b9a]">
                    Chia cho {activeGroup.members} người:
                  </p>
                  <p className="text-sm font-black text-[#4b5b9a]">
                    {new Intl.NumberFormat("vi-VN").format(
                      totalAmount / activeGroup.members
                    )}
                    đ/ng
                  </p>
                </div>
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
                  className="w-full bg-transparent border-none p-0 text-5xl font-headline font-black text-[#1a1c1f] focus:outline-none placeholder:text-[#e2e2e7]"
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
          </section>
        )}

        {/* Thông tin chung: Ngày & Ghi chú */}
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
              className="bg-transparent border-none p-0 text-sm font-bold flex-grow focus:outline-none text-[#1a1c1f]"
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
              placeholder="Ghi chú thêm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-medium flex-grow focus:outline-none text-[#1a1c1f] placeholder:text-[#c6c5d1]"
            />
          </div>
        </section>

        {/* Nút Save */}
        <button
          onClick={handleSave}
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

      {/* Ảnh OCR Preview */}
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
