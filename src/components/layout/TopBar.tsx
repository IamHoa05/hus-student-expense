"use client";

import Link from "next/link";
import React from "react";

export default function TopBar() {
  return (
    /* 1. Loại bỏ calc(100%+3rem) và -mx-6. 
       2. Sử dụng sticky top-0 với bg-surface để nó đứng yên khi cuộn.
       3. px-0 để nó thẳng hàng với nội dung bên dưới (vốn đã được bọc px-6 ở trang page.tsx).
    */
    <nav className="w-full sticky top-0 z-40 bg-[#f9f9fe]/90 backdrop-blur-md flex justify-between items-center py-4 mb-2">
      <div className="flex items-center gap-3">
        {/* Nút Avatar -> Link tới /profile */}
        <Link href="/profile" className="block">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e0e2f1] flex items-center justify-center border-2 border-[#dde1ff] hover:scale-105 transition-transform active:scale-95">
            <span className="material-symbols-outlined text-[#4b5b9a]">
              person
            </span>
          </div>
        </Link>

        <span className="text-[#94A3E8] font-headline font-extrabold text-xl italic tracking-tight">
          Momentum
        </span>
      </div>

      {/* Nút Chuông Thông Báo */}
      <Link
        href="/notifications"
        className="relative text-[#94A3E8] hover:text-[#4b5b9a] transition-colors p-1 active:scale-95 duration-200"
      >
        <span className="material-symbols-outlined text-2xl">
          notifications
        </span>

        {/* Badge số đếm (Chấm đỏ) */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-[#f9f9fe] shadow-sm">
          2
        </span>
      </Link>
    </nav>
  );
}
