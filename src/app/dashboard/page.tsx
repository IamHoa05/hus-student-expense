// "use client";

// import React, { useState, useEffect } from "react";

// // =======================================================================
// // 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPESCRIPT INTERFACES)
// // =======================================================================
// interface BalanceData {
//   current: number;
//   income: number;
//   expense: number;
//   trendPercentage: number;
// }

// interface RunwayData {
//   estimatedDate: string;
//   estimatedMonth: string;
//   progressPercent: number;
//   aiAdvice: string;
// }

// interface SavingGoal {
//   id: string;
//   title: string;
//   subtitle: string;
//   progressPercent: number;
// }

// interface ExpenseCategory {
//   id: string;
//   name: string;
//   amount: number;
//   percentage: number;
//   icon: string;
//   // Các class màu sắc để giao diện linh động đổi màu theo từng danh mục
//   iconBgClass: string;
//   textHighlightClass: string;
// }

// // =======================================================================
// // 2. BỘ DỮ LIỆU ẢO (MOCK DATA) - SAU NÀY SẼ ĐƯỢC THAY BẰNG DỮ LIỆU TỪ API
// // =======================================================================
// const MOCK_BALANCE: BalanceData = {
//   current: 8450000,
//   income: 12000000,
//   expense: 3550000,
//   trendPercentage: 12,
// };

// const MOCK_RUNWAY: RunwayData = {
//   estimatedDate: "24",
//   estimatedMonth: "Tháng 10",
//   progressPercent: 75,
//   aiAdvice:
//     "Bạn đang tiêu xài nhanh hơn 15% so với tháng trước. Hãy tiết chế ăn uống bên ngoài!",
// };

// const MOCK_GOALS: SavingGoal[] = [
//   {
//     id: "g1",
//     title: "Buy Headphones",
//     subtitle: "Sony WH-1000XM5",
//     progressPercent: 65,
//   },
//   {
//     id: "g2",
//     title: "Học phí kỳ 2",
//     subtitle: "Đại học Khoa học Tự nhiên",
//     progressPercent: 30,
//   },
// ];

// const MOCK_CATEGORIES: ExpenseCategory[] = [
//   {
//     id: "c1",
//     name: "Ăn uống",
//     amount: 1800000,
//     percentage: 51,
//     icon: "restaurant",
//     iconBgClass: "bg-[#4b5b9a]",
//     textHighlightClass: "text-[#4b5b9a]",
//   },
//   {
//     id: "c2",
//     name: "Học tập",
//     amount: 1200000,
//     percentage: 34,
//     icon: "school",
//     iconBgClass: "bg-[#94a3e8]",
//     textHighlightClass: "text-[#283775]",
//   },
//   {
//     id: "c3",
//     name: "Di chuyển",
//     amount: 350000,
//     percentage: 10,
//     icon: "directions_bus",
//     iconBgClass: "bg-[#c5a344]",
//     textHighlightClass: "text-[#755b00]",
//   },
//   {
//     id: "c4",
//     name: "Khác",
//     amount: 200000,
//     percentage: 5,
//     icon: "more_horiz",
//     iconBgClass: "bg-[#c6c5d1]",
//     textHighlightClass: "text-[#454650]",
//   },
// ];

// // Hàm hỗ trợ định dạng tiền tệ VNĐ
// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat("vi-VN", {
//     style: "currency",
//     currency: "VND",
//   }).format(amount);
// };

// // =======================================================================
// // 3. GIAO DIỆN CHÍNH (XÂY KHUNG VÀ ĐỔ DỮ LIỆU)
// // =======================================================================
// export default function DashboardPage() {
//   // Giả lập trạng thái đang tải dữ liệu (Loading)
//   const [isLoading, setIsLoading] = useState(true);

