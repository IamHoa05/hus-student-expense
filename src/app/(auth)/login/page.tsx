"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleEmailLoginClick = () => {
    setShowEmailForm(!showEmailForm);
    setErrorMsg("");
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    if (password !== "123456") {
      setErrorMsg("Mật khẩu không chính xác hoặc tài khoản không tồn tại.");
      return;
    }

    router.push("/dashboard");
  };

  const handleGoogleLogin = () => {
    router.push("/dashboard");
  };

  return (
    // 1. Loại bỏ các class chia cột flex-row, giữ lại flex-col và căn giữa tuyệt đối
    <div className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* 2. Đưa main về chuẩn max-w-md mx-auto, bỏ các lề lg/xl thừa */}
      <main className="w-full max-w-md mx-auto px-6 py-12 flex flex-col justify-center relative z-10 min-h-screen">
        {/* Background Organic Ornaments */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#94a3e8]/20 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl -z-10"></div>
        <div className="absolute top-1/2 -left-32 w-64 h-64 bg-[#e0e2f1]/30 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl -z-10"></div>

        {/* Branding Section */}
        <header className="text-center mb-10 pt-8">
          <div className="mb-6 flex justify-center">
            {/* 3. Sửa Logo: Bỏ rotate-3, làm cho vuông vắn và sang trọng */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4b5b9a]/20">
              <span
                className="material-symbols-outlined text-white text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </div>
          </div>
          <h1 className="font-headline font-extrabold text-4xl italic tracking-tighter text-[#4b5b9a] mb-2">
            Momentum
          </h1>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-[#1a1c1f] mt-4">
            Chào mừng đến với Momentum
          </h2>
          <p className="text-[#616470] mt-2 font-medium">
            Bắt đầu hành trình tự chủ tài chính của bạn
          </p>
        </header>

        {/* Action Cards Container */}
        <div className="w-full space-y-4">
          {/* Nút 1: Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] hover:opacity-90 transition-all duration-300 py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#4b5b9a]/20 group active:scale-95"
          >
            <div className="bg-white p-1.5 rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span className="font-headline font-bold text-white text-lg">
              Tiếp tục với Google
            </span>
          </button>

          {/* Nút 2: Email Sign In Toggle */}
          <button
            onClick={handleEmailLoginClick}
            className={`w-full hover:bg-[#e2e2e7] transition-colors duration-300 py-4 px-6 rounded-2xl flex items-center justify-center gap-3 active:scale-95 border ${
              showEmailForm
                ? "bg-[#e2e2e7] border-[#c6c5d1]"
                : "bg-[#f3f3f8] border-[#e2e2e7]/50"
            }`}
          >
            <span className="material-symbols-outlined text-[#4b5b9a]">
              mail
            </span>
            <span className="font-headline font-bold text-[#454650] text-lg">
              Tiếp tục với Email
            </span>
          </button>

          {/* Cửa sổ form xổ xuống */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showEmailForm
                ? "max-h-[500px] opacity-100 transform translate-y-0"
                : "max-h-0 opacity-0 transform -translate-y-4"
            }`}
          >
            <form
              onSubmit={handleLoginSubmit}
              className="bg-white p-5 rounded-2xl border border-[#e2e2e7] shadow-sm mt-2 space-y-4"
            >
              {errorMsg && (
                <div className="bg-[#ffdad6] text-[#ba1a1a] text-xs font-bold p-3 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-[#616470] ml-1"
                  htmlFor="email"
                >
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c6c5d1] text-xl">
                    person
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="momentum@edu.vn"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f8] border-none outline-none focus:text-[#1a1c1f] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-[#616470] ml-1"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c6c5d1] text-xl">
                    lock
                  </span>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f8] border-none outline-none focus:text-[#1a1c1f] transition-all"
                  />
                </div>

                {/* THÊM MỚI: Link Quên mật khẩu */}
                <div className="flex justify-end pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold text-[#4b5b9a] hover:text-[#283775] hover:underline transition-all"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#dde1ff] text-[#283775] hover:bg-[#94a3e8] hover:text-white transition-all duration-300 py-3.5 rounded-xl font-headline font-bold text-base shadow-sm active:scale-95 mt-2"
              >
                Đăng nhập
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 my-10">
          <div className="h-[1px] flex-grow bg-[#c6c5d1]/30"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#616470]">
            Hoặc tham gia ngay
          </span>
          <div className="h-[1px] flex-grow bg-[#c6c5d1]/30"></div>
        </div>

        {/* Nút Đăng ký tài khoản mới */}
        <div className="w-full flex justify-center mb-10">
          <Link
            href="/register"
            className="w-full border-2 border-[#4b5b9a] text-[#4b5b9a] hover:bg-[#4b5b9a]/5 transition-colors duration-300 py-4 px-6 rounded-2xl font-headline font-bold flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined">person_add</span>
            Đăng ký tài khoản mới
          </Link>
        </div>

        {/* Progress Bar (Editorial Component) */}
        <div className="w-full bg-[#f3f3f8] p-6 rounded-2xl relative overflow-hidden mb-10 border border-[#e2e2e7]/60">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <span className="font-headline text-sm font-bold text-[#4b5b9a]">
                Mục tiêu của bạn
              </span>
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#616470]">
                80% Hoàn thành
              </span>
            </div>
            <div className="w-full h-3 bg-[#e2e2e7] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] rounded-full w-[80%]"></div>
            </div>
            <p className="text-xs text-[#616470] leading-relaxed italic mt-1">
              "Tương lai tài chính được xây dựng từ những quyết định hôm nay."
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <footer className="mt-auto pb-6 w-full text-center">
          <div className="flex justify-center gap-8 mb-4">
            <button className="text-xs font-bold text-[#616470] hover:text-[#4b5b9a] transition-colors">
              Điều khoản
            </button>
            <button className="text-xs font-bold text-[#616470] hover:text-[#4b5b9a] transition-colors">
              Bảo mật
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#c6c5d1] font-bold">
            Bản quyền © 2026 Momentum Inc.
          </p>
        </footer>
      </main>
    </div>
  );
}
