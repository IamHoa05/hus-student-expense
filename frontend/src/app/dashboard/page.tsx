"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface BalanceData {
  current: number;
  income: number;
  expense: number;
}

interface Category {
  category_id: number;
  category_name: string;
  transaction_type: string;
  icon: string;
}

interface Budget {
  budget_id: number;
  category_id: number;
  amount_limit: number;
}

interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  limit: number;
  percentage: number;
  icon: string;
}

const getCurrentMonth = () => {
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  return months[new Date().getMonth()];
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState("");
  const [trend, setTrend] = useState(0);
  const [balance, setBalance] = useState<BalanceData>({
    current: 0,
    income: 0,
    expense: 0,
  });

  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    setCurrentMonth(getCurrentMonth());
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const now = new Date();

      const [remainingRes, categoriesRes, budgetsRes, txRes] =
        await Promise.all([
          fetch(
            `${API_URL}/budgets/remaining?month=${
              now.getMonth() + 1
            }&year=${now.getFullYear()}`,
            { credentials: "include" }
          ),
          fetch(`${API_URL}/categories`, { credentials: "include" }),
          fetch(`${API_URL}/budgets`, { credentials: "include" }),
          fetch(`${API_URL}/transactions`, { credentials: "include" }),
        ]);

      const remainingJson = await remainingRes.json();
      const categoriesJson = await categoriesRes.json();
      const budgetsJson = await budgetsRes.json();
      const txJson = await txRes.json();

      const remain = remainingJson?.data || {};

      setBalance({
        current: remain.total_remaining || 0,
        income: remain.inflow_total || 0,
        expense: remain.outflow_total || 0,
      });

      // =========================
      // TREND (FIX LOGIC)
      // =========================
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const prevRes = await fetch(
        `${API_URL}/budgets/remaining?month=${
          prevMonth.getMonth() + 1
        }&year=${prevMonth.getFullYear()}`,
        { credentials: "include" }
      );

      const prevJson = await prevRes.json();

      const currentExpense = remain.outflow_total || 0;
      const previousExpense = prevJson?.data?.outflow_total || 0;

      let percent = 0;

      if (previousExpense === 0 && currentExpense > 0) {
        percent = 100;
      } else if (previousExpense > 0) {
        percent = Math.round(
          ((currentExpense - previousExpense) / previousExpense) * 100
        );
      }

      setTrend(percent);

      // =========================
      // CATEGORY MAP
      // =========================
      const categoryList: Category[] = Array.isArray(categoriesJson)
        ? categoriesJson
        : [];

      const budgetList: Budget[] = Array.isArray(budgetsJson)
        ? budgetsJson
        : [];

      const budgetMap = new Map<number, Budget>();
      budgetList.forEach((b) => budgetMap.set(b.category_id, b));

      const spentMap = new Map<number, number>();

      const groups = txJson?.data?.data || [];

      groups.forEach((group: any) => {
        (group.transactions || []).forEach((tx: any) => {
          if (tx.transaction_type === "outflow") {
            const prev = spentMap.get(tx.category_id) || 0;
            spentMap.set(tx.category_id, prev + Number(tx.amount || 0));
          }
        });
      });

      const merged: ExpenseCategory[] = [];

      categoryList.forEach((cat) => {
        if (cat.transaction_type !== "outflow") return;

        const spent = spentMap.get(cat.category_id) || 0;
        const limit = budgetMap.get(cat.category_id)?.amount_limit || 0;

        if (spent > 0 || limit > 0) {
          merged.push({
            id: String(cat.category_id),
            name: cat.category_name,
            amount: spent,
            limit,
            percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0,
            icon: cat.icon || "category",
          });
        }
      });

      setCategories(merged);
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // TREND UI LOGIC (FIX MÀU)
  // =========================
  const isUp = trend > 0;
  const isDown = trend < 0;
  const isFlat = trend === 0;

  return (
    <main className="flex-grow w-full max-w-md mx-auto px-5 pt-2 pb-28 min-h-screen bg-[#f9f9fe]">
      <TopBar />

      {/* BALANCE */}
      <header className="mb-5">
        <div className="bg-gradient-to-br from-[#4b5b9a] to-[#94a3e8] p-5 rounded-2xl text-white shadow-lg">
          <p className="text-xs uppercase tracking-widest text-[#dde1ff]">
            Khoản dư
          </p>

          <h1 className="font-headline font-extrabold text-3xl mt-2">
            {formatCurrency(balance.current)}
          </h1>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase text-[#dde1ff]">
                Chi tiêu {currentMonth}
              </p>
              <p className="font-bold text-base mt-1">
                {formatCurrency(balance.expense)}
              </p>
            </div>

            {/* TREND FIX */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                isUp
                  ? "text-[#ba1a1a] bg-[#ffdad6]/50"
                  : isDown
                  ? "text-[#059669] bg-[#d1f4e0]/50"
                  : "text-[#767681] bg-[#e2e2e7]"
              }`}
            >
              <span className="material-symbols-outlined text-xs">
                {isUp ? "trending_up" : "trending_down"}
              </span>

              <span>
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* CATEGORY */}
      <div className="bg-white p-4 rounded-2xl border border-[#e2e2e7]/60 shadow-sm">
        <h2 className="font-bold text-base mb-3">Phân bổ chi tiêu</h2>

        <div className="grid gap-2">
          {categories.map((category) => {
            const isWarning = category.percentage >= 85;

            return (
              <Link
                key={category.id}
                href={`/analytics/${category.id}`}
                className="flex gap-3 p-3 rounded-xl border border-[#e2e2e7]/40"
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-xl ${
                    isWarning
                      ? "bg-[#ffdad6] text-[#ba1a1a]"
                      : "bg-[#f3f3f8] text-[#4b5b9a]"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {category.icon}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs font-bold">{category.name}</p>
                      <p className="text-[9px] text-[#616470]">
                        {formatCurrency(category.amount)} /{" "}
                        {formatCurrency(category.limit)}
                      </p>
                    </div>

                    <p className="text-xs font-bold text-[#4b5b9a]">
                      {category.percentage}%
                    </p>
                  </div>

                  <div className="h-1.5 bg-[#e2e2e7] rounded-full mt-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4b5b9a] to-[#94a3e8]"
                      style={{
                        width: `${Math.min(category.percentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
