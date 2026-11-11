"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 h-16 w-full border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_18px_rgba(59,130,246,0.4)] border border-blue-400/30 group-hover:scale-105 transition-transform">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-extrabold text-lg tracking-tight">
              PayAgent
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v2.4
            </span>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="flex items-center gap-1 p-1 rounded-full bg-[#0f172a]/90 border border-slate-800/80 shadow-inner">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              pathname === "/"
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            {pathname === "/" && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
            )}
            <span>Assistant</span>
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
              pathname === "/dashboard"
                ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            {pathname === "/dashboard" && (
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
            )}
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold tracking-wide">Channel3 Live</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
            <svg
              className="w-3.5 h-3.5 text-blue-400"
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
            <span className="text-[11px] font-semibold tracking-wide">PayPal Sandbox</span>
          </div>
        </div>
      </div>
    </header>
  );
}
