"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const router = useRouter();

  // ==========================================
  // STATE QUẢN LÝ DỮ LIỆU & BƯỚC (STEPS)
  // ==========================================
  const [step, setStep] = useState<1 | 2>(1); // 1: Hoàn tất hồ sơ, 2: Nhập OTP

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false); // Ẩn/hiện mật khẩu
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ==========================================
  // REFS ĐỂ FOCUS VÀO INPUT KHI LỖI
  // ==========================================
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // TỰ ĐỘNG ẨN THÔNG BÁO SAU 3 GIÂY
  // ==========================================
  useEffect(() => {
    if (errorMsg || successMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
        setSuccessMsg("");
      }, 3000); // Tăng lên 3s để người dùng kịp đọc lỗi từ API
      return () => clearTimeout(timer);
    }
  }, [errorMsg, successMsg]);

  // ==========================================
  // HANDLER: GỬI THÔNG TIN ĐĂNG KÝ XUỐNG BACKEND
  // Backend hiện thực hiện đăng ký trực tiếp (không bắt OTP ở bước này),
  // nên sau khi đăng ký thành công ta chuyển về trang /login.
  // ==========================================
  const handleRegisterInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // 1. Kiểm tra Họ và Tên
    if (!name.trim()) {
      setErrorMsg("Vui lòng nhập Họ và Tên của bạn.");
      nameRef.current?.focus();
      return;
    }

    // 2. Kiểm tra Email (Rỗng và định dạng)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập địa chỉ Email.");
      emailRef.current?.focus();
      return;
    } else if (!emailRegex.test(email)) {
      setErrorMsg("Email không đúng định dạng. Vui lòng kiểm tra lại.");
      emailRef.current?.focus();
      return;
    }

    // 3. Kiểm tra Số điện thoại
    const phoneRegex = /^(0|\+84)[0-9]{8,9}$/;
    if (!phone.trim()) {
      setErrorMsg("Vui lòng nhập Số điện thoại.");
      phoneRef.current?.focus();
      return;
    } else if (!phoneRegex.test(phone.trim())) {
      setErrorMsg(
        "Số điện thoại không hợp lệ (Phải đủ 10 số, bắt đầu bằng 0 hoặc +84)."
      );
      phoneRef.current?.focus();
      return;
    }

    // 4. Kiểm tra Mật khẩu
    if (!password) {
      setErrorMsg("Vui lòng nhập Mật khẩu.");
      passwordRef.current?.focus();
      return;
    } else if (password.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      passwordRef.current?.focus();
      return;
    }

    try {
      // 5. GỌI API THẬT (Link xuống Backend)
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          phone: phone,
          password: password,
          full_name: name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Đăng ký thất bại, vui lòng thử lại.");
      }

      // 6. THÀNH CÔNG: Hiển thị thông báo và chuyển về trang đăng nhập
      setSuccessMsg(`Đăng ký thành công! Vui lòng đăng nhập.`);
      // Delay để người dùng thấy thông báo rồi điều hướng
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể kết nối đến máy chủ.");
    }
  };

  // (Bỏ bước OTP vì backend hiện tạo user ngay khi gọi /auth/register)

  return (
    <div className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-[100dvh] flex flex-col items-center relative overflow-x-hidden">
      {/* ================================================================
          MODAL CẢNH BÁO LỖI Ở GIỮA MÀN HÌNH (TỪ BẢN 2)
          ================================================================ */}
      {errorMsg && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-4 pointer-events-none w-full max-w-sm">
          <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">error</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-[#1a1c1f] mb-2">
              Lỗi thông tin
            </h3>
            <p className="text-[#616470] text-sm px-2 leading-relaxed">
              {errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL THÔNG BÁO THÀNH CÔNG Ở GIỮA MÀN HÌNH
          ================================================================ */}
      {successMsg && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] px-4 pointer-events-none w-full max-w-sm">
          <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center text-center border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-[#d1f4e0] text-[#059669] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">
                check_circle
              </span>
            </div>
            <h3 className="font-headline font-bold text-xl text-[#1a1c1f] mb-2">
              Thành công
            </h3>
            <p className="text-[#616470] text-sm px-2 leading-relaxed">
              {successMsg}
            </p>
          </div>
        </div>
      )}

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
        <h1 className="font-headline font-bold text-lg ml-4 text-[#4b5b9a]">
          {step === 1 ? "Tạo tài khoản" : "Xác thực Email"}
        </h1>
      </nav>

      <main className="flex-1 w-full max-w-md px-6 pt-4 pb-12 flex flex-col">
        {/* ================================================================
            BƯỚC 1: FORM HOÀN TẤT HỒ SƠ
            ================================================================ */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 flex flex-col flex-grow">
            <header className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] shadow-lg">
                  <Image
                    width={96}
                    height={96}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover border-4 border-[#f9f9fe]"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1WFi7GxU2Vy77hW4sMASoCwdzMal1m1s-JJHhM2y8mYK_E5-xy2bhiWWAUmCHFM1q1gWzg0f2QP7GdaoiYhSWp2lT6hH9iRXxfTzrUzHYiTAcZUXs9wwAgNh4yT2zaE7OfTwri4pE-scANcbgLTi30hl3CtuX8TkNrH34onLGr-xjleGv-Nz4BgJnfY6bDy3vkNq9VGpjY3Lvrxg0TUxNO988CJewM9e1xFlu0JifXZyRql_DFpYo8-MwHTmAVajwQg9K0_2A-ho"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm">
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

            <form
              onSubmit={handleRegisterInfo}
              className="space-y-5 flex-grow flex flex-col"
            >
              {/* HỌ VÀ TÊN */}
              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Họ và Tên
                </label>
                <div className="relative">
                  <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập họ và tên của bạn"
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl px-5 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl pl-5 pr-12 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium"
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#4b5b9a] pointer-events-none">
                    mail
                  </span>
                </div>
              </div>

              {/* SỐ ĐIỆN THOẠI */}
              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <input
                    ref={phoneRef}
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    } // Chỉ cho phép nhập số
                    placeholder="0123 456 789"
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl pl-5 pr-12 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium"
                  />
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#4b5b9a] pointer-events-none">
                    call
                  </span>
                </div>
              </div>

              {/* MẬT KHẨU */}
              <div className="space-y-1.5">
                <label className="font-headline text-xs font-bold text-[#4b5b9a] uppercase tracking-widest ml-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#e2e2e7]/50 border-none rounded-2xl pl-5 pr-12 py-4 text-[#1a1c1f] placeholder:text-[#767681] focus:ring-2 focus:ring-[#94a3e8] transition-all outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#4b5b9a] hover:text-[#283775] transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
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
            BƯỚC 2: FORM XÁC NHẬN OTP
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
              onSubmit={(e) => e.preventDefault()}
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
                  type="button"
                  onClick={() => router.push('/login')}
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
