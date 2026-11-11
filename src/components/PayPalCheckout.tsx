"use client";

import React, { useState } from "react";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

interface PayPalCheckoutProps {
  orderId: string;
  onSuccess: (orderId: string, details: Record<string, unknown>) => void;
}

export default function PayPalCheckout({
  orderId,
  onSuccess,
}: PayPalCheckoutProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  if (completed) {
    return (
      <div className="rounded-2xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-950/60 dark:to-emerald-900/30 border border-emerald-300 dark:border-emerald-500/40 p-5 text-center shadow-lg">
        <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h4 className="text-slate-900 dark:text-white font-bold text-base">Payment Captured Successfully!</h4>
        <p className="text-emerald-700 dark:text-emerald-400 text-xs font-mono mt-1">
          PayPal Order ID: #{orderId}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
          Receipt logged to Decision Trail & Telemetry ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm">
              Autonomous Express Checkout
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Authorized PayPal Orders v2 Sandbox
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            #{orderId.slice(0, 12)}...
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-3 mb-3 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isPending ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-500 dark:text-slate-400 text-xs">Initializing PayPal Gateway...</span>
        </div>
      ) : (
        <div className="space-y-3">
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
              height: 44,
            }}
            createOrder={() => {
              return Promise.resolve(orderId);
            }}
            onApprove={async (data) => {
              try {
                const response = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ orderId: data.orderID }),
                });

                const captureData = await response.json();

                if (response.ok) {
                  setCompleted(true);
                  onSuccess(data.orderID!, {
                    amount: captureData.amount,
                    currency: captureData.currency,
                    payerEmail: captureData.payerEmail,
                    payerName: captureData.payerName,
                    status: captureData.status,
                  });
                } else {
                  setError(captureData.error || "Payment capture failed");
                }
              } catch (err) {
                setError(
                  "Payment capture failed: " +
                    (err instanceof Error ? err.message : "Unknown error")
                );
              }
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              setError("PayPal encountered an error. Please try again.");
            }}
            onCancel={() => {
              setError("Payment was cancelled. You can try again when ready.");
            }}
          />

          <div className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500 pt-1">
            <svg
              className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Encrypted PayPal Vault Tokenization</span>
          </div>
        </div>
      )}
    </div>
  );
}
