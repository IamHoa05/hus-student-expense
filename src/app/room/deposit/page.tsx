"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Hàm hỗ trợ format tiền tệ khi nhập
const formatNumber = (numStr: string) => {
  if (!numStr) return "";
  const num = parseInt(numStr.replace(/\D/g, ""), 10);
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default function DepositFundPage() {
  const router = useRouter();

  // State quản lý số tiền nhập
  const [amount, setAmount] = useState<string>("");

  // Xử lý khi bấm nút chọn tiền nhanh
  const handleQuickSelect = (value: number) => {
    setAmount(value.toString());
  };

  // Xử lý khi nhập tiền vào ô input
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chỉ lấy số, bỏ các ký tự khác
    const rawValue = e.target.value.replace(/\D/g, "");
    setAmount(rawValue);
  };

  // Xử lý xác nhận nạp tiền
  const handleConfirm = () => {
    if (!amount) {
      alert("Vui lòng nhập số tiền cần nạp!");
      return;
    }
    // Giả lập nạp thành công
    alert(`Đã nạp thành công ${formatNumber(amount)}đ vào quỹ phòng!`);
    router.push("/room"); // Quay lại trang quản lý quỹ
  };

  return (
    <main className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen pb-32">
      {/* Top AppBar Tùy chỉnh (Có nút Back) */}
      {/* Top AppBar */}
      <header className="sticky top-0 z-50 bg-[#f9f9fe]/90 backdrop-blur-xl flex justify-between items-center px-6 py-4 w-full max-w-md mx-auto border-b border-[#e2e2e7]/30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e2e2e7] transition-colors -ml-2"
          >
            <span className="material-symbols-outlined text-[#4b5b9a]">
              arrow_back
            </span>
          </button>
          <h1 className="font-headline font-bold text-xl tracking-tight text-[#4b5b9a]">
            Nạp quỹ phòng
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="pt-24 px-6 max-w-md mx-auto space-y-8">
        {/* Room Fund Summary Card */}
        <section className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-6 rounded-2xl text-white shadow-[0_20px_40px_rgba(75,91,154,0.12)] relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm opacity-80 font-medium mb-1">
              Số dư quỹ phòng hiện tại
            </p>
            <h2 className="font-headline font-extrabold text-4xl mb-6 tracking-tight">
              12.450.000đ
            </h2>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 space-y-2 border border-white/20">
              <div className="flex justify-between items-center text-xs">
                <span>Đóng góp của bạn</span>
                <span className="font-bold text-sm">4.200.000đ</span>
              </div>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-1000"
                  style={{ width: "34%" }}
                ></div>
              </div>
            </div>
          </div>
          {/* Decorative abstract shape */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </section>

        {/* Input Section */}
        <section className="space-y-3">
          <label className="block font-headline font-bold text-sm text-[#454650] ml-1">
            Số tiền nạp
          </label>
          <div className="relative">
            <input
              type="text"
              value={formatNumber(amount)}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full bg-[#f3f3f8] border border-[#e2e2e7] rounded-2xl px-6 py-5 text-3xl font-headline font-extrabold focus:ring-2 focus:ring-[#4b5b9a]/40 focus:border-[#4b5b9a] transition-all placeholder:text-[#c6c5d1] text-[#1a1c1f]"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-headline font-bold text-[#4b5b9a] text-xl">
              VND
            </span>
          </div>

          {/* Nút chọn tiền nhanh */}
          <div className="flex gap-2 pt-2">
            {[50000, 100000, 500000].map((val) => (
              <button
                key={val}
                onClick={() => handleQuickSelect(val)}
                className="flex-1 bg-[#e0e2f1] text-[#283775] py-2.5 rounded-xl text-xs font-bold hover:bg-[#94a3e8] hover:text-white transition-colors active:scale-95"
              >
                {new Intl.NumberFormat("vi-VN").format(val)}đ
              </button>
            ))}
          </div>
        </section>

        {/* Momentum Tracker Visual */}
        <section className="p-6 bg-[#f3f3f8] rounded-2xl border border-[#e2e2e7]/60">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-headline font-bold text-sm text-[#1a1c1f]">
                Mục tiêu quý tháng này
              </h3>
              <p className="text-xs text-[#616470] mt-0.5">
                Còn thiếu 2.550.000đ nữa
              </p>
            </div>
            <div className="text-right">
              <span className="font-headline font-extrabold text-[#4b5b9a] text-xl">
                83%
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-[#e2e2e7] h-3.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4b5b9a] via-[#94a3e8] to-[#c5a344] transition-all duration-1000"
              style={{ width: "83%" }}
            ></div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Confirmation Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#f9f9fe] via-[#f9f9fe]/90 to-transparent z-40 flex justify-center">
        <button
          onClick={handleConfirm}
          className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-extrabold text-lg shadow-lg shadow-[#4b5b9a]/30 active:scale-95 transition-transform hover:opacity-95"
        >
          Xác nhận nạp quỹ
        </button>
      </div>
    </main>
  );
}
