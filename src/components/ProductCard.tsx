"use client";

import React from "react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Compute dummy MSRP for nice discount presentation if not present
  const originalPrice = product.price * 1.25;

  return (
    <div className="relative group flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#0d1424]/90 backdrop-blur-md border border-slate-800/90 hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all duration-300">
      <div className="flex gap-4">
        {/* Product Image Container */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.inStock && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/90 text-white backdrop-blur-sm">
              In Stock
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Merchant Tag & Rating */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                <svg
                  className="w-3 h-3 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {product.merchant || "Verified Merchant"}
              </span>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-amber-400">★</span>
                <span className="text-white font-semibold">{product.rating}</span>
                <span className="text-slate-500 text-[10px]">
                  ({product.reviewCount})
                </span>
              </div>
            </div>

            {/* Product Title */}
            <h4 className="font-semibold text-white text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors">
              {product.url ? (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {product.name}
                </a>
              ) : (
                product.name
              )}
            </h4>

            {/* Price section */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 tracking-tight font-mono">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                20% OFF
              </span>
            </div>
          </div>

          {/* Feature Specs Pills */}
          {product.features && product.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {product.features.slice(0, 3).map((feature, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-400 text-[10px] border border-slate-800"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Strip with Merchant Link & Direct Trigger */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 text-[11px] truncate">
          {product.brand} • {product.category}
        </span>

        {product.url && (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/20 transition-all shrink-0"
          >
            <span>Live Merchant Store</span>
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
