import {
  GoogleGenAI,
  FunctionDeclaration,
  Type,
  Content,
  Part,
} from "@google/genai";
import { searchProducts, getProductById, getCategories } from "./products";
import { createOrder } from "./paypal";
import { CartItem, Product, AgentAction } from "./types";

const ai = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY!,
});

const MODELS = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.5-flash"];

async function generateWithFallback(
  contents: Content[],
  config: {
    systemInstruction?: string;
    tools?: { functionDeclarations: FunctionDeclaration[] }[];
    temperature?: number;
    maxOutputTokens?: number;
  }
) {
  let lastError: unknown;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents,
          config,
        });
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isUnavailable = msg.includes("503") || msg.includes("high demand") || msg.includes("UNAVAILABLE");
        if (isUnavailable) {
          console.warn(`Model ${model} attempt ${attempt + 1} unavailable (503), retrying/falling back...`);
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
  }
  throw lastError;
}

// ─── Function Declarations for Agent Tools ───

const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "search_products",
    description:
      "Search the product catalog for items matching a query. Use this whenever the user asks to find, look for, or browse products. You can filter by category, price range, minimum rating, or brand.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Search query (e.g., 'wireless headphones', 'laptop stand', 'charger')",
        },
        category: {
          type: Type.STRING,
          description: "Filter by category: Electronics, Home Office, Gadgets, Travel",
        },
        minPrice: {
          type: Type.NUMBER,
          description: "Minimum price in USD",
        },
        maxPrice: {
          type: Type.NUMBER,
          description: "Maximum price in USD",
        },
        minRating: {
          type: Type.NUMBER,
          description: "Minimum rating (1-5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_product_details",
    description:
      "Get detailed information about a specific product by its ID. Use this when you need more info about a product found in search results.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: "The product ID (e.g., 'elec-001')",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "add_to_cart",
    description:
      "Add a product to the user's shopping cart. Use this when the user wants to buy a product or add it to their cart.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: "The product ID to add",
        },
        quantity: {
          type: Type.NUMBER,
          description: "Quantity to add (default 1)",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "remove_from_cart",
    description:
      "Remove a product from the user's shopping cart.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        productId: {
          type: Type.STRING,
          description: "The product ID to remove",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "view_cart",
    description:
      "View the current contents of the shopping cart with all items, quantities, and total. Use this when the user asks what's in their cart.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: "create_checkout",
    description:
      "Create a PayPal checkout order for all items in the cart. Use this ONLY when the user explicitly confirms they want to proceed with purchase/checkout/payment. This generates a PayPal order that the user can then approve.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        confirmMessage: {
          type: Type.STRING,
          description:
            "A brief confirmation message summarizing what will be charged",
        },
      },
      required: ["confirmMessage"],
    },
  },
  {
    name: "get_categories",
    description:
      "Get the list of available product categories. Use this when the user asks what types of products are available.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

// ─── System Prompt ───

const SYSTEM_PROMPT = `You are PayAgent, an intelligent AI shopping assistant. You help users discover products, compare options, and make secure purchases through PayPal.

## Your Personality
- Friendly, helpful, and knowledgeable about the products in the catalog
- You give honest recommendations based on user needs, not just the most expensive option
- You proactively suggest complementary products when appropriate
- You always explain your reasoning when making recommendations

## Your Capabilities
1. **Search Products**: Find items by name, category, features, price range, or ratings
2. **Compare Products**: Help users compare similar items side by side
3. **Manage Cart**: Add/remove items from the shopping cart
4. **Checkout**: Create secure PayPal orders when the user is ready to buy

## Important Rules
- ALWAYS search for products when a user asks about buying something - don't make up products
- When showing search results, highlight key features, price, and rating for each item
- Before checkout, ALWAYS confirm the cart contents and total with the user
- When the user wants to checkout, use the create_checkout tool
- Format product information clearly with bullet points
- If no products match a search, suggest alternative search terms
- Always mention prices in USD
- Be concise but informative

## Response Format
When presenting products, use this format:
**[Product Name]** - $[Price]
⭐ [Rating]/5 ([Review Count] reviews)
[Brief description]
Key features: [top 3 features]

When presenting the cart, clearly show each item, quantity, unit price, and total.`;

// ─── In-memory cart (per-session) ───

let sessionCart: CartItem[] = [];

export function getCart(): CartItem[] {
  return sessionCart;
}

export function clearCart(): void {
  sessionCart = [];
}

// ─── Tool Execution ───

async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ result: unknown; products?: Product[]; cart?: CartItem[]; checkoutOrderId?: string }> {
  switch (name) {
    case "search_products": {
      const results = searchProducts(args.query as string, {
        category: args.category as string | undefined,
        minPrice: args.minPrice as number | undefined,
        maxPrice: args.maxPrice as number | undefined,
        minRating: args.minRating as number | undefined,
      });
      return {
        result: {
          items: results.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            reviewCount: p.reviewCount,
            category: p.category,
            brand: p.brand,
            description: p.description.substring(0, 100) + "...",
            features: p.features.slice(0, 3),
            inStock: p.inStock,
          })),
          count: results.length,
        },
        products: results,
      };
    }

    case "get_product_details": {
      const product = getProductById(args.productId as string);
      if (!product) {
        return { result: { error: "Product not found" } };
      }
      return { result: product, products: [product] };
    }

    case "add_to_cart": {
      const product = getProductById(args.productId as string);
      if (!product) {
        return { result: { error: "Product not found" } };
      }
      const quantity = (args.quantity as number) || 1;
      const existingItem = sessionCart.find(
        (item) => item.product.id === product.id
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        sessionCart.push({ product, quantity });
      }
      const total = sessionCart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      return {
        result: {
          success: true,
          message: `Added ${quantity}x ${product.name} to cart`,
          cartTotal: total.toFixed(2),
          cartItemCount: sessionCart.length,
        },
        cart: [...sessionCart],
      };
    }

    case "remove_from_cart": {
      const idx = sessionCart.findIndex(
        (item) => item.product.id === (args.productId as string)
      );
      if (idx === -1) {
        return { result: { error: "Item not in cart" } };
      }
      const removed = sessionCart.splice(idx, 1)[0];
      return {
        result: {
          success: true,
          message: `Removed ${removed.product.name} from cart`,
        },
        cart: [...sessionCart],
      };
    }

    case "view_cart": {
      const total = sessionCart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      return {
        result: {
          items: sessionCart.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: (item.product.price * item.quantity).toFixed(2),
          })),
          totalItems: sessionCart.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: total.toFixed(2),
        },
        cart: [...sessionCart],
      };
    }

    case "create_checkout": {
      if (sessionCart.length === 0) {
        return { result: { error: "Cart is empty. Add items before checkout." } };
      }
      try {
        const order = await createOrder(
          sessionCart.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            description: item.product.description.substring(0, 100),
          }))
        );
        return {
          result: {
            success: true,
            orderId: order.id,
            status: order.status,
            message: args.confirmMessage,
            totalAmount: sessionCart
              .reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
              )
              .toFixed(2),
          },
          checkoutOrderId: order.id,
          cart: [...sessionCart],
        };
      } catch (error) {
        return {
          result: {
            error: `Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        };
      }
    }

    case "get_categories": {
      return { result: { categories: getCategories() } };
    }

    default:
      return { result: { error: `Unknown tool: ${name}` } };
  }
}

// ─── Main Chat Function ───

export interface ChatResponse {
  text: string;
  products?: Product[];
  cart?: CartItem[];
  checkoutOrderId?: string;
  agentActions: AgentAction[];
}

export async function chat(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<ChatResponse> {
  const agentActions: AgentAction[] = [];
  let collectedProducts: Product[] | undefined;
  let collectedCart: CartItem[] | undefined;
  let checkoutOrderId: string | undefined;

  // Build conversation history for Gemini
  const contents: Content[] = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }] as Part[],
  }));

  // Initial call with tools
  let response = await generateWithFallback(contents, {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: toolDeclarations }],
    temperature: 0.7,
    maxOutputTokens: 2048,
  });

  // Handle tool calls in a loop (agent may call multiple tools)
  let maxIterations = 5;
  while (response.functionCalls && response.functionCalls.length > 0 && maxIterations > 0) {
    maxIterations--;

    const functionCalls = response.functionCalls;
    const functionResponses: Part[] = [];

    for (const fc of functionCalls) {
      const toolResult = await executeTool(fc.name!, fc.args as Record<string, unknown>);

      agentActions.push({
        tool: fc.name!,
        args: fc.args as Record<string, unknown>,
        result: toolResult.result,
        timestamp: new Date(),
      });

      // Collect metadata
      if (toolResult.products) collectedProducts = toolResult.products;
      if (toolResult.cart) collectedCart = toolResult.cart;
      if (toolResult.checkoutOrderId) checkoutOrderId = toolResult.checkoutOrderId;

      functionResponses.push({
        functionResponse: {
          name: fc.name!,
          response:
            typeof toolResult.result === "object" && toolResult.result !== null && !Array.isArray(toolResult.result)
              ? (toolResult.result as Record<string, unknown>)
              : { data: toolResult.result },
        },
      });
    }

    // Send function results back to model
    // Add the model's exact candidate content (preserving thought_signature)
    if (response.candidates?.[0]?.content) {
      contents.push(response.candidates[0].content);
    } else {
      contents.push({
        role: "model",
        parts: functionCalls.map((fc) => ({
          functionCall: {
            name: fc.name!,
            args: fc.args as Record<string, unknown>,
          },
        })),
      });
    }

    contents.push({
      role: "user",
      parts: functionResponses,
    });

    response = await generateWithFallback(contents, {
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: toolDeclarations }],
      temperature: 0.7,
      maxOutputTokens: 2048,
    });
  }

  const text = response.text || "I'm sorry, I couldn't generate a response. Please try again.";

  return {
    text,
    products: collectedProducts,
    cart: collectedCart,
    checkoutOrderId,
    agentActions,
  };
}