//   // Giả lập gọi API mất 0.5s để load xong
//   useEffect(() => {
//     const timer = setTimeout(() => setIsLoading(false), 500);
//     return () => clearTimeout(timer);
//   }, []);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-[#4b5b9a] font-bold">
//         Đang tải dữ liệu Momentum...
//       </div>
//     );
//   }

//   return (
//     <main className="flex-grow w-full max-w-md mx-auto px-6 pt-4 pb-28 relative min-h-screen">
//       {/* TopAppBar */}
//       <nav className="w-full top-0 sticky z-40 bg-[#f9f9fe] flex justify-between items-center py-4 bg-gradient-to-b from-[#f3f3f8] to-transparent -mx-6 px-6 mb-4 w-[calc(100%+3rem)]">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e0e2f1] active:scale-95 duration-200 block cursor-pointer">
//             <span className="material-symbols-outlined text-[#4b5b9a] w-full h-full flex items-center justify-center bg-[#dde1ff]">
//               person
//             </span>
//           </div>
//           <span className="text-[#94A3E8] font-headline font-extrabold text-xl italic tracking-tight">
//             Momentum
//           </span>
//         </div>
//         <div className="flex items-center gap-4">
//           <button className="text-slate-400 hover:opacity-80 transition-opacity active:scale-95 duration-200">
//             <span className="material-symbols-outlined text-2xl">
//               notifications
//             </span>
//           </button>
//         </div>
//       </nav>

//       {/* Hero Section: Balance */}
//       <header className="mb-8">
//         <div className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-8 rounded-xl text-white shadow-xl flex flex-col gap-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

//           <div className="z-10">
//             <p className="font-body text-sm uppercase tracking-widest text-[#dde1ff] opacity-90 mb-2">
//               Số dư hiện tại
//             </p>
//             {/* Đổ dữ liệu số dư */}
//             <h1 className="font-headline font-extrabold text-5xl tracking-tight">
//               {formatCurrency(MOCK_BALANCE.current)}
//             </h1>
//             <div className="mt-4 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm">
//               <span className="material-symbols-outlined text-sm">
//                 trending_up
//               </span>
//               <span className="text-xs font-medium">
//                 +{MOCK_BALANCE.trendPercentage}% tháng này
//               </span>
//             </div>
//           </div>

//           <div className="z-10 grid grid-cols-2 gap-8 w-full">
//             <div>
//               <p className="font-body text-xs uppercase tracking-wider text-[#dde1ff] opacity-80 mb-1">
//                 Thu nhập
//               </p>
//               <p className="font-headline font-bold text-xl">
//                 {formatCurrency(MOCK_BALANCE.income)}
//               </p>
//             </div>
//             <div>
//               <p className="font-body text-xs uppercase tracking-wider text-[#dde1ff] opacity-80 mb-1">
//                 Chi tiêu
//               </p>
//               <p className="font-headline font-bold text-xl">
//                 {formatCurrency(MOCK_BALANCE.expense)}
//               </p>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Bento Grid Sections */}
//       <div className="flex flex-col gap-6">
//         {/* Spending Runway Card */}
//         <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgba(75,91,154,0.04)] border border-[#e2e2e7]/50 relative group overflow-hidden">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h2 className="font-headline font-bold text-2xl text-[#4b5b9a] tracking-tight">
//                 Spending Runway
//               </h2>
//               <p className="text-[#616470] text-sm mt-1">
//                 Dự đoán AI dựa trên thói quen
//               </p>
//             </div>
//             <div className="p-3 bg-[#e0e2f1] rounded-full text-[#4b5b9a]">
//               <span
//                 className="material-symbols-outlined"
//                 style={{ fontVariationSettings: "'FILL' 1" }}
//               >
//                 auto_awesome
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-col items-center py-2">
//             <p className="text-[#454650] font-medium mb-1">
//               Ngày dự kiến 'cháy túi'
//             </p>
//             <div className="flex items-baseline gap-2">
//               <span className="font-headline font-extrabold text-6xl text-[#ba1a1a]">
//                 {MOCK_RUNWAY.estimatedDate}
//               </span>
//               <span className="font-headline font-bold text-2xl text-[#1a1c1f]">
//                 {MOCK_RUNWAY.estimatedMonth}
//               </span>
//             </div>

