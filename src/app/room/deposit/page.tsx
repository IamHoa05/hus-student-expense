"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const MY_PERSONAL_WALLET = {
  balance: 15000000,
};

const MOCK_GROUPS = [
  {
    id: "g1",
    name: "Phòng 302 - Cầu Giấy",
    balance: 4250000,
    yourContribution: 1200000,
  },
  { id: "g2", name: "Hội bạn thân", balance: 120000, yourContribution: 30000 },
];

const formatNumber = (numStr: string) => {
  if (!numStr) return "";
  const num = parseInt(numStr.replace(/\D/g, ""), 10);
  return new Intl.NumberFormat("vi-VN").format(num);
};

export default function DepositFundPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const groupId = searchParams.get("id") || "g1";

  const groupData = useMemo(
    () => MOCK_GROUPS.find((g) => g.id === groupId) || MOCK_GROUPS[0],
    [groupId]
  );

  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleQuickSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleConfirm = async () => {
    if (loading) return;

    const depositAmount = parseInt(amount.replace(/\D/g, ""), 10);

    if (!depositAmount || depositAmount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ!");
      return;
    }

    if (depositAmount > MY_PERSONAL_WALLET.balance) {
      toast.error("Số dư không đủ!");
      return;
    }

    try {
      setLoading(true);

      // 👉 Giả lập call API
      await new Promise((res) => setTimeout(res, 1200));

      toast.success(
        `Nạp ${formatNumber(amount)}đ vào "${groupData.name}" thành công 🎉`
      );

      setTimeout(() => {
        router.push("/room");
      }, 1200);
    } catch (err) {
      toast.error("Giao dịch thất bại, thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#f9f9fe] min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#f9f9fe]/90 backdrop-blur-xl flex items-center px-6 py-4 w-full max-w-md mx-auto border-b border-[#e2e2e7]/30">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-[#d1f4e0] text-[#059669]"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline font-bold text-xl text-[#059669] ml-2">
          Xác nhận nạp quỹ
        </h1>
      </header>

      <div className="pt-8 px-6 max-w-md mx-auto space-y-8">
        {/* Wallet */}
        <div className="bg-white p-4 rounded-2xl border border-[#e2e2e7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f3f3f8] rounded-full flex items-center justify-center text-[#4b5b9a]">
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#767681] uppercase">
                Ví cá nhân
              </p>
              <p className="text-sm font-bold text-[#1a1c1f]">
                {formatNumber(MY_PERSONAL_WALLET.balance.toString())}đ
              </p>
            </div>
          </div>

          <span className="material-symbols-outlined text-[#c6c5d1]">
            arrow_forward
          </span>

          <div className="text-right">
            <p className="text-[10px] font-black text-[#059669] uppercase">
              Nạp vào quỹ
            </p>
            <p className="text-sm font-bold text-[#059669]">{groupData.name}</p>
          </div>
        </div>

        {/* Input */}
        <section className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase text-[#059669] ml-1 mb-2">
              Số tiền muốn nạp
            </p>

            <input
              type="text"
              value={formatNumber(amount)}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full bg-white border border-[#e2e2e7] rounded-2xl px-8 py-6 text-4xl font-headline font-black focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            {[100000, 200000, 500000].map((val) => (
              <button
                key={val}
                onClick={() => handleQuickSelect(val)}
                className="flex-1 bg-white border border-[#e2e2e7] text-[#059669] py-3 rounded-xl text-[10px] font-black uppercase"
              >
                +{val / 1000}k
              </button>
            ))}
          </div>
        </section>

        {/* Note */}
        <section className="space-y-3">
          <label className="block font-black text-[10px] uppercase text-[#767681] ml-1">
            Lời nhắn
          </label>

          <div className="flex items-center bg-white border border-[#e2e2e7] rounded-2xl p-4 gap-3">
            <span className="material-symbols-outlined text-[#059669]">
              chat
            </span>

            <input
              type="text"
              placeholder="Ví dụ: Tiền quỹ tháng 4..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
            />
          </div>
        </section>
      </div>

      {/* Button */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#f9f9fe] to-transparent flex justify-center">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={`w-full max-w-md py-5 rounded-full text-white font-bold text-lg transition-all ${
            loading
              ? "bg-gray-400"
              : "bg-gradient-to-r from-[#059669] to-[#34d399] active:scale-[0.98]"
          }`}
        >
          {loading ? "Đang xử lý..." : "Xác nhận"}
        </button>
      </div>
    </main>
  );
}
