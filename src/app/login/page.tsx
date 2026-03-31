"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }
    // Giả lập đăng nhập thành công
    router.push("/dashboard");
  };

  const handleGoogleLogin = () => {
    // Giả lập đăng nhập Google
    router.push("/dashboard");
  };

  return (
    <main className="flex flex-col w-full max-w-md mx-auto min-h-screen bg-[#f9f9fe] px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#94a3e8]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-20%] w-72 h-72 bg-[#4b5b9a]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex-1 flex flex-col justify-center py-12 z-10">
        {/* Logo & Heading */}
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-[#4b5b9a]/20 mb-6 transform rotate-12">
            <span
              className="material-symbols-outlined text-white text-3xl -rotate-12"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              all_inclusive
            </span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-[#1a1c1f] tracking-tight">
            Mừng bạn trở lại!
          </h1>
          <p className="text-[#616470] mt-2 text-sm">
            Tiếp tục hành trình quản lý tài chính cùng Momentum.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#454650] uppercase tracking-widest pl-1">
              Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767681]">
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sinhvien@vnu.edu.vn"
                className="w-full bg-[#f3f3f8] border border-[#e2e2e7] rounded-2xl py-4 pl-12 pr-4 text-[#1a1c1f] focus:ring-2 focus:ring-[#4b5b9a]/30 focus:border-[#4b5b9a] transition-all font-medium placeholder:text-[#c6c5d1]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#454650] uppercase tracking-widest pl-1">
              Mật khẩu
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#767681]">
                lock
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f3f3f8] border border-[#e2e2e7] rounded-2xl py-4 pl-12 pr-4 text-[#1a1c1f] focus:ring-2 focus:ring-[#4b5b9a]/30 focus:border-[#4b5b9a] transition-all font-medium placeholder:text-[#c6c5d1]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-xs font-bold text-[#4b5b9a] hover:opacity-80 transition-opacity"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] text-white py-4 rounded-2xl font-headline font-bold text-lg shadow-lg shadow-[#4b5b9a]/20 hover:opacity-95 active:scale-95 transition-transform"
          >
            Đăng nhập
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-[#e2e2e7]"></div>
          <span className="px-4 text-[10px] font-bold text-[#767681] uppercase tracking-widest">
            Hoặc tiếp tục với
          </span>
          <div className="flex-1 h-px bg-[#e2e2e7]"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full bg-white border border-[#e2e2e7] text-[#1a1c1f] py-4 rounded-2xl font-headline font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#f3f3f8] active:scale-95 transition-all shadow-sm"
        >
          {/* Biểu tượng Google SVG */}
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
          Tiếp tục bằng Google
        </button>

        {/* Footer Link */}
        <p className="text-center mt-10 text-sm text-[#616470] font-medium">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="text-[#4b5b9a] font-bold hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </main>
  );
}