//             <div className="mt-6 w-full bg-[#f3f3f8] rounded-full h-4 overflow-hidden">
//               <div
//                 className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] rounded-full"
//                 style={{ width: `${MOCK_RUNWAY.progressPercent}%` }}
//               ></div>
//             </div>

//             <p className="mt-4 text-xs text-[#616470] bg-[#ededf2] p-3 rounded-xl border border-[#c6c5d1]/30 italic leading-relaxed text-center">
//               "{MOCK_RUNWAY.aiAdvice}"
//             </p>
//           </div>
//         </div>

//         {/* Saving Goals Tracker */}
//         <div className="bg-[#f3f3f8] p-8 rounded-2xl flex flex-col justify-between border border-[#e2e2e7]/50">
//           <div>
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="font-headline font-bold text-xl text-[#1a1c1f]">
//                 Mục tiêu tiết kiệm
//               </h2>
//               <span className="material-symbols-outlined text-[#4b5b9a]">
//                 flag
//               </span>
//             </div>

//             <div className="space-y-6">
//               {/* Dùng hàm map() để render tự động danh sách mục tiêu từ Mock Data */}
//               {MOCK_GOALS.map((goal) => (
//                 <div key={goal.id}>
//                   <div className="flex justify-between items-end mb-3">
//                     <div>
//                       <p className="font-headline font-bold text-lg text-[#1a1c1f]">
//                         {goal.title}
//                       </p>
//                       <p className="text-xs text-[#616470] mt-0.5">
//                         {goal.subtitle}
//                       </p>
//                     </div>
//                     <p className="font-bold text-[#4b5b9a]">
//                       {goal.progressPercent}%
//                     </p>
//                   </div>
//                   <div className="w-full h-4 bg-[#e2e2e7] rounded-full overflow-hidden">
//                     <div
//                       className="h-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8] rounded-full"
//                       style={{ width: `${goal.progressPercent}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <button className="mt-8 w-full bg-[#94a3e8] text-[#283775] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-sm">
//             <span className="material-symbols-outlined">add</span>
//             Thêm mục tiêu mới
//           </button>
//         </div>

//         {/* Category Breakdown */}
//         <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgba(75,91,154,0.04)] border border-[#e2e2e7]/50">
//           <h2 className="font-headline font-bold text-xl mb-6 text-[#1a1c1f]">
//             Phân bổ chi tiêu
//           </h2>

//           <div className="grid grid-cols-1 gap-3 mt-4">
//             {/* Dùng hàm map() để render tự động danh sách chi tiêu từ Mock Data */}
//             {MOCK_CATEGORIES.map((category) => (
//               <div
//                 key={category.id}
//                 className="flex items-center gap-4 p-4 rounded-xl bg-[#f3f3f8]"
//               >
//                 <div
//                   className={`w-10 h-10 rounded-full ${category.iconBgClass} flex items-center justify-center text-white`}
//                 >
//                   <span className="material-symbols-outlined text-sm">
//                     {category.icon}
//                   </span>
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-bold text-[#1a1c1f]">
//                     {category.name}
//                   </p>
//                   <p className="text-xs text-[#616470] mt-0.5">
//                     {formatCurrency(category.amount)}
//                   </p>
//                 </div>
//                 <p className={`font-bold ${category.textHighlightClass}`}>
//                   {category.percentage}%
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Floating Action Button (FAB) */}
//       <button className="fixed bottom-28 right-1/2 translate-x-[9.5rem] w-14 h-14 bg-[#4b5b9a] text-white rounded-full shadow-xl shadow-[#4b5b9a]/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-40">
//         <span className="material-symbols-outlined text-3xl">add</span>
//       </button>
//     </main>
//   );
// }
