"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Thành phần chứa logic chính
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  // State quản lý thời gian đếm ngược (60 giây)
  const [countdown, setCountdown] = useState(60);

  // Lấy tham số từ URL
  const type = searchParams.get("type");
  const email = searchParams.get("email") || "bạn";

  const isRegister = type === "register";
  const title = isRegister ? "Xác thực tài khoản" : "Khôi phục mật khẩu";
  const description = isRegister
    ? `Mã kích hoạt đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư.`
    : `Mã khôi phục đã được gửi đến email ${email}. Vui lòng nhập mã để tạo mật khẩu mới.`;

  // Hiệu ứng Đếm ngược thời gian (Countdown Effect)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Xử lý khi bấm nút "Xác nhận ngay"
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      alert("Vui lòng nhập đủ mã xác nhận 6 số!");
      return;
    }

    if (isRegister) {
      alert("Đăng ký thành công! Đang chuyển về Trang chủ...");
      router.push("/dashboard");
    } else {
      alert("Xác thực thành công! Mời bạn nhập mật khẩu mới.");
      router.push("/login");
    }
  };

  // Xử lý khi bấm nút "Gửi lại"
  const handleResend = () => {
    if (countdown === 0) {
      alert(`Hệ thống đã gửi lại mã xác nhận mới đến email: ${email}`);
      setCountdown(60); // Reset thời gian đếm ngược về 60 giây
    }
  };

  return (
    <div className="w-full max-w-md z-10">
      {/* Icon & Tiêu đề */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-[#f3f3f8] rounded-xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] opacity-10 rounded-xl"></div>
          <span
            className="material-symbols-outlined text-[#4b5b9a] text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-[#4b5b9a] tracking-tight mb-3">
          {title}
        </h2>
        <p className="text-[#454650] text-sm leading-relaxed max-w-[280px] mx-auto">
          {description}
        </p>
      </div>

      {/* Form nhập mã */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(75,91,154,0.08)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="font-headline font-bold text-sm text-[#4b5b9a] ml-1 block text-center uppercase tracking-widest">
              Nhập mã 6 số
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="••••••"
              className="w-full h-16 bg-[#f3f3f8] rounded-2xl border-none focus:ring-2 focus:ring-[#4b5b9a]/40 focus:bg-white transition-all text-center text-3xl font-black text-[#1a1c1f] tracking-[1em] placeholder:text-[#c6c5d1]"
            />
          </div>

          <div className="space-y-6">
            <button
              type="submit"
              className="w-full h-14 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-bold rounded-full shadow-lg hover:shadow-[#4b5b9a]/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Xác nhận ngay</span>
              <span className="material-symbols-outlined text-xl">
                check_circle
              </span>
            </button>

            {/* Nút Gửi lại có gắn logic Đếm ngược */}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0} // Vô hiệu hóa nút nếu đếm ngược > 0
              className={`w-full text-sm font-bold transition-colors ${
                countdown > 0
                  ? "text-[#c6c5d1] cursor-not-allowed" // Trạng thái đang đếm ngược (Màu nhạt)
                  : "text-[#616470] hover:text-[#4b5b9a]" // Trạng thái bấm được
              }`}
            >
              Chưa nhận được mã?{" "}
              <span
                className={
                  countdown === 0
                    ? "underline decoration-2 underline-offset-4"
                    : ""
                }
              >
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại ngay"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Layout bọc bên ngoài
export default function VerifyPage() {
  const router = useRouter();

  return (
    <div className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen flex flex-col overflow-x-hidden">
      <header className="w-full top-0 sticky z-50 bg-[#f9f9fe]/90 backdrop-blur-md flex items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-[#94a3e8] hover:opacity-80 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#94a3e8] font-headline font-bold text-lg">
            Quay lại
          </h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-4 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#94a3e8]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#e0e2f1]/20 rounded-full blur-3xl pointer-events-none"></div>

        <Suspense
          fallback={
            <div className="font-bold text-[#4b5b9a] animate-pulse">
              Đang tải...
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </main>
    </div>
  );
}
