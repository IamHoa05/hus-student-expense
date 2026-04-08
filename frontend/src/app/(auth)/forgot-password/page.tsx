"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) {
    alert("Vui lòng nhập email của bạn!");
    return;
  }

  try {
    // 1. Gọi API để Backend gửi OTP
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });

    if (response.ok) {
      // 2. Nếu gửi mail thành công, mới chuyển sang trang nhập mã
      router.push(`/verify?type=reset&email=${encodeURIComponent(email)}`);
    } else {
      const data = await response.json();
      alert(data.detail || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  } catch (error) {
    alert("Không thể kết nối đến máy chủ.");
  }
};

  return (
    <div className="bg-[#f9f9fe] font-body text-[#1a1c1f] min-h-screen flex flex-col overflow-x-hidden">
      {/* Header / TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-[#f9f9fe]/90 backdrop-blur-md flex items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-[#94a3e8] hover:opacity-80 transition-opacity active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[#94a3e8] font-headline font-bold text-lg">
            Quên mật khẩu
          </h1>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background Fluid Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#94a3e8]/10 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#e0e2f1]/20 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md z-10">
          {/* Hero Branding Section */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-[#f3f3f8] rounded-xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] opacity-10 rounded-xl"></div>
              <span
                className="material-symbols-outlined text-[#4b5b9a] text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock_reset
              </span>
            </div>
            <h2 className="font-headline text-4xl font-extrabold text-[#4b5b9a] tracking-tight mb-4">
              Quên mật khẩu
            </h2>
            <p className="text-[#454650] text-lg leading-relaxed max-w-xs mx-auto">
              Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
            </p>
          </div>

          {/* Forgot Password Card */}
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(75,91,154,0.08)]">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Input Field Group */}
              <div className="space-y-3">
                <label
                  className="font-headline font-bold text-sm text-[#4b5b9a] ml-1 block"
                  htmlFor="email"
                >
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#767681] group-focus-within:text-[#4b5b9a] transition-colors">
                    <span className="material-symbols-outlined text-xl">
                      mail
                    </span>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full h-14 pl-12 pr-4 bg-[#e2e2e7]/40 rounded-full border-none focus:ring-2 focus:ring-[#4b5b9a]/40 focus:bg-white transition-all font-medium text-[#1a1c1f] placeholder:text-[#767681]/60"
                  />
                </div>
              </div>

              {/* Main Action */}
              <div className="space-y-6">
                <button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white font-headline font-bold rounded-full shadow-lg hover:shadow-[#4b5b9a]/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Gửi mã xác nhận</span>
                  <span className="material-symbols-outlined text-xl">
                    send
                  </span>
                </button>

                <div className="flex items-center justify-center">
                  <div className="h-[1px] flex-grow bg-[#e2e2e7]"></div>
                  <span className="px-4 text-xs font-bold text-[#767681] uppercase tracking-widest">
                    Hoặc
                  </span>
                  <div className="h-[1px] flex-grow bg-[#e2e2e7]"></div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full h-14 bg-[#e0e2f1] text-[#4b5b9a] font-headline font-bold rounded-full hover:bg-[#4b5b9a]/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">
                    arrow_back_ios_new
                  </span>
                  <span>Quay lại đăng nhập</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}