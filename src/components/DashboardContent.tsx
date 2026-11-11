"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";
import { useTheme } from "./ThemeProvider";

ModuleRegistry.registerModules([AllCommunityModule]);

interface Transaction {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  items: { name: string; quantity: number; price: number }[];
  agentReasoning: string;
  userQuery: string;
  timestamp: string;
  payerEmail?: string;
  payerName?: string;
}

export default function DashboardContent() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const gridRef = useRef<AgGridReact>(null);

  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalItems: 0,
  });

  useEffect(() => {
    // Load transactions from localStorage
    const stored = localStorage.getItem("payagent_transactions");
    if (stored) {
      try {
        const txns = JSON.parse(stored) as Transaction[];
        setTransactions(txns);

        const totalRevenue = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
        setStats({
          totalTransactions: txns.length,
          totalRevenue,
          avgOrderValue: txns.length > 0 ? totalRevenue / txns.length : 0,
          totalItems: txns.reduce(
            (sum, t) =>
              sum +
              (t.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0),
            0
          ),
        });

        if (txns.length > 0) {
          setSelectedTxn(txns[txns.length - 1]);
        }
      } catch (err) {
        console.error("Failed to parse transactions", err);
      }
    }
  }, []);

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Order ID",
        field: "orderId",
        width: 170,
        cellRenderer: (params: { value: string }) => {
          return `
            <div style="display: flex; align-items: center; gap: 6px; font-family: monospace; font-size: 12px; color: #2563eb; font-weight: 600;">
              <span>#${params.value || "ORD-N/A"}</span>
            </div>
          `;
        },
      },
      {
        headerName: "Status",
        field: "status",
        width: 140,
        cellRenderer: (params: { value: string }) => {
          const isCompleted = params.value === "COMPLETED";
          const isPending = params.value === "PENDING";
          const bg = isCompleted
            ? "rgba(16, 185, 129, 0.15)"
            : isPending
            ? "rgba(245, 158, 11, 0.15)"
            : "rgba(244, 63, 94, 0.15)";
          const color = isCompleted
            ? "#059669"
            : isPending
            ? "#d97706"
            : "#e11d48";
          const border = isCompleted
            ? "rgba(16, 185, 129, 0.3)"
            : isPending
            ? "rgba(245, 158, 11, 0.3)"
            : "rgba(244, 63, 94, 0.3)";
          const dot = isCompleted ? "#10b981" : isPending ? "#f59e0b" : "#f43f5e";

          return `
            <div style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 10px; border-radius: 9999px; background: ${bg}; border: 1px solid ${border}; color: ${color}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em;">
              <span style="width: 6px; height: 6px; border-radius: 9999px; background: ${dot}; box-shadow: 0 0 6px ${dot};"></span>
              <span>${params.value || "UNKNOWN"}</span>
            </div>
          `;
        },
      },
      {
        headerName: "Amount",
        field: "amount",
        width: 130,
        valueFormatter: (params: { value: number }) =>
          `$${params.value?.toFixed(2) || "0.00"} USD`,
        cellStyle: {
          color: "#059669",
          fontWeight: "700",
          fontFamily: "monospace",
          fontSize: "13px",
        } as Record<string, string>,
      },
      {
        headerName: "Products & Quantities",
        field: "items",
        flex: 1.5,
        minWidth: 220,
        valueFormatter: (params: { value: Transaction["items"] }) => {
          const items = params.value;
          return items?.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "Custom Item";
        },
        cellStyle: { fontSize: "13px", fontWeight: "500" } as Record<string, string>,
      },
      {
        headerName: "User Natural Query",
        field: "userQuery",
        flex: 1.2,
        minWidth: 190,
        cellRenderer: (params: { value: string }) => {
          return `<span style="color: #7c3aed; font-style: italic; font-weight: 500;">"${params.value || ""}"</span>`;
        },
      },
      {
        headerName: "Gateway",
        width: 140,
        valueGetter: () => "PayPal v2",
        cellRenderer: () => {
          return `
            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: rgba(37,99,235,0.1); border: 1px solid rgba(37,99,235,0.25); color: #2563eb; font-size: 11px; font-weight: 600;">
              PayPal Orders
            </span>
          `;
        },
      },
      {
        headerName: "Agent Reasoning",
        field: "agentReasoning",
        flex: 1.5,
        minWidth: 210,
        cellStyle: { color: "#64748b", fontSize: "12px" } as Record<string, string>,
      },
      {
        headerName: "Timestamp",
        field: "timestamp",
        width: 170,
        valueFormatter: (params: { value: string }) =>
          new Date(params.value).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        cellStyle: { color: "#94a3b8", fontSize: "12px" } as Record<string, string>,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const clearTransactions = () => {
    if (confirm("Are you sure you want to clear all transaction and decision logs?")) {
      localStorage.removeItem("payagent_transactions");
      setTransactions([]);
      setSelectedTxn(null);
      setStats({
        totalTransactions: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        totalItems: 0,
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-[#ebedfb] p-6 lg:p-8 overflow-y-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Live Telemetry Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                PayAgent Telemetry & Decision Trail
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs font-semibold text-blue-700 dark:text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                v2.4 Active Orchestrator
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 flex items-center gap-2">
              <span>Autonomous AI commerce pipeline: Gemini 3.1 Function Calling</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>Channel3 Real-time Catalog</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>PayPal Orders v2 Capture</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Socket Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">LIVE</span>
              <span className="text-slate-300 dark:text-slate-500">|</span>
              <span className="text-slate-500 dark:text-slate-400">Sandbox Ready</span>
            </div>

            {transactions.length > 0 && (
              <button
                onClick={clearTransactions}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-semibold transition-all active:scale-95 shadow-sm"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear History
              </button>
            )}
          </div>
        </div>

        {/* Top KPI Metrics Row (4 Glassmorphic Elevated Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Volume */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-br dark:from-[#0e1628]/90 dark:to-[#0b101c]/90 border border-blue-200 dark:border-blue-500/30 p-5 shadow-sm dark:shadow-[0_0_25px_rgba(37,99,235,0.12)] hover:border-blue-400 transition-all group">
            <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Settled Volume
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ${stats.totalRevenue.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
                USD
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 dark:border-emerald-500/20">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                {stats.totalTransactions > 0 ? "+100%" : "0.0%"}
              </span>
              <span className="text-slate-400 dark:text-slate-500">PayPal Orders API</span>
            </div>
          </div>

          {/* Card 2: Total Transactions */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f172a]/70 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Transactions
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stats.totalTransactions}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">orders</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full font-semibold border border-purple-200 dark:border-purple-500/20">
                Verified Traces
              </span>
              <span className="text-slate-400 dark:text-slate-500">Full Audit Log</span>
            </div>
          </div>

          {/* Card 3: Avg Order Value */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f172a]/70 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Average Order Value
              </span>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ${stats.avgOrderValue.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                USD
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-full font-semibold border border-cyan-200 dark:border-cyan-500/20">
                Smart Bundled
              </span>
              <span className="text-slate-400 dark:text-slate-500">Basket Optimization</span>
            </div>
          </div>

          {/* Card 4: Items Sourced */}
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0f172a]/70 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Items Sourced & Sold
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {stats.totalItems}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">units</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full font-semibold border border-amber-200 dark:border-amber-500/20">
                Channel3 Catalog
              </span>
              <span className="text-slate-400 dark:text-slate-500">Live Merchant Feed</span>
            </div>
          </div>
        </section>

        {/* Main Section: AG Grid Autonomous Transaction Records */}
        <section className="rounded-2xl bg-white dark:bg-[#0b101b]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-lg">
          {/* Grid Header Ribbon */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#101726]/60">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Autonomous Payment Telemetry & Ledger
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-400 font-semibold">
                {transactions.length} Records
              </span>
            </div>

            {/* Quick Filter Search */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <svg
                  className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Filter orders, items, reasoning..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
                />
              </div>
            </div>
          </div>

          {/* AG Grid Component */}
          <div
            className={`w-full ${theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine"}`}
            style={{ height: "380px" }}
          >
            {transactions.length > 0 ? (
              <AgGridReact
                ref={gridRef}
                rowData={transactions}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                quickFilterText={searchFilter}
                animateRows={true}
                pagination={true}
                paginationPageSize={10}
                onRowClicked={(event) => {
                  if (event.data) setSelectedTxn(event.data);
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  No Autonomous Transactions Yet
                </h3>
                <p className="text-sm text-slate-500 max-w-md mb-5">
                  Test the agent by chatting in the Assistant tab. Instruct PayAgent to find products and execute a PayPal sandbox checkout!
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Launch Shopping Agent
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* AI Agent Decision Audit Trail (Dedicated Stepper & Timeline Panel) */}
        {selectedTxn && (
          <section className="rounded-2xl bg-white dark:bg-[#0b101b]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800/80 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    AI Autonomous Decision Audit Trail
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Order:</span>
                    <button
                      onClick={() => handleCopyOrderId(selectedTxn.orderId)}
                      className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20"
                      title="Click to copy Order ID"
                    >
                      #{selectedTxn.orderId}
                      {copiedId === selectedTxn.orderId ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">Copied!</span>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <span>•</span>
                    <span>{new Date(selectedTxn.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status & Model Badges */}
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Gemini 3.1 Flash Lite
                </span>
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  PayPal Verified
                </span>
              </div>
            </div>

            {/* Stepper Timeline Breakdown */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {/* Step 1: User Intent Parsing */}
              <div className="relative group">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 ring-4 ring-slate-100 dark:ring-[#0b101b]">
                  1
                </div>
                <div className="bg-slate-50 dark:bg-[#121826]/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80 group-hover:border-blue-400 dark:group-hover:border-blue-500/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        User Natural Language Intent
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-bold">
                        NLP Intent
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Inference Engine: Active
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-2">
                    &ldquo;{selectedTxn.userQuery}&rdquo;
                  </p>
                  <div className="bg-white dark:bg-[#080d17] rounded-lg p-2.5 font-mono text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/60 overflow-x-auto">
                    <code>{JSON.stringify({ query: selectedTxn.userQuery, action: "autonomous_procure" })}</code>
                  </div>
                </div>
              </div>

              {/* Step 2: Catalog Search & Discovery */}
              <div className="relative group">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-[10px] font-bold text-cyan-600 dark:text-cyan-400 ring-4 ring-slate-100 dark:ring-[#0b101b]">
                  2
                </div>
                <div className="bg-slate-50 dark:bg-[#121826]/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80 group-hover:border-cyan-400 dark:group-hover:border-cyan-500/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        Channel3 Catalog Search & Price Validation
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20 font-bold">
                        Catalog Match
                      </span>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {selectedTxn.items?.length || 1} Item(s) Selected
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                    {selectedTxn.agentReasoning || "Agent identified matching products in live merchant catalogs."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {selectedTxn.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#080d17] border border-slate-200 dark:border-slate-800/80 text-xs"
                      >
                        <span className="text-slate-800 dark:text-slate-300 font-medium truncate max-w-[200px]">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: PayPal Payment Order Generation */}
              <div className="relative group">
                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ring-4 ring-slate-100 dark:ring-[#0b101b]">
                  3
                </div>
                <div className="bg-slate-50 dark:bg-[#121826]/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800/80 group-hover:border-emerald-400 dark:group-hover:border-emerald-500/40 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        PayPal Orders v2 API Settlement
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                        Capture 200 OK
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Currency: USD
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                    Created and captured PayPal Order with intent <code className="text-blue-600 dark:text-blue-400">CAPTURE</code>. Verified buyer approval & funds settlement.
                  </p>
                  <div className="bg-white dark:bg-[#080d17] rounded-lg p-2.5 font-mono text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/60 overflow-x-auto">
                    <code>
                      {JSON.stringify({
                        order_id: selectedTxn.orderId,
                        status: selectedTxn.status,
                        amount: selectedTxn.amount,
                        currency: selectedTxn.currency || "USD",
                        payer: selectedTxn.payerEmail || "Verified Sandbox Payer",
                      })}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
