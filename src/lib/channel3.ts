import { Channel3 } from "@channel3/sdk";
import { Product } from "./types";

const apiKey = process.env.CHANNEL3_API_KEY;

// Cache dynamically fetched Channel3 products so getProductById and checkout can look them up
const channel3Cache = new Map<string, Product>();

export async function searchChannel3(
  query: string,
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    category?: string;
  }
): Promise<Product[]> {
  if (!apiKey) {
    return [];
  }

  try {
    const client = new Channel3({ apiKey });

    const searchParams: Parameters<typeof client.products.search>[0] = {
      query,
      limit: 8,
      config: { mode: "agentic" },
    };

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      searchParams.filters = {
        price: {
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
        },
      };
    }

    const response = await client.products.search(searchParams);
    const data = response.data || [];

    const products: Product[] = data.map((item) => {
      const bestOffer = item.offers?.[0];
      const price = bestOffer?.price?.price ?? 49.99;
      const currency = bestOffer?.price?.currency ?? "USD";
      const image =
        item.images?.[0]?.cleaned_url ||
        item.images?.[0]?.url ||
        "https://placehold.co/400x400/1a1a2e/3b82f6?text=Product";
      const brand = item.brands?.[0]?.name || "Featured Brand";
      const category = item.category?.title || "Electronics";
      const rating = item.ratings?.value ? Number(item.ratings.value.toFixed(1)) : 4.5;
      const reviewCount = item.ratings?.count || 120;
      const features =
        item.key_features && item.key_features.length > 0
          ? item.key_features.slice(0, 5)
          : ["High quality", "Verified merchant", "Fast shipping"];

      const product: Product = {
        id: `c3-${item.id}`,
        name: item.title,
        description: item.description || item.title,
        price,
        currency,
        category,
        brand,
        rating,
        reviewCount,
        image,
        features,
        inStock: bestOffer?.availability !== "OutOfStock",
        url: bestOffer?.url,
        merchant: bestOffer?.domain || "Channel3 Partner",
      };

      // Store in cache for cart and checkout resolution
      channel3Cache.set(product.id, product);

      return product;
    });

    return products;
  } catch (error) {
    console.error("Channel3 search failed, falling back to local catalog:", error);
    return [];
  }
}

export function getCachedChannel3Product(id: string): Product | undefined {
  return channel3Cache.get(id);
}
