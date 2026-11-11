import { NextResponse } from "next/server";
import { searchProductsAsync, getCategories, getBrands } from "@/lib/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;
  const minPrice = searchParams.get("minPrice")
    ? parseFloat(searchParams.get("minPrice")!)
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? parseFloat(searchParams.get("maxPrice")!)
    : undefined;
  const minRating = searchParams.get("minRating")
    ? parseFloat(searchParams.get("minRating")!)
    : undefined;

  const products = await searchProductsAsync(query, {
    category,
    minPrice,
    maxPrice,
    minRating,
  });

  return NextResponse.json({
    products,
    categories: getCategories(),
    brands: getBrands(),
    totalResults: products.length,
  });
}
