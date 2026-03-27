"use client";

import React, { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { useRouter } from "next/navigation";

// Danh sách các hạng mục chi tiêu mặc định
const EXPENSE_CATEGORIES = [
  { id: "c1", name: "Ăn uống", icon: "restaurant" },
  { id: "c2", name: "Học tập", icon: "school" },
  { id: "c3", name: "Di chuyển", icon: "directions_bus" },
  { id: "c4", name: "Khác", icon: "more_horiz" },
];

export default function AddTransactionPage() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<"expense" | "income">(
    "expense"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("c1");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Mặc định ngày hôm nay

  // Hàm xử lý khi người dùng chọn file ảnh hóa đơn
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`Đã chọn ảnh: ${file.name}. Sẵn sàng gửi cho OCR!`);
      // TODO: Tích hợp API gọi AI OCR ở đây
    }
  };

  const handleSave = () => {
    if (!amount) {
      alert("Vui lòng nhập số tiền!");
      return;
    }
    alert(
      `Đã lưu ${
        transactionType === "expense" ? "khoản chi" : "khoản thu"
      } ${amount}đ thành công!`
    );
    router.push("/dashboard");
  };

  return (
    <main className="flex-grow w-full max-w-md mx-auto pb-40 relative min-h-screen">
      <div className="px-6 space-y-8 mt-4">
        {/* Tiêu đề trang (Giữ nguyên theo thiết kế HTML gốc) */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="material-symbols-outlined text-[#1a1c1f] cursor-pointer hover:opacity-80 active:scale-95 transition-all"
          >
            arrow_back
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-[#1a1c1f]">
            Thêm giao dịch mới
          </h1>
        </div>

        {/* Transaction Type Toggle (Khoản thu / Khoản chi) */}
        <section className="flex p-1 bg-[#ededf2] rounded-full w-full">
          <button
            onClick={() => setTransactionType("expense")}
            className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
              transactionType === "expense"
                ? "bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white shadow-lg"
                : "text-[#454650] hover:bg-[#e2e2e7]"
            }`}
          >
            Khoản chi
          </button>
          <button
            onClick={() => setTransactionType("income")}
            className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all duration-300 ${
              transactionType === "income"
                ? "bg-gradient-to-br from-[#10b981] to-[#34d399] text-white shadow-lg"
                : "text-[#454650] hover:bg-[#e2e2e7]"
            }`}
          >
            Khoản thu
          </button>
        </section>

        {/* Method 1: Tải hóa đơn (Chỉ hiện khi là Khoản chi) - UI Chuẩn HTML gốc */}
        {transactionType === "expense" && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="material-symbols-outlined text-[#4b5b9a]">
                photo_camera
              </span>
              <h2 className="font-headline font-bold text-lg text-[#1a1c1f]">
                Tải hóa đơn
              </h2>
            </div>

            {/* Vùng Upload AI OCR */}
            <div className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-[#4b5b9a]/20 flex flex-col items-center justify-center text-center group hover:border-[#4b5b9a] transition-colors cursor-pointer relative overflow-hidden bg-opacity-50">
              <div className="w-20 h-20 rounded-full bg-[#dde1ff] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                <span className="material-symbols-outlined text-[#4b5b9a] text-4xl">
                  receipt_long
                </span>
              </div>
              <h3 className="font-headline font-bold text-xl mb-1 text-[#1a1c1f]">
                Tải ảnh hóa đơn
              </h3>
              <p className="text-[#454650] text-sm px-6 leading-relaxed">
                Quét hóa đơn tự động bằng AI để nhập liệu nhanh hơn
              </p>

              {/* Thẻ input ẩn để chọn file */}
              <input
                type="file"
                accept="image/*"
                id="bill-upload"
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={handleFileUpload}
              />
            </div>
          </section>
        )}

        {/* Method 2: Nhập thủ công */}
        <section className="bg-white p-8 rounded-[3rem] shadow-[0_24px_48px_-12px_rgba(75,91,154,0.08)] space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`material-symbols-outlined ${
                transactionType === "income"
                  ? "text-[#10b981]"
                  : "text-[#4b5b9a]"
              }`}
            >
              edit_note
            </span>
            <h2 className="font-headline font-bold text-lg text-[#1a1c1f]">
              Nhập thủ công
            </h2>
          </div>

          <div className="space-y-8">
            {/* Amount Field */}
            <div className="relative">
              <label
                className={`block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-3 ml-1 ${
                  transactionType === "income"
                    ? "text-[#10b981]"
                    : "text-[#4b5b9a]"
                }`}
              >
                Số tiền
              </label>
              <div
                className={`relative flex items-center border-b-2 border-[#ededf2] transition-colors pb-2 ${
                  transactionType === "income"
                    ? "focus-within:border-[#10b981]"
                    : "focus-within:border-[#4b5b9a]"
                }`}
              >
                <span
                  className={`font-headline font-extrabold text-3xl mr-3 ${
                    transactionType === "income"
                      ? "text-[#10b981]"
                      : "text-[#4b5b9a]"
                  }`}
                >
                  ₫
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent border-none focus:ring-0 font-headline font-bold text-4xl text-[#1a1c1f] p-0 placeholder:text-[#e2e2e7]"
                />
              </div>
            </div>

            {/* Category Field */}
            {/* <div>
              <label
                className={`block text-[10px] font-extrabold uppercase tracking-[0.2em] mb-4 ml-1 ${
                  transactionType === "income"
                    ? "text-[#10b981]"
                    : "text-[#4b5b9a]"
                }`}
              >
                Hạng mục
              </label>
              <div className="grid grid-cols-4 gap-3">
                {EXPENSE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const activeColor =
                    transactionType === "income"
                      ? "text-[#10b981] bg-[#d1fae5] border-[#10b981]/20"
                      : "text-[#4b5b9a] bg-[#dde1ff] border-[#4b5b9a]/10";

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-transform active:scale-95 ${
                        isSelected
                          ? `${activeColor} shadow-sm border`
                          : "bg-[#f3f3f8] text-[#454650] hover:bg-[#e2e2e7]"
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={
                          isSelected
                            ? { fontVariationSettings: "'FILL' 1" }
                            : {}
                        }
                      >
                        {cat.icon}
                      </span>
                      <span className="text-[10px] font-bold">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div> */}

            {/* Date and Notes Grid */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label
                  className={`block text-[10px] font-extrabold uppercase tracking-[0.2em] ml-1 ${
                    transactionType === "income"
                      ? "text-[#10b981]"
                      : "text-[#4b5b9a]"
                  }`}
                >
                  Ngày tháng
                </label>
                <div className="relative flex items-center bg-[#f3f3f8] rounded-2xl p-4">
                  <span
                    className={`material-symbols-outlined mr-3 ${
                      transactionType === "income"
                        ? "text-[#10b981]"
                        : "text-[#4b5b9a]"
                    }`}
                  >
                    calendar_month
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-[#1a1c1f] font-medium text-sm p-0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label
                  className={`block text-[10px] font-extrabold uppercase tracking-[0.2em] ml-1 ${
                    transactionType === "income"
                      ? "text-[#10b981]"
                      : "text-[#4b5b9a]"
                  }`}
                >
                  Ghi chú
                </label>
                <div className="relative flex items-center bg-[#f3f3f8] rounded-2xl p-4">
                  <span
                    className={`material-symbols-outlined mr-3 ${
                      transactionType === "income"
                        ? "text-[#10b981]"
                        : "text-[#4b5b9a]"
                    }`}
                  >
                    description
                  </span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Ăn trưa cùng bạn..."
                    className="w-full bg-transparent border-none focus:ring-0 text-[#1a1c1f] font-medium text-sm p-0 placeholder:text-[#454650]/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Save Button Action */}
        <section className="px-2 pb-8">
          <button
            onClick={handleSave}
            disabled={!amount}
            className={`w-full py-5 rounded-2xl font-headline font-extrabold text-lg shadow-[0_12px_24px_-8px_rgba(75,91,154,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
              !amount
                ? "bg-[#c6c5d1] text-white cursor-not-allowed shadow-none"
                : transactionType === "expense"
                ? "bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white hover:opacity-90"
                : "bg-gradient-to-br from-[#10b981] to-[#34d399] text-white hover:opacity-90"
            }`}
          >
            <span>Lưu giao dịch</span>
          </button>
        </section>
      </div>
    </main>
  );
}
