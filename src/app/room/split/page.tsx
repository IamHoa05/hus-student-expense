"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// =======================================================================
// MOCK DATA
// =======================================================================
const TOTAL_BILL_AMOUNT = 1250000;
const BILL_TITLE = "Tiền điện tháng 10";

// Dữ liệu thành viên (không bao gồm "Tôi")
const ROOMMATES = [
  {
    id: "rm_1",
    name: "Minh Anh",
    role: "Bạn thân",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCx5_boSxdfKZSxM6ZoDo9Sd__WRU3NqQIorTnx9aPE4acgeYojKcNvEHLSuXWvj2F5m1qa8Ux0hZ6oQf1KORl_8bPkfvB_P2Nezz1GHxa98mGOLkhWljbwrrO_UbN3WZ7srI-_Bvhi4J7y7o_yIzxKlBRa33jcUn24YRtS1CbIfDMh8JS7MSpmfV1seP2GBnn-CJO_ISHpukBb-zSiATDoqrqwCimHan5u4utAHuAvaWyi_nXPONi1uMT-f0krdLgzn-XuBe3KNFA",
  },
  {
    id: "rm_2",
    name: "Đức Huy",
    role: "Người thuê",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCdGI_htV1DM1EPb5h0vwSP5A40yu15llCa0p9k79niN2CSxrqBJ87BUqMUMTlt89ycppEWgIBwPTumaViyJ02g-fD6tS31tKV5JHsvs-R6tC52R0OHC9nB3P65Ktt2QRvekDdqJ_0i0oHzwvdpdBz0bhF6yW6uOofYKgRgw1fZVBbnONvp7ZkrwHGu-gmbQRdcnghYvuydZh6CGTSgEKvMKBzeg3lFVrJiHu3rHqmNy7hUK77KZaA7T4omg-FvT0Aro123vWA8rYU",
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(amount)
    .replace("₫", "đ");
};

export default function SplitBillPage() {
  const router = useRouter();

  // State quản lý danh sách những người tham gia chia tiền (Mặc định chọn tất cả)
  const [selectedRoommates, setSelectedRoommates] = useState<string[]>(
    ROOMMATES.map((rm) => rm.id)
  );
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal");

  // Xử lý khi tick/untick một người
  const handleToggleRoommate = (id: string) => {
    setSelectedRoommates((prev) =>
      prev.includes(id) ? prev.filter((rmId) => rmId !== id) : [...prev, id]
    );
  };

  // Tính toán số tiền mỗi người phải trả (Bao gồm cả "Tôi" luôn trả tiền)
  const totalPeopleSplitting = selectedRoommates.length + 1; // +1 là bản thân mình
  const amountPerPerson =
    splitMethod === "equal"
      ? Math.floor(TOTAL_BILL_AMOUNT / totalPeopleSplitting)
      : 0;
  const remainder =
    splitMethod === "equal"
      ? TOTAL_BILL_AMOUNT - amountPerPerson * totalPeopleSplitting
      : 0;

  const handleConfirmSplit = () => {
    alert(
      `Đã chia hóa đơn ${BILL_TITLE} thành công cho ${totalPeopleSplitting} người!`
    );
    router.push("/room");
  };

  return (
    <main className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen pb-32">
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
            Chia hóa đơn
          </h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-6 space-y-8">
        {/* Total Amount Card */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] rounded-2xl p-8 shadow-[0_20px_40px_rgba(75,91,154,0.15)] text-white">
          <div className="relative z-10">
            <p className="font-label text-sm opacity-90 mb-1 uppercase tracking-widest">
              Tổng cộng hóa đơn
            </p>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight">
              {formatCurrency(TOTAL_BILL_AMOUNT)}
            </h2>
            <div className="mt-5 flex items-center gap-2 bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">
                receipt_long
              </span>
              <span className="text-xs font-semibold">{BILL_TITLE}</span>
            </div>
          </div>
          {/* Decorative circle */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </section>

        {/* Splitting Options */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
            Phương thức chia
          </h3>
          <div className="flex p-1.5 bg-[#f3f3f8] rounded-xl">
            <button
              onClick={() => setSplitMethod("equal")}
              className={`flex-1 py-3 px-4 rounded-lg font-headline font-bold text-sm transition-all ${
                splitMethod === "equal"
                  ? "bg-white text-[#4b5b9a] shadow-sm"
                  : "text-[#616470] hover:text-[#4b5b9a]"
              }`}
            >
              Chia đều
            </button>
            <button
              onClick={() => setSplitMethod("custom")}
              className={`flex-1 py-3 px-4 rounded-lg font-headline font-bold text-sm transition-all ${
                splitMethod === "custom"
                  ? "bg-white text-[#4b5b9a] shadow-sm"
                  : "text-[#616470] hover:text-[#4b5b9a]"
              }`}
            >
              Tùy chỉnh
            </button>
          </div>
        </section>

        {/* Roommates Selection */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-headline font-bold text-lg text-[#1a1c1f]">
              Cùng phòng
            </h3>
            <span className="text-xs font-medium text-[#616470] bg-[#f3f3f8] px-2 py-1 rounded-md">
              {totalPeopleSplitting} người tham gia
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Person 3 (Self) - Luôn tham gia */}
            <div className="group flex items-center justify-between p-4 bg-[#dde1ff]/30 border border-[#4b5b9a]/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e2e2e7]">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyE0miBH7Zxk0AE7WOf2DjFHaBYxqjj3BQdQW-IyEot14gR9EASh1D08Wxw-EoRQcmyTIKNn2-UkDAxZZkxAhLJ7JM8_7erP6GfQbmFXa_pniut5sVQAbSvyltguholTPrig_TvLeulrrsWlqzp2GOgeS1tMipJgrB5ULeOyB0_L60U3hdoSLMxdDUZVp3yxkGnh5PNxyAU56e2eUiVoz5XK_Zu1MU6ETvxWRlM0ubMBfmZjMv1UPuJP1NfDaLSNFrXf2_SlrJ8ns"
                    alt="You"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="font-headline font-semibold text-[#4b5b9a]">
                    Bạn (Tôi)
                  </p>
                  <p className="text-[11px] text-[#4b5b9a]/70 italic mt-0.5">
                    Người trả trước
                  </p>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-[#4b5b9a]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>

            {/* Roommates (Có thể tick chọn) */}
            {ROOMMATES.map((rm) => (
              <label
                key={rm.id}
                className={`group flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border ${
                  selectedRoommates.includes(rm.id)
                    ? "bg-[#f9f9fe] border-[#4b5b9a]/30 shadow-sm"
                    : "bg-white border-[#e2e2e7]/50 hover:bg-[#f3f3f8]"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e2e2e7]">
                    <Image
                      src={rm.avatar}
                      alt={rm.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p
                      className={`font-headline font-semibold ${
                        selectedRoommates.includes(rm.id)
                          ? "text-[#1a1c1f]"
                          : "text-[#454650]"
                      }`}
                    >
                      {rm.name}
                    </p>
                    <p className="text-[11px] text-[#767681] italic mt-0.5">
                      {rm.role}
                    </p>
                  </div>
                </div>
                {/* Custom Checkbox UI */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedRoommates.includes(rm.id)
                      ? "border-[#4b5b9a] bg-[#4b5b9a]"
                      : "border-[#c6c5d1]"
                  }`}
                >
                  {selectedRoommates.includes(rm.id) && (
                    <span className="material-symbols-outlined text-white text-[16px] font-bold">
                      check
                    </span>
                  )}
                </div>
                {/* Input ẩn để xử lý logic React */}
                <input
                  type="checkbox"
                  checked={selectedRoommates.includes(rm.id)}
                  onChange={() => handleToggleRoommate(rm.id)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Preview Section */}
        {splitMethod === "equal" && (
          <section className="bg-[#f3f3f8] rounded-2xl p-6 space-y-4 border border-[#e2e2e7]/50">
            <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#616470]">
              Xem trước
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#454650] font-medium text-sm">
                  Mỗi người trả
                </span>
                <span className="font-headline font-extrabold text-2xl text-[#4b5b9a]">
                  {formatCurrency(amountPerPerson)}
                </span>
              </div>
              <div className="h-px bg-[#c6c5d1]/30"></div>
              <div className="flex justify-between items-center text-xs text-[#767681]">
                <span>Số dư dư:</span>
                <span>{remainder}đ (Được làm tròn)</span>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* CTA Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 max-w-md mx-auto bg-gradient-to-t from-[#f9f9fe] via-[#f9f9fe]/90 to-transparent z-40">
        <button
          onClick={handleConfirmSplit}
          className="w-full py-4 bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-bold text-lg rounded-2xl shadow-lg shadow-[#4b5b9a]/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Xác nhận chia tiền</span>
          <span className="material-symbols-outlined text-xl">call_split</span>
        </button>
      </div>
    </main>
  );
}
