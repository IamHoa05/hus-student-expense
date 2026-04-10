"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// =========================================
// THÀNH PHẦN LOGIC & NỘI DUNG CHÍNH
// =========================================
function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  // State quản lý thời gian đếm ngược (60 giây)
  const [countdown, setCountdown] = useState(60);

  // =========================================
  // STATE: Quản lý thông báo Popup
  // =========================================
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "warning";
    message: string;
  }>({
    show: false,
    type: "success",
    message: "",
  });

  const showNotification = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "success", message: "" });
    }, 3000); // Ẩn sau 3s
  };

  // Lấy tham số từ URL
  const type = searchParams.get("type");
  const email = searchParams.get("email") || "bạn";

  const isRegister = type === "register";
  const title = isRegister ? "Xác thực tài khoản" : "Khôi phục mật khẩu";
  const description = isRegister
    ? `Mã kích hoạt đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư.`
    : `Mã khôi phục đã được gửi đến email ${email}. Vui lòng nhập mã để tạo mật khẩu mới.`;

  // Hiệu ứng Đếm ngược thời gian
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
      showNotification("error", "Vui lòng nhập đủ mã xác nhận 6 số!");
      return;
    }

    if (isRegister) {
      // Thông báo thành công XANH LÁ
      showNotification(
        "success",
        "Đăng ký thành công! Đang chuyển về Trang chủ..."
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000); // Đợi 2s để đọc thông báo
    } else {
      // Thông báo thành công XANH LÁ
      showNotification(
        "success",
        "Xác thực thành công! Mời bạn nhập mật khẩu mới."
      );
      setTimeout(() => {
        router.push("/login"); // Hoặc đẩy sang trang ResetPassword thực tế của bạn
      }, 2000);
    }
  };

  // Xử lý khi bấm nút "Gửi lại"
  const handleResend = () => {
    if (countdown === 0) {
      showNotification("success", `Đã gửi lại mã mới đến email: ${email}`);
      setCountdown(60); // Reset thời gian đếm ngược
    }
  };

  return (
    <>
      {/* =========================================
          THÔNG BÁO - Nổi giữa màn hình
          ========================================= */}
      {notification.show && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-[280px] pointer-events-none px-4">
          <div
            className={`animate-in fade-in zoom-in-95 duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white rounded-3xl p-5 flex flex-col items-center justify-center text-center border ${
              notification.type === "success"
                ? "border-[#059669]/20" // Xanh lá
                : notification.type === "error"
                ? "border-[#ba1a1a]/20" // Đỏ
                : "border-[#856404]/20"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                notification.type === "success"
                  ? "bg-[#d1fae5] text-[#059669]" // Nền/Icon Xanh lá
                  : notification.type === "error"
                  ? "bg-[#ffdad6] text-[#ba1a1a]"
                  : "bg-[#fff3cd] text-[#856404]"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {notification.type === "success"
                  ? "check_circle"
                  : notification.type === "error"
                  ? "error"
                  : "warning"}
              </span>
            </div>
            <span
              className={`font-headline font-bold text-sm leading-relaxed px-2 ${
                notification.type === "success"
                  ? "text-[#059669]" // Chữ Xanh lá
                  : notification.type === "error"
                  ? "text-[#ba1a1a]"
                  : "text-[#856404]"
              }`}
            >
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* =========================================
          NỘI DUNG FORM
          ========================================= */}
      {/* Thêm my-auto py-8 để khi bàn phím đẩy lên thì nó tự căn chỉnh linh hoạt */}
      <div className="w-full max-w-md z-10 my-auto py-8">
        {/* Icon & Tiêu đề */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 bg-[#f3f3f8] rounded-2xl relative shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] opacity-10 rounded-2xl"></div>
            <span
              className="material-symbols-outlined text-[#4b5b9a] text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mark_email_read
            </span>
          </div>
          <h2 className="font-headline text-3xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-[#616470] text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
            {description}
          </p>
        </div>

        {/* Form nhập mã */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#e2e2e7]/60">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="font-headline font-bold text-xs text-[#616470] ml-1 block text-center uppercase tracking-widest">
                Nhập mã 6 số
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="••••••"
                /* inputMode="numeric" giúp bật bàn phím số (Numpad) trên mobile thay vì bàn phím chữ, 
                   chống chiếm màn hình cực tốt */
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full h-16 bg-[#f3f3f8] rounded-2xl border-none focus:ring-2 focus:ring-[#94a3e8] transition-all text-center text-3xl font-black text-[#1a1c1f] tracking-[0.5em] placeholder:text-[#c6c5d1] outline-none"
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-bold text-lg rounded-2xl shadow-lg shadow-[#4b5b9a]/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Xác nhận ngay</span>
                <span className="material-symbols-outlined text-xl">
                  arrow_forward
                </span>
              </button>

              {/* Nút Gửi lại */}
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0}
                className={`w-full text-xs font-bold transition-colors py-2 ${
                  countdown > 0
                    ? "text-[#c6c5d1] cursor-not-allowed"
                    : "text-[#616470] hover:text-[#4b5b9a]"
                }`}
              >
                Chưa nhận được mã?{" "}
                <span
                  className={
                    countdown === 0
                      ? "underline decoration-2 underline-offset-4 text-[#4b5b9a]"
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
    </>
  );
}

// =========================================
// LAYOUT BỌC BÊN NGOÀI
// =========================================
export default function VerifyPage() {
  const router = useRouter();

  return (
    // SỬA: Thay min-h-screen bằng min-h-[100dvh] để trị lỗi bàn phím
    <div className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-[100dvh] flex flex-col overflow-x-hidden relative">
      {/* Background Ornaments */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-[#94a3e8]/15 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-[#e0e2f1]/30 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl pointer-events-none -z-10"></div>

      <header className="w-full top-0 sticky z-50 bg-[#f9f9fe]/90 backdrop-blur flex items-center px-6 py-4">
        <button
          onClick={() => router.back()}
          className="text-[#94a3e8] hover:text-[#4b5b9a] transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="font-headline font-bold text-lg ml-4 text-[#1a1c1f]">
          Xác thực
        </h1>
      </header>

      {/* SỬA: Đổi justify-center thành phần lớn flex-col với overflow-y-auto 
          để nếu bàn phím bật lên quá to, người dùng vẫn vuốt lên xuống được */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 flex flex-col overflow-y-auto">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center font-bold text-[#4b5b9a] animate-pulse">
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
