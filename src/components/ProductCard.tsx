"use client";

import React from "react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-blue-500 transition-colors">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">
            {product.url ? (
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 hover:underline"
              >
                {product.name}
              </a>
            ) : (
              product.name
            )}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold text-green-400">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-yellow-400 text-xs">
              ⭐ {product.rating}/5
            </span>
            <span className="text-gray-500 text-xs">
              ({product.reviewCount.toLocaleString()} reviews)
            </span>
          </div>

          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
            {product.description}
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {product.features.slice(0, 3).map((feature, i) => (
              <span
                key={i}
                className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stock indicator & Merchant Link */}
      <div className="mt-3 pt-2.5 border-t border-gray-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs ${
              product.inStock ? "text-green-400" : "text-red-400"
            }`}
          >
            {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
          </span>
          <span className="text-xs text-gray-500">
            {product.brand} • {product.category}
          </span>
        </div>

        {product.url && (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 transition-colors"
          >
            <span>View on {product.merchant || "Store"}</span>
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
