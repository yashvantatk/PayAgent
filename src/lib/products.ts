import { Product } from "./types";

export const PRODUCT_CATALOG: Product[] = [
  // ─── Electronics ───
  {
    id: "elec-001",
    name: "SoundCore Pro X Wireless Headphones",
    description:
      "Premium noise-cancelling wireless headphones with 40-hour battery life, Hi-Res Audio, and adaptive EQ. Perfect for commuting, work calls, and immersive music listening.",
    price: 79.99,
    currency: "USD",
    category: "Electronics",
    brand: "SoundCore",
    rating: 4.7,
    reviewCount: 2841,
    image: "https://placehold.co/400x400/1a1a2e/e94560?text=Headphones",
    features: [
      "Active Noise Cancellation",
      "40-hour battery",
      "Hi-Res Audio",
      "Bluetooth 5.3",
      "Foldable design",
    ],
    inStock: true,
  },
  {
    id: "elec-002",
    name: "TurboCharge 65W GaN USB-C Charger",
    description:
      "Ultra-compact 65W GaN charger with 3 ports (2x USB-C, 1x USB-A). Charges laptops, tablets, and phones simultaneously. Foldable prongs for travel.",
    price: 34.99,
    currency: "USD",
    category: "Electronics",
    brand: "TurboCharge",
    rating: 4.8,
    reviewCount: 5672,
    image: "https://placehold.co/400x400/0f3460/e94560?text=Charger",
    features: [
      "65W GaN technology",
      "3 ports",
      "Universal compatibility",
      "Foldable prongs",
      "Travel-friendly",
    ],
    inStock: true,
  },
  {
    id: "elec-003",
    name: "PixelView 4K Portable Monitor 15.6\"",
    description:
      "Ultra-slim 15.6-inch 4K portable monitor with USB-C and HDMI connectivity. Built-in speakers, HDR support, and a magnetic stand cover.",
    price: 249.99,
    currency: "USD",
    category: "Electronics",
    brand: "PixelView",
    rating: 4.5,
    reviewCount: 1203,
    image: "https://placehold.co/400x400/16213e/e94560?text=Monitor",
    features: [
      "4K UHD display",
      "USB-C & HDMI",
      "Built-in speakers",
      "HDR support",
      "Weighs 1.7 lbs",
    ],
    inStock: true,
  },
  {
    id: "elec-004",
    name: "MechType Pro Wireless Mechanical Keyboard",
    description:
      "Compact 75% wireless mechanical keyboard with hot-swappable switches, RGB backlighting, and triple-mode connectivity (Bluetooth, 2.4G, USB-C).",
    price: 89.99,
    currency: "USD",
    category: "Electronics",
    brand: "MechType",
    rating: 4.6,
    reviewCount: 3456,
    image: "https://placehold.co/400x400/1a1a2e/53d769?text=Keyboard",
    features: [
      "75% compact layout",
      "Hot-swappable switches",
      "RGB backlighting",
      "Triple-mode wireless",
      "4000mAh battery",
    ],
    inStock: true,
  },
  {
    id: "elec-005",
    name: "SwiftPods ANC Earbuds",
    description:
      "True wireless earbuds with hybrid ANC, spatial audio, and 32-hour total battery life. IPX5 water resistant with wireless charging case.",
    price: 59.99,
    currency: "USD",
    category: "Electronics",
    brand: "SwiftPods",
    rating: 4.4,
    reviewCount: 7821,
    image: "https://placehold.co/400x400/0f3460/53d769?text=Earbuds",
    features: [
      "Hybrid ANC",
      "Spatial Audio",
      "32-hour battery",
      "IPX5 waterproof",
      "Wireless charging",
    ],
    inStock: true,
  },

  // ─── Home Office ───
  {
    id: "office-001",
    name: "ErgoRise Adjustable Laptop Stand",
    description:
      "Aluminum laptop stand with 6 adjustable height levels, ventilated design for cooling, and anti-slip silicone pads. Supports laptops up to 17 inches.",
    price: 39.99,
    currency: "USD",
    category: "Home Office",
    brand: "ErgoRise",
    rating: 4.8,
    reviewCount: 4521,
    image: "https://placehold.co/400x400/16213e/53d769?text=Stand",
    features: [
      "6 height adjustments",
      "Aluminum construction",
      "Ventilated cooling",
      "Supports up to 17\"",
      "Foldable & portable",
    ],
    inStock: true,
  },
  {
    id: "office-002",
    name: "LumiDesk LED Desk Lamp with Wireless Charger",
    description:
      "Smart LED desk lamp with 5 color temperatures, 10 brightness levels, built-in wireless charger, and USB charging port. Touch control with memory function.",
    price: 44.99,
    currency: "USD",
    category: "Home Office",
    brand: "LumiDesk",
    rating: 4.6,
    reviewCount: 2190,
    image: "https://placehold.co/400x400/1a1a2e/f0a500?text=Lamp",
    features: [
      "5 color temperatures",
      "10 brightness levels",
      "Built-in wireless charger",
      "USB port",
      "Eye-care technology",
    ],
    inStock: true,
  },
  {
    id: "office-003",
    name: "ComfortGel Ergonomic Mouse",
    description:
      "Vertical ergonomic wireless mouse with adjustable DPI (800-4000), silent click buttons, and rechargeable battery lasting 3 months. Reduces wrist strain.",
    price: 29.99,
    currency: "USD",
    category: "Home Office",
    brand: "ComfortGel",
    rating: 4.5,
    reviewCount: 3876,
    image: "https://placehold.co/400x400/0f3460/f0a500?text=Mouse",
    features: [
      "Vertical ergonomic design",
      "Adjustable DPI",
      "Silent clicks",
      "3-month battery",
      "USB-C rechargeable",
    ],
    inStock: true,
  },
  {
    id: "office-004",
    name: "DeskOrg Pro Cable Management Kit",
    description:
      "Complete desk cable management solution with under-desk cable tray, magnetic cable clips, cable sleeves, and velcro ties. Keeps your workspace clean.",
    price: 24.99,
    currency: "USD",
    category: "Home Office",
    brand: "DeskOrg",
    rating: 4.3,
    reviewCount: 1567,
    image: "https://placehold.co/400x400/16213e/f0a500?text=CableKit",
    features: [
      "Under-desk cable tray",
      "Magnetic clips",
      "Cable sleeves",
      "Velcro ties included",
      "Universal fit",
    ],
    inStock: true,
  },

  // ─── Gadgets & Accessories ───
  {
    id: "gadget-001",
    name: "PowerVault 20000mAh Power Bank",
    description:
      "High-capacity 20000mAh power bank with 100W PD output, triple ports, and digital display. Charges a MacBook Pro to 50% in 30 minutes.",
    price: 49.99,
    currency: "USD",
    category: "Gadgets",
    brand: "PowerVault",
    rating: 4.7,
    reviewCount: 6234,
    image: "https://placehold.co/400x400/1a1a2e/e94560?text=PowerBank",
    features: [
      "20000mAh capacity",
      "100W PD output",
      "Triple ports",
      "Digital display",
      "Airline approved",
    ],
    inStock: true,
  },
  {
    id: "gadget-002",
    name: "SmartTag Ultra Bluetooth Tracker (4-Pack)",
    description:
      "Precision Bluetooth item trackers with UWB technology for exact location finding. Water-resistant, 2-year battery life, works with iOS and Android.",
    price: 79.99,
    currency: "USD",
    category: "Gadgets",
    brand: "SmartTag",
    rating: 4.4,
    reviewCount: 3456,
    image: "https://placehold.co/400x400/0f3460/e94560?text=Tracker",
    features: [
      "UWB precision finding",
      "Water-resistant",
      "2-year battery",
      "Cross-platform",
      "4-pack value",
    ],
    inStock: true,
  },
  {
    id: "gadget-003",
    name: "FlexMount Magnetic Phone Mount",
    description:
      "MagSafe-compatible magnetic car and desk phone mount with 360° rotation, one-hand operation, and strong N52 magnets. Includes car vent and desk base.",
    price: 19.99,
    currency: "USD",
    category: "Gadgets",
    brand: "FlexMount",
    rating: 4.6,
    reviewCount: 8901,
    image: "https://placehold.co/400x400/16213e/53d769?text=Mount",
    features: [
      "MagSafe compatible",
      "360° rotation",
      "N52 strong magnets",
      "Dual mount (car+desk)",
      "One-hand operation",
    ],
    inStock: true,
  },
  {
    id: "gadget-004",
    name: "AquaPure Smart Water Bottle",
    description:
      "Insulated smart water bottle with LED temperature display, hydration reminders, and UV-C self-cleaning. Keeps drinks cold 24h or hot 12h.",
    price: 34.99,
    currency: "USD",
    category: "Gadgets",
    brand: "AquaPure",
    rating: 4.3,
    reviewCount: 2134,
    image: "https://placehold.co/400x400/1a1a2e/f0a500?text=Bottle",
    features: [
      "LED temperature display",
      "UV-C self-cleaning",
      "Hydration reminders",
      "24h cold / 12h hot",
      "BPA-free stainless steel",
    ],
    inStock: true,
  },

  // ─── Travel ───
  {
    id: "travel-001",
    name: "PackLite Compression Packing Cubes (Set of 5)",
    description:
      "Premium compression packing cubes in 5 sizes with double-zip compression technology. Save up to 60% suitcase space. Water-resistant ripstop nylon.",
    price: 29.99,
    currency: "USD",
    category: "Travel",
    brand: "PackLite",
    rating: 4.8,
    reviewCount: 11234,
    image: "https://placehold.co/400x400/0f3460/53d769?text=PackCubes",
    features: [
      "5-piece set",
      "Double-zip compression",
      "60% space saving",
      "Water-resistant",
      "Ripstop nylon",
    ],
    inStock: true,
  },
  {
    id: "travel-002",
    name: "NeckCloud Memory Foam Travel Pillow",
    description:
      "Ergonomic memory foam travel pillow with 360° neck support, magnetic clasp, and washable bamboo cover. Compresses to half size for packing.",
    price: 27.99,
    currency: "USD",
    category: "Travel",
    brand: "NeckCloud",
    rating: 4.5,
    reviewCount: 5678,
    image: "https://placehold.co/400x400/16213e/e94560?text=Pillow",
    features: [
      "Memory foam",
      "360° support",
      "Magnetic clasp",
      "Washable bamboo cover",
      "Compressible",
    ],
    inStock: true,
  },
];

// ─── Search & Filter Functions ───

export function searchProducts(query: string, filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string;
}): Product[] {
  let results = PRODUCT_CATALOG;

  // Text search
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  // Apply filters
  if (filters) {
    if (filters.category) {
      results = results.filter(
        (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters.minRating !== undefined) {
      results = results.filter((p) => p.rating >= filters.minRating!);
    }
    if (filters.brand) {
      results = results.filter(
        (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase()
      );
    }
  }

  return results;
}

export function getProductById(id: string): Product | undefined {
  return PRODUCT_CATALOG.find((p) => p.id === id);
}

export function getCategories(): string[] {
  return [...new Set(PRODUCT_CATALOG.map((p) => p.category))];
}

export function getBrands(): string[] {
  return [...new Set(PRODUCT_CATALOG.map((p) => p.brand))];
}
