"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry, ColDef } from "ag-grid-community";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      const txns = JSON.parse(stored) as Transaction[];
      setTransactions(txns);

      const totalRevenue = txns.reduce((sum, t) => sum + t.amount, 0);
      setStats({
        totalTransactions: txns.length,
        totalRevenue,
        avgOrderValue: txns.length > 0 ? totalRevenue / txns.length : 0,
        totalItems: txns.reduce(
          (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
          0
        ),
      });
    }
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Order ID",
        field: "orderId",
        width: 180,
        cellStyle: { color: "#60a5fa", fontFamily: "monospace", fontSize: "12px" } as Record<string, string>,
      },
      {
        headerName: "Status",
        field: "status",
        width: 120,
        cellRenderer: (params: { value: string }) => {
          const color =
            params.value === "COMPLETED"
              ? "#4ade80"
              : params.value === "PENDING"
              ? "#fbbf24"
              : "#f87171";
          return `<span style="color: ${color}; font-weight: 600;">● ${params.value}</span>`;
        },
      },
      {
        headerName: "Amount",
        field: "amount",
        width: 120,
        valueFormatter: (params: { value: number }) =>
          `$${params.value?.toFixed(2) || "0.00"}`,
        cellStyle: { color: "#4ade80", fontWeight: "bold" } as Record<string, string>,
      },
      {
        headerName: "Items",
        field: "items",
        flex: 1,
        minWidth: 200,
        valueFormatter: (params: { value: Transaction["items"] }) => {
          const items = params.value;
          return items?.map((i) => `${i.quantity}× ${i.name}`).join(", ") || "";
        },
        cellStyle: { color: "#d1d5db" } as Record<string, string>,
      },
      {
        headerName: "User Query",
        field: "userQuery",
        flex: 1,
        minWidth: 180,
        cellStyle: { color: "#a78bfa", fontStyle: "italic" } as Record<string, string>,
      },
      {
        headerName: "Agent Reasoning",
        field: "agentReasoning",
        flex: 1,
        minWidth: 200,
        cellStyle: { color: "#94a3b8", fontSize: "11px" } as Record<string, string>,
      },
      {
        headerName: "Time",
        field: "timestamp",
        width: 180,
        valueFormatter: (params: { value: string }) =>
          new Date(params.value).toLocaleString(),
        cellStyle: { color: "#9ca3af" } as Record<string, string>,
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
    localStorage.removeItem("payagent_transactions");
    setTransactions([]);
    setStats({
      totalTransactions: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      totalItems: 0,
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-950 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              📊 Transaction Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              AI Agent decision audit trail & payment history
            </p>
          </div>
          <button
            onClick={clearTransactions}
            className="text-sm text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-4 py-2 rounded-lg transition-colors"
          >
            Clear History
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Transactions"
            value={stats.totalTransactions.toString()}
            icon="📋"
            color="blue"
          />
          <StatCard
            label="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="💰"
            color="green"
          />
          <StatCard
            label="Avg Order Value"
            value={`$${stats.avgOrderValue.toFixed(2)}`}
            icon="📈"
            color="purple"
          />
          <StatCard
            label="Items Sold"
            value={stats.totalItems.toString()}
            icon="📦"
            color="yellow"
          />
        </div>

        {/* AG Grid */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Transaction Log
            </h2>
            <span className="text-gray-500 text-sm">
              Powered by AG Grid
            </span>
          </div>
          <div
            className="ag-theme-alpine-dark"
            style={{ height: "400px", width: "100%" }}
          >
            {transactions.length > 0 ? (
              <AgGridReact
                rowData={transactions}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                pagination={true}
                paginationPageSize={10}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <span className="text-4xl mb-3">🛒</span>
                <p className="text-lg font-medium">No transactions yet</p>
                <p className="text-sm">
                  Complete a purchase in the chat to see data here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Agent Decision Trail */}
        {transactions.length > 0 && (
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">
              🧠 Agent Decision Trail
            </h2>
            <div className="space-y-3">
              {transactions.slice(-5).reverse().map((txn) => (
                <div
                  key={txn.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        User: &ldquo;{txn.userQuery}&rdquo;
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Agent Actions: {txn.agentReasoning || "Direct checkout"}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Items:{" "}
                        {txn.items
                          .map((i) => `${i.quantity}× ${i.name}`)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">
                        ${txn.amount?.toFixed(2)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(txn.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: "blue" | "green" | "purple" | "yellow";
}) {
  const colorMap = {
    blue: "from-blue-500/10 to-blue-600/5 border-blue-800/50",
    green: "from-green-500/10 to-green-600/5 border-green-800/50",
    purple: "from-purple-500/10 to-purple-600/5 border-purple-800/50",
    yellow: "from-yellow-500/10 to-yellow-600/5 border-yellow-800/50",
  };

  const textColorMap = {
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
    yellow: "text-yellow-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4`}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${textColorMap[color]} mt-2`}>
        {value}
      </p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}
