"use client";

import React, { useState, useRef, useEffect } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Product, CartItem, AgentAction } from "@/lib/types";
import ProductCard from "./ProductCard";
import PayPalCheckout from "./PayPalCheckout";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
  cart?: CartItem[];
  checkoutOrderId?: string;
  agentActions?: AgentAction[];
  timestamp: Date;
}

interface TransactionRecord {
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

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hey there! I'm **PayAgent**, your AI shopping assistant. I can help you find products, compare options, and checkout securely with PayPal.\n\nTry saying something like:\n- *\"Find me wireless headphones under $80\"*\n- *\"I need a home office setup\"*\n- *\"What portable chargers do you have?\"*\n\nWhat are you looking for today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build message history for the API
      const history = [...messages.filter((m) => m.id !== "welcome"), userMessage].map(
        (m) => ({
          role: m.role,
          content: m.content,
        })
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.text,
        products: data.products,
        cart: data.cart,
        checkoutOrderId: data.checkoutOrderId,
        agentActions: data.agentActions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again. " +
            (error instanceof Error ? error.message : ""),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePaymentSuccess = (
    orderId: string,
    details: Record<string, unknown>
  ) => {
    // Find the message with this checkout
    const checkoutMsg = messages.find((m) => m.checkoutOrderId === orderId);
    const userQuery =
      messages
        .filter((m) => m.role === "user")
        .pop()?.content || "Shopping assistant purchase";

    const transaction: TransactionRecord = {
      id: crypto.randomUUID(),
      orderId,
      status: "COMPLETED",
      amount: parseFloat(
        (details as Record<string, string>).amount || "0.00"
      ),
      currency: "USD",
      items:
        checkoutMsg?.cart?.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })) || [],
      agentReasoning:
        checkoutMsg?.agentActions
          ?.map((a) => `${a.tool}(${JSON.stringify(a.args)})`)
          .join(" → ") || "",
      userQuery,
      timestamp: new Date().toISOString(),
      payerEmail: (details as Record<string, string>).payerEmail,
      payerName: (details as Record<string, string>).payerName,
    };

    setTransactions((prev) => [...prev, transaction]);

    // Save to localStorage for dashboard
    const existing = JSON.parse(
      localStorage.getItem("payagent_transactions") || "[]"
    );
    localStorage.setItem(
      "payagent_transactions",
      JSON.stringify([...existing, transaction])
    );

    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: `✅ **Payment Successful!**\n\nOrder ID: \`${orderId}\`\nStatus: Completed\n\nThank you for your purchase! Is there anything else I can help you find?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-950">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-100 border border-gray-700"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {message.role === "user" ? "👤" : "🤖"}
                    </span>
                    <span className="text-xs opacity-60">
                      {message.role === "user" ? "You" : "PayAgent"}
                    </span>
                  </div>

                  {/* Message content */}
                  <div
                    className="prose prose-invert prose-sm max-w-none [&>p]:my-1 [&>ul]:my-1"
                    dangerouslySetInnerHTML={{
                      __html: formatMarkdown(message.content),
                    }}
                  />

                  {/* Agent actions (collapsible) */}
                  {message.agentActions && message.agentActions.length > 0 && (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
                        🔧 Agent Actions ({message.agentActions.length})
                      </summary>
                      <div className="mt-2 space-y-1 bg-gray-900 rounded-lg p-3">
                        {message.agentActions.map((action, i) => (
                          <div key={i} className="text-gray-400">
                            <span className="text-green-400">{action.tool}</span>
                            <span className="text-gray-500">
                              ({JSON.stringify(action.args)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Product cards */}
                  {message.products && message.products.length > 0 && (
                    <div className="mt-4 grid gap-3">
                      {message.products.slice(0, 6).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}

                  {/* PayPal Checkout */}
                  {message.checkoutOrderId && (
                    <div className="mt-4">
                      <PayPalCheckout
                        orderId={message.checkoutOrderId}
                        onSuccess={handlePaymentSuccess}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-sm text-gray-400 ml-2">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-gray-900 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me what you're looking for..."
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 min-h-[48px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 font-medium transition-colors flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              PayAgent uses AI to help you shop. Payments are processed securely via PayPal Sandbox.
            </p>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-gray-700 px-1 rounded text-sm">$1</code>')
    .replace(/^- (.*)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-4">$&</ul>')
    .replace(/^### (.*)/gm, '<h3 class="text-lg font-bold mt-3">$1</h3>')
    .replace(/^## (.*)/gm, '<h2 class="text-xl font-bold mt-3">$1</h2>')
    .replace(/\n/g, "<br />");
}
