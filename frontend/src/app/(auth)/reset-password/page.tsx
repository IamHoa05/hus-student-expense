"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State để ẩn/hiện mật khẩu
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đổi mật khẩu thành công! Hãy đăng nhập lại nhé.");
        router.push("/login");
      } else {
        // --- FIX LỖI OBJECT & VIỆT HÓA TẠI ĐÂY ---
        let msg = "Phiên làm việc đã hết hạn. Vui lòng thử lại từ đầu.";
        
        if (typeof data.detail === "string") {
          msg = data.detail;
        } else if (Array.isArray(data.detail)) {
          // Xử lý lỗi validate từ FastAPI (mảng object)
          const err = data.detail[0];
          if (err.type === "value_error.missing") msg = "Đừng để trống mật khẩu nhé.";
          else msg = "Dữ liệu không hợp lệ, Hòa kiểm tra lại nhé.";
        }
        setErrorMsg(msg);
      }
    } catch (error) {
      setErrorMsg("Không thể kết nối đến máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f9f9fe] min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#94a3e8]/10 rounded-full blur-3xl -z-10"></div>
      
      <main className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white rounded-2xl shadow-xl">
            <span className="material-symbols-outlined text-[#4b5b9a] text-4xl">password</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#4b5b9a] tracking-tight mb-2">Mật khẩu mới</h2>
          <p className="text-[#616470] text-sm italic">Hệ thống đã xác thực, Hòa hãy đặt mật khẩu mới.</p>
        </div>

        <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgba(75,91,154,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold text-center animate-shake">
                {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              {/* Mật khẩu mới */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4b5b9a] ml-1 uppercase tracking-widest">Mật khẩu mới</label>
                <div className="relative group">
                  <input
                    type={showPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 px-6 bg-[#f3f3f8] rounded-2xl border-none focus:ring-2 focus:ring-[#4b5b9a]/40 focus:bg-white transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3e8] hover:text-[#4b5b9a] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPass ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4b5b9a] ml-1 uppercase tracking-widest">Xác nhận mật khẩu</label>
                <div className="relative group">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 px-6 bg-[#f3f3f8] rounded-2xl border-none focus:ring-2 focus:ring-[#4b5b9a]/40 focus:bg-white transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3e8] hover:text-[#4b5b9a] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPass ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full h-14 bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] text-white font-bold rounded-full shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}</span>
              {!isLoading && <span className="material-symbols-outlined text-xl">verified_user</span>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}