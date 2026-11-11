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

const STARTER_PROMPTS = [
  {
    icon: (
      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    ),
    label: "Wireless headphones under $80",
    description: "Multi-merchant noise-cancelling deals",
    category: "Audio",
    prompt: "Find me wireless noise-cancelling headphones under $80",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: "Ergonomic home office setup",
    description: "Monitor arms & desk accessories",
    category: "Workspace",
    prompt: "I need an ergonomic home office desk setup with monitor accessories",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: "Fast portable power banks",
    description: "MagSafe & USB-C fast charging",
    category: "Travel Tech",
    prompt: "What portable power banks and travel chargers do you recommend?",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    label: "Mechanical keyboards for coding",
    description: "Hot-swappable tactile switches",
    category: "Hardware",
    prompt: "Find me mechanical keyboards for typing and coding under $100",
  },
];

const QUICK_CHIPS = [
  "🏷️ Under $80",
  "⚡ 2-Day Shipping",
  "🎧 Best Audio Deals",
  "💳 Checkout now",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendPrompt = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

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
            "Sorry, I encountered an error connecting to the agent. " +
            (error instanceof Error ? error.message : "Please try again."),
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
      handleSendPrompt(input);
    }
  };

  const handlePaymentSuccess = (
    orderId: string,
    details: Record<string, unknown>
  ) => {
    const checkoutMsg = messages.find((m) => m.checkoutOrderId === orderId);
    const userQuery =
      messages.filter((m) => m.role === "user").pop()?.content ||
      "Shopping assistant purchase";

    const transaction: TransactionRecord = {
      id: crypto.randomUUID(),
      orderId,
      status: "COMPLETED",
      amount: parseFloat((details as Record<string, string>).amount || "0.00"),
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
          .join(" → ") || "Direct Autonomous Capture",
      userQuery,
      timestamp: new Date().toISOString(),
      payerEmail: (details as Record<string, string>).payerEmail,
      payerName: (details as Record<string, string>).payerName,
    };

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
        content: `✅ **Payment Verified & Captured!**\n\n- **Order ID**: \`${orderId}\`\n- **Status**: Completed\n- **Settlement**: $${transaction.amount.toFixed(2)} USD via PayPal Orders v2\n\nYour transaction has been recorded in the telemetry ledger. Would you like to track another purchase or view the dashboard?`,
        timestamp: new Date(),
      },
    ]);
  };

  const hasMessages = messages.length > 0;

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#090d16] text-slate-800 dark:text-[#ebedfb] relative overflow-hidden transition-colors duration-200">
        {/* Ambient background glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-400/10 dark:bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>

        {/* Messages & Hero Canvas */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-40">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* HERO WELCOME STATE: Shown when no messages exist */}
            {!hasMessages && (
              <section className="flex flex-col items-center text-center space-y-6 pt-8 sm:pt-14 pb-8 animate-in fade-in duration-500">
                {/* Glowing Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0f172a]/90 border border-blue-200 dark:border-blue-500/30 shadow-sm dark:shadow-[0_0_20px_rgba(59,130,246,0.18)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  <span className="text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
                    Autonomous AI Shopping Agent
                  </span>
                </div>

                {/* Main Hero Headline */}
                <div className="space-y-3 max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                    What can I help you find today?
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                    PayAgent autonomously searches live merchant catalogs via Channel3, compares verified pricing, and executes 1-click PayPal checkout.
                  </p>
                </div>

                {/* 4 Interactive Suggestion Prompt Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-3xl pt-4">
                  {STARTER_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendPrompt(item.prompt)}
                      className="group flex items-start gap-3.5 p-4 rounded-2xl bg-white dark:bg-[#0f172a]/70 hover:bg-slate-50 dark:hover:bg-[#131d35]/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.12)] transition-all duration-200 text-left active:scale-[0.98]"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-blue-400 dark:group-hover:border-blue-500/40 group-hover:scale-105 transition-all">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate">
                            {item.label}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* MESSAGE STREAM: Displayed as chat occurs */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in duration-300`}
              >
                {message.role === "user" ? (
                  /* User Bubble */
                  <div className="flex items-end gap-2.5 max-w-[85%] sm:max-w-[75%]">
                    <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-sm px-5 py-3.5 shadow-lg border border-blue-400/20">
                      <p className="text-sm sm:text-base leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Assistant Bubble */
                  <div className="flex items-start gap-3.5 max-w-[95%] sm:max-w-[88%] w-full">
                    {/* Bot Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/40 flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.35)]">
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
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* Main Message Card */}
                      <div className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/85 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 shadow-sm dark:shadow-md space-y-3.5">
                        {/* Agent Actions Trace (Collapsible Accordion) */}
                        {message.agentActions && message.agentActions.length > 0 && (
                          <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#090d16]/70 overflow-hidden text-xs">
                            <details className="group">
                              <summary className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors select-none">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    Agent Reasoning & Tool Execution
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {message.agentActions.length} Actions
                                  </span>
                                </div>
                                <span className="text-slate-400 group-open:rotate-180 transition-transform">
                                  ▼
                                </span>
                              </summary>
                              <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2 font-mono text-[11px]">
                                {message.agentActions.map((action, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-2 bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60"
                                  >
                                    <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-[10px]">
                                      {action.tool}
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400 truncate flex-1">
                                      {JSON.stringify(action.args)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}

                        {/* Markdown Content */}
                        <div
                          className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-800 dark:text-slate-200 leading-relaxed [&>p]:my-1.5 [&>ul]:my-1.5 [&>li]:my-0.5"
                          dangerouslySetInnerHTML={{
                            __html: formatMarkdown(message.content),
                          }}
                        />

                        {/* Product Cards Grid */}
                        {message.products && message.products.length > 0 && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Live Merchant Results (Channel3)
                              </span>
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                                In Stock & Verified
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {message.products.slice(0, 6).map((product) => (
                                <ProductCard key={product.id} product={product} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PayPal Checkout Widget */}
                        {message.checkoutOrderId && (
                          <div className="pt-2">
                            <PayPalCheckout
                              orderId={message.checkoutOrderId}
                              onSuccess={handlePaymentSuccess}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3.5 animate-in fade-in duration-300">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/40 flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.35)]">
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Orchestrating search & catalog comparison...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Floating Minimalist Prompt Input Bar (Docked at Bottom) */}
        <aside className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-[#090d16] dark:via-[#090d16]/95 dark:to-transparent pointer-events-none transition-colors duration-200">
          <div className="max-w-3xl mx-auto pointer-events-auto space-y-2">
            {/* Quick Follow-up Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(chip)}
                  disabled={isLoading}
                  className="shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-[#0f172a]/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all active:scale-95 shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Elevated Frosted Glass Input Shell */}
            <div className="flex items-center gap-2 p-2 pl-4 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-700/80 shadow-xl dark:shadow-[0_10px_35px_rgba(0,0,0,0.6)] focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
              {/* Sparkles / AI Icon */}
              <div className="text-blue-600 dark:text-blue-400 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>

              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask PayAgent to find products, compare options, or checkout..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 text-sm py-2 resize-none max-h-28"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendPrompt(input)}
                disabled={isLoading || !input.trim()}
                className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white flex items-center justify-center active:scale-95 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:shadow-none shrink-0"
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
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>

            {/* Micro Caption Footer */}
            <p className="text-[11px] text-slate-500 text-center pt-0.5">
              PayAgent uses AI to compare merchant prices and execute PayPal Orders v2 transactions.
            </p>
          </div>
        </aside>
      </div>
    </PayPalScriptProvider>
  );
}

// Simple markdown formatter
function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='text-slate-900 dark:text-white font-semibold'>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em class='text-slate-700 dark:text-slate-300'>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200 dark:border-slate-700/60">$1</code>')
    .replace(/^- (.*)/gm, "<li class='text-slate-700 dark:text-slate-300'>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc pl-4 space-y-1 my-2">$&</ul>')
    .replace(/^### (.*)/gm, '<h3 class="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">$1</h3>')
    .replace(/^## (.*)/gm, '<h2 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h2>')
    .replace(/\n/g, "<br />");
}
