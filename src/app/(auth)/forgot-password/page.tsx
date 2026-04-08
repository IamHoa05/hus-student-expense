"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Vui lòng nhập email của bạn!");
      return;
    }
    router.push(`/verify?type=reset&email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background Organic Ornaments */}
      <div className="absolute top-0 -right-20 w-80 h-80 bg-[#94a3e8]/20 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/2 -left-32 w-64 h-64 bg-[#e0e2f1]/30 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl -z-10 pointer-events-none"></div>

      {/* TopAppBar (Mũi tên quay lại góc trái) */}
      <nav className="w-full max-w-md mx-auto top-0 sticky bg-[#f9f9fe]/90 backdrop-blur flex items-center px-6 py-4 z-50">
        <button
          onClick={() => router.back()}
          className="text-[#94a3e8] hover:text-[#4b5b9a] transition-colors active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="font-headline font-bold text-lg ml-4 text-[#94a3e8]">
          Quên mật khẩu
        </h1>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md mx-auto px-6 pb-12 flex flex-col justify-center relative z-10">
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Hero Branding Section */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] rounded-2xl shadow-lg shadow-[#4b5b9a]/20">
              <span
                className="material-symbols-outlined text-white text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock_reset
              </span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-[#4b5b9a] tracking-tight mb-3">
              Khôi phục quyền truy cập
            </h2>
            <p className="text-[#616470] text-sm font-medium leading-relaxed max-w-xs mx-auto">
              Đừng lo lắng! Hãy nhập email của bạn để nhận hướng dẫn đặt lại mật
              khẩu.
            </p>
          </div>

          {/* Form Card (Bo khung vuông vắn) */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2e2e7] shadow-sm space-y-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Field */}
              <div className="space-y-1.5">
                <label
                  className="block text-xs font-bold uppercase tracking-widest text-[#616470] ml-1"
                  htmlFor="email"
                >
                  Email xác thực
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#c6c5d1] text-xl">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="momentum@edu.vn"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#f3f3f8] border-none focus:ring-2 focus:ring-[#94a3e8] text-[#1a1c1f] font-medium placeholder:text-[#c6c5d1] transition-all"
                  />
                </div>
              </div>

              {/* Main Actions */}
              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full bg-[#dde1ff] text-[#283775] hover:bg-[#94a3e8] hover:text-white transition-all duration-300 py-3.5 rounded-xl font-headline font-bold text-base shadow-sm active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  <span>Gửi mã xác nhận</span>
                  <span className="material-symbols-outlined text-lg">
                    send
                  </span>
                </button>

                <div className="flex items-center justify-center my-4">
                  <div className="h-[1px] flex-grow bg-[#c6c5d1]/30"></div>
                  <span className="px-4 text-[10px] font-bold text-[#616470] uppercase tracking-widest">
                    Hoặc
                  </span>
                  <div className="h-[1px] flex-grow bg-[#c6c5d1]/30"></div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full border-2 border-[#e2e2e7] text-[#454650] hover:bg-[#f3f3f8] transition-colors duration-300 py-3.5 rounded-xl font-headline font-bold flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl">
                    arrow_back_ios_new
                  </span>
                  <span>Quay lại đăng nhập</span>
                </button>
              </div>
            </form>
          </div>

          {/* Context Links */}
          {/* <div className="mt-10 text-center">
            <p className="text-xs text-[#616470] font-medium mb-1">
              Gặp khó khăn khi nhận mã?
            </p>
            <button className="text-xs font-bold text-[#4b5b9a] hover:text-[#283775] transition-colors">
              Liên hệ bộ phận hỗ trợ
            </button>
          </div> */}
        </div>
      </main>
    </div>
  );
}
