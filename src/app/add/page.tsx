"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

// 1. Định nghĩa Hạng mục mở rộng
const CATEGORIES = [
  { id: "c1", name: "Ăn uống", icon: "restaurant" },
  { id: "c2", name: "Học tập", icon: "school" },
  { id: "c3", name: "Di chuyển", icon: "directions_bus" },
  { id: "c4", name: "Dịch vụ", icon: "settings_suggest" },
  { id: "c5", name: "Mua sắm", icon: "shopping_bag" },
  { id: "c6", name: "Giải trí", icon: "sports_esports" },
  { id: "c7", name: "Cố định", icon: "home_work" },
  //{ id: "group", name: "Nhóm", icon: "groups" },
  { id: "c8", name: "Khác", icon: "more_horiz" },
];

// MOCK DATA: Danh sách nhóm
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
  const [isAdvancePayment, setIsAdvancePayment] = useState(true);

  // States cho danh sách sản phẩm
  const [products, setProducts] = useState<ProductItem[]>([
    { id: Date.now(), name: "", qty: 1, price: 0 },
  ]);

  // States cho OCR
  const [isScanning, setIsScanning] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);
  const [hasUploadedImage, setHasUploadedImage] = useState(false);

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
  const resetForm = () => {
    // Reset products về 1 sản phẩm trống
    setProducts([{ id: Date.now(), name: "", qty: 1, price: 0 }]);

    // Reset các state khác
    setSelectedCategory("c1");
    setCustomCategory("");
    setNote("");
    setDate(new Date().toISOString().split("T")[0]);

    // Reset OCR
    setOcrPreview(null);
    setHasUploadedImage(false);

    // Reset nhóm (nếu có)
    setSelectedGroupId(MOCK_GROUPS[0].id);
    setIsAdvancePayment(true);

    // Reset transaction type về expense
    setTransactionType("expense");
  };
  const removeProduct = (id: number) =>
    setProducts(products.filter((p) => p.id !== id));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsScanning(true);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imageUrl = ev.target?.result as string;
        setOcrPreview(imageUrl);
        setHasUploadedImage(true);
      };
      reader.readAsDataURL(file);

      setTimeout(() => {
        setIsScanning(false);
        setProducts([
          { id: 1, name: "Sữa tươi Vinamilk", qty: 2, price: 15000 },
          { id: 2, name: "Bánh mì gối", qty: 1, price: 25000 },
        ]);
        toast.success("Đã quét hóa đơn thành công!");
      }, 2500);
    }
  };

  // Logic Xử lý khi Lưu giao dịch
  const handleSave = () => {
    if (totalAmount <= 0) {
      toast.error("Vui lòng nhập số tiền giao dịch!");
      return;
    }

    let message = `Đã ghi nhận giao dịch ${new Intl.NumberFormat(
      "vi-VN"
    ).format(totalAmount)}đ`;

    if (customCategory.trim() !== "") {
      message += `\nHạng mục mới "${customCategory}" đã được lưu.`;
    }

    if (transactionType === "expense" && selectedCategory === "group") {
      if (isAdvancePayment) {
        message += `\nĐã ứng trước cho nhóm "${activeGroup.name}".`;
      } else {
        message += `\nĐã trừ vào quỹ chung nhóm "${activeGroup.name}".`;
      }
    }

    toast.success(message, {
      duration: 4000,
      description: hasUploadedImage ? "Hóa đơn đã được lưu kèm ảnh" : undefined,
    });

    // Reset form sau khi lưu thành công
    resetForm();

    // Không tự động chuyển trang nữa (để người dùng có thể thêm giao dịch mới)
    // Nếu muốn chuyển trang, bỏ comment dòng dưới
    // setTimeout(() => {
    //   router.push("/dashboard");
    // }, 1500);
  };

  return (
    // Container chính - Đồng bộ padding với Profile
    <main className="flex-grow w-full max-w-md mx-auto pb-32 relative min-h-screen bg-[#f9f9fe]">
      <div className="px-5 pt-4 space-y-5">
        {/* Header - Đồng bộ với Profile */}
        <header className="flex items-center gap-3 py-1">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 text-[#4b5b9a] hover:bg-[#f3f3f8] rounded-full transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-lg text-[#1a1c1f]">
            {transactionType === "expense" ? "Thêm chi tiêu" : "Thêm thu nhập"}
          </h1>
        </header>

        {/* Toggle Thu/Chi - Thu gọn */}
        <section className="flex p-1 bg-[#ededf2] rounded-full w-full shadow-inner">
          <button
            onClick={() => setTransactionType("expense")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
              transactionType === "expense"
                ? "bg-white text-[#4b5b9a] shadow-md"
                : "text-[#767681]"
            }`}
          >
            Khoản chi
          </button>
          <button
            onClick={() => setTransactionType("income")}
            className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
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
            {/* 1. OCR - Hiển thị ảnh trong khung */}
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
                      alt="Hóa đơn đã quét"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => {
                        setOcrPreview(null);
                        setHasUploadedImage(false);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        close
                      </span>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <p className="text-white text-[10px] font-bold">
                        Đã quét hóa đơn
                      </p>
                    </div>
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
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                />
              </div>
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl z-10 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-[#4b5b9a] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-[#4b5b9a]">
                      Đang xử lý ảnh...
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* 2. Chi tiết sản phẩm - Thu gọn */}
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-[#e2e2e7]/50 space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="font-headline font-bold text-sm text-[#1a1c1f]">
                  Danh sách sản phẩm
                </h2>
                <div className="text-right">
                  <p className="text-[9px] font-black text-[#767681] uppercase tracking-tighter">
                    Tổng tiền
                  </p>
                  <p className="font-headline font-black text-lg text-[#4b5b9a]">
                    {new Intl.NumberFormat("vi-VN").format(totalAmount)}đ
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
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
                        className="material-symbols-outlined text-[#767681] text-base"
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
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 text-right bg-transparent border-none p-0 text-xs font-black text-[#4b5b9a] focus:outline-none"
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
                  className="w-full py-2.5 border-2 border-dashed border-[#c6c5d1] rounded-xl text-[9px] font-bold uppercase text-[#767681] hover:border-[#4b5b9a] hover:text-[#4b5b9a] transition-colors"
                >
                  + Thêm sản phẩm
                </button>
              </div>

              {/* Hạng mục - Thu gọn */}
              <div className="pt-4 border-t border-[#f3f3f8] space-y-3">
                <p className="text-[9px] font-black uppercase text-[#4b5b9a] tracking-widest">
                  Chọn hạng mục chi tiêu
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 p-2 rounded-lg transition-all ${
                        selectedCategory === cat.id
                          ? cat.id === "group"
                            ? "bg-[#dde1ff] text-[#4b5b9a] border border-[#4b5b9a]/20"
                            : "bg-[#4b5b9a] text-white"
                          : "bg-[#f3f3f8] text-[#454650]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {cat.icon}
                      </span>
                      <span className="text-[9px] font-bold truncate">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Tên hạng mục khác..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#f3f3f8] rounded-lg border-none text-[9px] font-bold focus:outline-none focus:ring-2 focus:ring-[#4b5b9a]/40 placeholder:italic"
                />
              </div>
            </section>

            {/* BOX CHIA TIỀN NHÓM - Thu gọn */}
            {selectedCategory === "group" && (
              <section className="bg-[#dde1ff] p-4 rounded-2xl animate-in slide-in-from-top-4 space-y-3 border border-[#4b5b9a]/20">
                <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-[#f3f3f8] rounded-full flex items-center justify-center text-[#4b5b9a] shrink-0">
                    <span className="material-symbols-outlined text-lg">
                      groups
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[8px] font-black text-[#767681] uppercase tracking-widest mb-0.5">
                      Chọn nhóm
                    </p>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-xs font-bold text-[#1a1c1f] focus:outline-none appearance-none"
                    >
                      {MOCK_GROUPS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.members} người)
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="material-symbols-outlined text-[#c6c5d1] text-base">
                    expand_more
                  </span>
                </div>

                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[11px] font-bold text-[#1a1c1f]">
                      Tôi đã ứng trước
                    </p>
                    <p className="text-[8px] font-medium text-[#767681] mt-0.5">
                      Trả tiền túi thay vì dùng quỹ chung
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAdvancePayment(!isAdvancePayment)}
                    className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                      isAdvancePayment ? "bg-[#4b5b9a]" : "bg-[#c6c5d1]"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-300 ${
                        isAdvancePayment ? "left-5" : "left-0.5"
                      }`}
                    ></div>
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#4b5b9a]/10 px-1">
                  <p className="text-[9px] font-bold text-[#4b5b9a]">
                    Chia cho {activeGroup.members} người:
                  </p>
                  <p className="text-xs font-black text-[#4b5b9a]">
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

        {/* --- GIAO DIỆN KHOẢN THU - Thu gọn --- */}
        {transactionType === "income" && (
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#e2e2e7]/50 space-y-6 animate-in fade-in duration-500">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-[#10b981] tracking-widest ml-1">
                Số tiền nhận được
              </label>
              <div className="relative flex items-center border-b-2 border-[#10b981]/20 pb-2 transition-all focus-within:border-[#10b981]">
                <span className="text-2xl font-black text-[#10b981] mr-2">
                  ₫
                </span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full bg-transparent border-none p-0 text-4xl font-headline font-black text-[#1a1c1f] focus:outline-none placeholder:text-[#e2e2e7]"
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

        {/* Thông tin chung: Ngày & Ghi chú - Thu gọn */}
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

        {/* Nút Save - Thu gọn */}
        <button
          onClick={handleSave}
          disabled={totalAmount <= 0}
          className={`w-full py-4 rounded-xl font-headline font-black text-base transition-all active:scale-[0.98] shadow-lg ${
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
    </main>
  );
}
