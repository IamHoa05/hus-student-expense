"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  // ==============================================================
  // LOGIC ẨN THANH ĐIỀU HƯỚNG TẠI CÁC TRANG CHI TIẾT/ĐĂNG NHẬP
  // ==============================================================
  const hiddenPaths = [
    "/",
    "/login",
    "/add",
    "/room/deposit",
    "/room/split",
    "/profile",
    "/dashboard/add",
    "/dashboard/goals/[Id]",
    "/notifications",
    "/register",
    "/forgot-password",
    "/verify",
  ];

  // Ẩn nếu URL nằm trong danh sách trên, HOẶC là trang chi tiết phân tích (ví dụ: /analytics/cat_food)
  // nhưng VẪN PHẢI HIỂN THỊ ở trang /analytics gốc
  const shouldHide =
    hiddenPaths.includes(pathname) ||
    (pathname.startsWith("/analytics/") && pathname !== "/analytics") ||
    pathname.startsWith("/dashboard/goals");

  if (shouldHide) {
    return null;
  }
  // ==============================================================

  // Danh sách các tab dựa trên thiết kế của bạn
  const navItems = [
    { name: "Trang chủ", path: "/dashboard", icon: "home" },
    { name: "Lịch sử", path: "/transactions", icon: "history" },
    { name: "Thêm", path: "/add", icon: "add_circle", isMain: true },
    { name: "Phân tích", path: "/analytics", icon: "insights" },
    { name: "Phòng", path: "/room", icon: "groups" },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md flex justify-around items-center px-4 pb-6 pt-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-t-[3rem] z-50 shadow-[0_-20px_40px_rgba(75,91,154,0.08)] border-t border-[#e2e2e7]/20">
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        if (item.isMain) {
          // Nút "Thêm" ở giữa to hơn
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[#94A3E8] transition-colors px-3 py-2 active:scale-90 duration-200"
            >
              <span
                className="material-symbols-outlined text-3xl"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className="font-headline font-medium text-[11px] mt-1">
                {item.name}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center rounded-2xl px-4 py-2 transition-all duration-300 ease-out ${
              isActive
                ? "bg-[#94A3E8]/20 text-[#4b5b9a] dark:text-white scale-110"
                : "text-[#94A3E8]/60 dark:text-slate-500 hover:bg-[#94A3E8]/10"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-headline font-medium text-[10px]">
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
