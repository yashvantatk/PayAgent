"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 h-16 flex items-center px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              PayAgent
            </h1>
            <p className="text-gray-500 text-[10px] leading-tight">
              AI Shopping Assistant
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            💬 Chat
          </Link>
          <Link
            href="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/dashboard"
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            📊 Dashboard
          </Link>
        </div>

        {/* PayPal Badge */}
        <div className="flex items-center gap-2">
          <span className="bg-yellow-500/10 text-yellow-500 text-xs font-semibold px-3 py-1.5 rounded-full border border-yellow-500/20">
            PayPal Sandbox
          </span>
        </div>
      </div>
    </nav>
  );
}
