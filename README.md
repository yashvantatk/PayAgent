# 🛒 PayAgent — AI-Powered Shopping Assistant with PayPal Checkout

> **Built for the [PayPal AI Hackathon 2026](https://paypalaihackathon.devpost.com/)**

PayAgent is an intelligent conversational shopping assistant that lets users discover products through natural language, get AI-powered recommendations, and checkout securely via PayPal — all in one seamless chat experience.

![PayAgent Demo](https://placehold.co/1200x600/0f172a/3b82f6?text=PayAgent+%E2%80%94+AI+Shopping+Assistant)

## ✨ Features

- **🤖 Conversational AI Agent** — Natural language product discovery powered by Google Gemini with function calling
- **🛍️ Channel3 Universal Catalog** — Live real-world multi-merchant product discovery using Channel3's agentic search API
- **🛒 Intelligent Cart Management** — AI adds, removes, and summarizes cart contents with reasoning
- **💳 Secure PayPal Checkout** — One-click PayPal payment via Orders v2 API (Sandbox)
- **📊 AG Grid Dashboard** — Transaction history, agent decision audit trail, and analytics
- **🧠 Agent Transparency** — See exactly what tools the AI called and why (expandable action log)

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js)                  │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Chat UI   │  │  AG Grid     │  │ PayPal JS    │  │
│  │  (React)   │  │  Dashboard   │  │ SDK Buttons  │  │
│  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘  │
└────────┼────────────────┼─────────────────┼──────────┘
         │                │                 │
┌────────▼────────────────▼─────────────────▼──────────┐
│                  BACKEND (API Routes)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Gemini Agent │  │ PayPal       │  │ Product    │  │
│  │ (Tool-Use /  │  │ Orders v2   │  │ Catalog    │  │
│  │  Function    │  │ API Client  │  │ Service    │  │
│  │  Calling)    │  │              │  │            │  │
│  └──────────────┘  └──────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- [PayPal Developer Sandbox account](https://developer.paypal.com/)
- [Google AI Studio API key](https://aistudio.google.com/apikey)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/payagent.git
cd payagent

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see below)

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# PayPal Sandbox Credentials (from developer.paypal.com)
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com

# Gemini API Key (from aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key

# Public PayPal Client ID (same as above, exposed to frontend)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

## 🎯 How It Works

### The AI Agent Flow

1. **User sends a message** → "Find me wireless headphones under $80"
2. **Gemini processes intent** → Determines it needs to search products
3. **Function calling** → AI calls `search_products(query: "wireless headphones", maxPrice: 80)`
4. **Results returned** → Products displayed as rich cards in the chat
5. **User decides** → "Add the SoundCore headphones to my cart"
6. **AI manages cart** → Calls `add_to_cart(productId: "elec-001")`
7. **Checkout** → "I'm ready to buy" → AI calls `create_checkout()` → PayPal button appears
8. **Payment** → User clicks PayPal → Sandbox payment captured → ✅ Done!

### Agent Tools

| Tool | Description |
|---|---|
| `search_products` | Search catalog by query, category, price, rating |
| `get_product_details` | Get full details for a specific product |
| `add_to_cart` | Add product to cart with quantity |
| `remove_from_cart` | Remove product from cart |
| `view_cart` | Show current cart contents and total |
| `create_checkout` | Create PayPal order for cart items |
| `get_categories` | List available product categories |

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | Full-stack React framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Google Gemini** | AI agent with function calling |
| **PayPal Orders v2 API** | Payment processing |
| **PayPal JS SDK** | Frontend checkout buttons |
| **AG Grid** | Transaction dashboard |

## 📊 Dashboard

The AG Grid-powered dashboard provides:
- **Transaction log** with sortable/filterable columns
- **Agent decision trail** showing exactly what tools the AI called
- **Stats cards** — total revenue, average order value, items sold
- **Full audit transparency** — map every purchase back to the user's original query

## 🏆 Hackathon Categories

This project targets:
- 🥇 **Grand Prize** — Full agentic commerce flow
- 🤖 **Best Use of Agentic Commerce** — AI agent that autonomously shops and checks out
- 🛍️ **Best Use of Channel3** ($1,500) — Real-time clean product data integration with agentic mode
- 🎨 **Best Use of PayPal + AI** — Deep integration of both platforms
- 📊 **Best Use of AG Grid** — Transaction dashboard with audit trail

## 📝 License

MIT — see [LICENSE](./LICENSE)

---

**Built with ❤️ for the PayPal AI Hackathon 2026**
