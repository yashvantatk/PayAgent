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
      <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 text-center">
        <span className="text-3xl">✅</span>
        <p className="text-green-400 font-semibold mt-2">Payment Complete!</p>
        <p className="text-gray-400 text-sm">Order: {orderId}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
      <div className="text-center mb-3">
        <p className="text-white font-semibold">
          🔒 Secure PayPal Checkout
        </p>
        <p className="text-gray-400 text-sm">
          Order ID: {orderId}
        </p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {isPending ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading PayPal...</span>
        </div>
      ) : (
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 45,
          }}
          createOrder={() => {
            // Return the already-created order ID
            return Promise.resolve(orderId);
          }}
          onApprove={async (data) => {
            try {
              // Capture the order on the server
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
      )}
    </div>
  );
}
