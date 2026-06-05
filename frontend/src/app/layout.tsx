import "./globals.css";
import BottomNavigation from "@/components/layout/BottomNavigation";

export const metadata = {
  title: "Tiêu Tỉnh",
  description: "Quản lý chi tiêu thông minh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-100 flex justify-center min-h-screen font-['Inter']">
        <div className="w-full max-w-md bg-[#f9f9fe] min-h-screen relative shadow-2xl overflow-x-hidden">
          {children}
          {/*Thanh điều hướng */}
          <BottomNavigation />
        </div>
      </body>
    </html>
  );
}
