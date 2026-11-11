// ─── Product & Catalog Types ───

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  image: string;
  features: string[];
  inStock: boolean;
  url?: string;
  merchant?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Chat Types ───

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  products?: Product[];
  cart?: CartItem[];
  checkoutOrderId?: string;
  agentActions?: AgentAction[];
}

export interface AgentAction {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
  timestamp: Date;
}

// ─── PayPal Types ───

export interface PayPalOrder {
  id: string;
  status: string;
  links: { href: string; rel: string; method: string }[];
}

export interface PayPalCaptureResult {
  id: string;
  status: string;
  purchase_units: {
    payments: {
      captures: {
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }[];
    };
  }[];
  payer: {
    email_address: string;
    name: { given_name: string; surname: string };
  };
}

// ─── Transaction Types (for Dashboard) ───

export interface Transaction {
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

// ─── Agent Tool Declarations ───

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  name: string;
  result: unknown;
}
