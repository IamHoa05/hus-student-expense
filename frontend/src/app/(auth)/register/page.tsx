"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();

  // ==========================================
  // STATE QUẢN LÝ DỮ LIỆU & BƯỚC (STEPS)
  // ==========================================
  const [step, setStep] = useState<1 | 2>(1); // 1: Hoàn tất hồ sơ, 2: Nhập OTP

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ==========================================
  // HANDLER: BƯỚC 1 - GỬI THÔNG TIN VÀ NHẬN MÃ
  // ==========================================
  const handleRegisterInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Kiểm tra rỗng
    if (!name || !email || !dob || !password) {
      setErrorMsg("Vui lòng điền đầy đủ tất cả thông tin.");
      return;
    }

    // Giả lập: Gọi API gửi email thành công -> Chuyển sang Bước 2
    setSuccessMsg(`Mã xác nhận đã được gửi đến ${email}`);
    setStep(2);

    // Xóa thông báo màu xanh sau 3s cho đỡ vướng
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ==========================================
  // HANDLER: BƯỚC 2 - XÁC NHẬN MÃ OTP
  // ==========================================
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (otp.length < 6) {
      setErrorMsg("Vui lòng nhập đủ 6 số mã xác nhận.");
      return;
    }

    // Giả lập: Nếu mã là "123456" thì cho qua, khác thì báo lỗi
    if (otp !== "123456") {
      setErrorMsg("Mã xác nhận không hợp lệ hoặc đã hết hạn. (Thử: 123456)");
      return;
    }

    // Đăng ký hoàn tất
    setSuccessMsg("Xác thực thành công! Đang chuyển về Đăng nhập...");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen flex flex-col items-center relative overflow-x-hidden">
      {/* Decorative Element (Asymmetric Wave from Top Right) */}
      <div className="absolute top-0 right-0 -z-10 opacity-20 pointer-events-none">
        <svg
          fill="none"
          height="400"
          viewBox="0 0 400 400"
          width="400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M400 0C400 220.914 220.914 400 0 400V0H400Z"
            fill="url(#paint0_linear)"
          ></path>
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_linear"
              x1="400"
              x2="0"
              y1="0"
              y2="400"
            >
              <stop stopColor="#94A3E8"></stop>
              <stop offset="1" stopColor="#4B5B9A"></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* TopAppBar */}
      <nav className="w-full max-w-md mx-auto top-0 sticky bg-[#f9f9fe]/90 backdrop-blur flex items-center px-6 py-4 z-50">
        <button
          onClick={() => (step === 2 ? setStep(1) : router.back())}
          className="text-[#94a3e8] hover:text-[#4b5b9a] transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="font-headline font-bold text-lg ml-4 text-[#1a1c1f]">
          {step === 1 ? "Tạo tài khoản" : "Xác thực Email"}
        </h1>
      </nav>

      <main className="flex-1 w-full max-w-md px-6 pt-4 pb-12 flex flex-col">
        {/* Hiển thị thông báo chung */}
        {errorMsg && (
          <div className="mb-4 bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold p-3 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2 border border-[#93000a]/20">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-[#d1f4e0] text-[#059669] text-xs font-bold p-3 rounded-xl flex items-start gap-2 animate-in fade-in zoom-in border border-[#059669]/20">
            <span className="material-symbols-outlined text-[16px]">
              check_circle
            </span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================================================================
            BƯỚC 1: FORM HOÀN TẤT HỒ SƠ (Chỉ hiện khi step === 1)
            ================================================================ */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 flex flex-col flex-grow">
            {/* Hero Section / Identity */}
            <header className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] shadow-lg">
                  {/* Google Profile Avatar Placeholder */}
                  <Image
                    width={96}
                    height={96}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-[#f9f9fe]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1WFi7GxU2Vy77hW4sMASoCwdzMal1m1s-JJHhM2y8mYK_E5-xy2bhiWWAUmCHFM1q1gWzg0f2QP7GdaoiYhSWp2lT6hH9iRXxfTzrUzHYiTAcZUXs9wwAgNh4yT2zaE7OfTwri4pE-scANcbgLTi30hl3CtuX8TkNrH34onLGr-xjleGv-Nz4BgJnfY6bDy3vkNq9VGpjY3Lvrxg0TUxNO988CJewM9e1xFlu0JifXZyRql_DFpYo8-MwHTmAVajwQg9K0_2A-ho"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm">
                  {/* Google Logo Placeholder */}
                  <Image
                    width={20}
                    height={20}
                    alt="Google"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNHzyMgvkYT_Bp8R_8gfOZMtCOWLx6sR4yxsdwta9RrhelrDJhBc0ws5tFniBJbLR7lzk4gm4UX8i4PV1aixkKmo4ibvUdwBJZGdPV50lrodW61roKlkxzf7RlQqhC266m5QqH9hocQwGmdQUinimA3nFCZJsBcepHgzUDZV2Tac7mjJB5C_uDDLsDeJ7WNiTF3cl_MHr2oUZC43RqaYiYjBmNNQAy_Jrb5nxIBMVqfZ5ZlhW1Al8KJZu7_-u_ntXFiD4ASdGV4nU"
                  />
                </div>
              </div>
              <h2 className="font-headline text-3xl font-extrabold text-[#1a1c1f] tracking-tight mb-2">
                Hoàn tất hồ sơ
              </h2>
              <p className="font-body text-[#616470] text-sm leading-relaxed px-4">
                Một bước nữa để bắt đầu hành trình quản lý tài chính của bạn
              </p>
            </header>

            {/* Form Section */}
            <form
              onSubmit={handleRegisterInfo}
              className="space-y-5 flex-grow flex flex-col"
            >
              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Họ và Tên
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ và tên của bạn"
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl px-5 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl pl-5 pr-12 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium"
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#4b5b9a]">
                    mail
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Ngày sinh
                </label>
                <div className="relative">
                  {/* Thay type="text" thành type="date" */}
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    // Lớp ẩn icon lịch mặc định của Chrome/Safari (để dùng icon Material của bạn)
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl pl-5 pr-12 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  {/* Icon Material của bạn nằm đè lên trên */}
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#4b5b9a] pointer-events-none">
                    calendar_today
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl pl-5 pr-12 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium"
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#4b5b9a]">
                    visibility
                  </span>
                </div>
              </div>

              {/* Savings Goal Preview (Bento-style element) */}
              <div className="bg-[#f3f3f8] rounded-2xl p-5 border border-[#e2e2e7] mt-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#dde1ff] p-3 rounded-2xl">
                    <span className="material-symbols-outlined text-[#4b5b9a]">
                      rocket_launch
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-[#1a1c1f]">
                      Lộ trình Momentum
                    </h4>
                    <p className="font-body text-[11px] text-[#616470] mt-0.5">
                      Tự động thiết lập mục tiêu sau khi hoàn tất
                    </p>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-[#e2e2e7] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] w-[15%] rounded-full"></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[9px] font-bold text-[#4b5b9a] uppercase tracking-widest">
                    Khởi tạo
                  </span>
                  <span className="text-[9px] font-bold text-[#767681] uppercase tracking-widest">
                    15% Hoàn tất
                  </span>
                </div>
              </div>

              {/* CTA Section */}
              <div className="pt-6 mt-auto">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-bold text-lg py-5 rounded-full shadow-lg shadow-[#4b5b9a]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Bắt đầu ngay</span>
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              </div>

              {/* Terms & Policy */}
              <footer className="text-center px-2 pt-4">
                <p className="font-body text-[11px] text-[#616470] leading-relaxed">
                  Bằng cách tiếp tục, bạn đồng ý với{" "}
                  <a
                    className="text-[#4b5b9a] font-bold hover:underline"
                    href="#"
                  >
                    Điều khoản
                  </a>{" "}
                  &{" "}
                  <a
                    className="text-[#4b5b9a] font-bold hover:underline"
                    href="#"
                  >
                    Chính sách
                  </a>{" "}
                  của chúng tôi
                </p>
              </footer>
            </form>
          </div>
        )}

        {/* ================================================================
            BƯỚC 2: FORM XÁC NHẬN OTP (Chỉ hiện khi step === 2)
            ================================================================ */}
        {step === 2 && (
          <div className="flex-grow flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-8 mt-6 text-center">
              <div className="w-24 h-24 bg-[#dde1ff] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span
                  className="material-symbols-outlined text-[#4b5b9a] text-5xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mark_email_read
                </span>
              </div>
              <h2 className="font-headline font-extrabold text-3xl tracking-tight text-[#1a1c1f]">
                Xác thực Email
              </h2>
              <p className="text-[#616470] mt-3 text-sm font-medium leading-relaxed px-4">
                Chúng tôi vừa gửi một mã gồm 6 chữ số đến email <br />
                <span className="font-bold text-[#4b5b9a]">{email}</span>
              </p>
            </header>

            <form
              onSubmit={handleVerifyOTP}
              className="space-y-6 flex-grow flex flex-col items-center"
            >
              <div className="w-full max-w-[280px]">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} // Chỉ cho nhập số
                  placeholder="------"
                  className="w-full text-center text-4xl tracking-[0.5em] font-headline font-extrabold py-4 bg-transparent border-b-2 border-[#c6c5d1] focus:border-[#4b5b9a] outline-none text-[#1a1c1f] placeholder:text-[#e2e2e7] transition-colors"
                />
              </div>

              <button
                type="button"
                className="text-[#616470] text-[11px] font-bold uppercase tracking-widest hover:text-[#4b5b9a] transition-colors mt-4 bg-[#f3f3f8] px-4 py-2 rounded-full"
              >
                Gửi lại mã
              </button>

              <div className="w-full mt-auto pt-10 pb-8">
                <button
                  type="submit"
                  disabled={!!successMsg}
                  className={`w-full py-5 rounded-full font-headline font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    successMsg
                      ? "bg-[#10b981] text-white shadow-[#10b981]/20"
                      : "bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white shadow-[#4b5b9a]/20 hover:opacity-95"
                  }`}
                >
                  {successMsg ? "Đã xác thực xong!" : "Xác nhận & Hoàn tất"}
                  {!successMsg && (
                    <span className="material-symbols-outlined">verified</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
