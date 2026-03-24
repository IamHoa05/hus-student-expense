"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setTimeout(() => {
      alert("Tính năng đăng nhập Google sẽ được kích hoạt sau!");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col items-center overflow-x-hidden">
      {/* Mobile Frame Container */}
      <main className="flex-grow w-full max-w-md px-6 flex flex-col items-center justify-center relative">
        {/* Background Organic Ornaments */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-container/20 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl -z-10"></div>
        <div className="absolute top-1/2 -left-32 w-64 h-64 bg-secondary-container/30 rounded-[60%_40%_70%_30%/30%_60%_40%_70%] blur-3xl -z-10"></div>

        {/* Branding Section */}
        <header className="text-center mb-12 mt-10">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] rounded-xl flex items-center justify-center shadow-lg overflow-hidden relative">
              {/* SỬ DỤNG COMPONENT IMAGE CỦA NEXT.JS ĐỂ CHÈN ẢNH */}
              <Image
                src="/logo.png"
                alt="Momentum Logo"
                fill // Ảnh sẽ chiếm hết khung w-16 h-16 ở trên
                className="object-contain p-2" // object-contain giúp ảnh không bị méo, p-2 để cách mép khung 1 chút cho đẹp
                priority // Ưu tiên load ảnh này trước vì nó ở đầu trang
              />
            </div>
          </div>

          {/* 2. DÒNG CHỮ MOMENTUM NẰM NGAY BÊN DƯỚI */}
          <h1 className="font-headline font-extrabold text-4xl italic tracking-tighter text-primary mb-2">
            Momentum
          </h1>

          <h2 className="font-headline text-2xl font-bold tracking-tight text-on-surface mt-4">
            Chào mừng đến với Momentum
          </h2>
          <p className="text-on-secondary-container mt-2">
            Bắt đầu hành trình tự chủ tài chính của bạn
          </p>
        </header>

        {/* Action Cards Container */}
        <div className="w-full space-y-4">
          {/* Google Sign In - Primary CTA */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] hover:opacity-90 transition-all duration-300 py-4 px-6 rounded-lg flex items-center justify-center gap-3 shadow-md group active:scale-95 disabled:opacity-70"
          >
            <div className="bg-white p-1 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            <span className="font-headline font-semibold text-on-primary text-lg">
              {isLoading ? "Đang kết nối..." : "Tiếp tục với Google"}
            </span>
          </button>
        </div>

        {/* Visual Divider */}
        <div className="w-full flex items-center gap-4 my-10 hidden">
          {/* Hidden since email option is removed, keeping structure for potential future use */}
          <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
          <span className="text-xs font-label uppercase tracking-widest text-on-secondary-container">
            Hoặc tham gia ngay
          </span>
          <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
        </div>

        {/* Momentum Tracker Visual Prompt */}
        <div className="w-full bg-surface-container-low p-6 rounded-xl relative overflow-hidden mb-8 mt-4">
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <span className="font-headline text-sm font-bold text-primary">
                Mục tiêu của bạn
              </span>
              <span className="font-label text-xs font-medium text-on-secondary-container">
                80% Hoàn thành
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-6 bg-secondary-container rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] rounded-full w-[80%]"></div>
            </div>
            <p className="text-xs text-on-secondary-container leading-relaxed italic">
              "Tương lai tài chính được xây dựng từ những quyết định hôm nay."
            </p>
          </div>
          {/* Decorative glass element */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary-container/10 rounded-full blur-xl"></div>
        </div>

        {/* Footer Links */}
        <footer className="mt-auto py-8 w-full z-10">
          <nav className="flex flex-col items-center gap-4">
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm font-label text-on-secondary-container hover:text-primary transition-colors border-b border-transparent hover:border-primary"
              >
                Điều khoản
              </a>
              <a
                href="#"
                className="text-sm font-label text-on-secondary-container hover:text-primary transition-colors border-b border-transparent hover:border-primary"
              >
                Bảo mật
              </a>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-outline">
              Bản quyền © 2026 Momentum Inc.
            </p>
          </nav>
        </footer>
      </main>
    </div>
  );
}
