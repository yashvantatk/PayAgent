# 🛒 PayAgent — Autonomous AI Shopping & Commerce Engine

PayAgent is an enterprise-ready conversational shopping assistant and autonomous commerce engine. It allows users to discover products through natural language, compare options across multi-merchant catalogs, and execute secure one-click checkouts via PayPal — seamlessly orchestrated within an agentic workflow.

---

## ✨ Key Features

- **🤖 Conversational AI Agent** — Natural language discovery and tool-calling powered by Google Gemini (Gemini 3.1 Flash / Modern SDK) with dynamic function execution.
- **🛍️ Universal Multi-Merchant Catalog** — Real-time clean product aggregation and agentic search powered by **Channel3**.
- **💳 End-to-End PayPal Checkout** — Direct order creation, validation, and payment capture using PayPal Orders v2 API and PayPal Smart Payment Buttons.
- **⚡ Resilient Workflow Orchestration** — Distributed task execution, durable state tracking, and background processing powered by **Render Workflows**.
- **📊 Real-Time Analytics & Audit Trail** — High-performance transaction telemetry, latency tracking, and decision logs powered by **AG Grid**.
- **🌗 Modern Responsive UI** — Built on Next.js 16, React 19, and Tailwind CSS v4 with full dark/light mode persistence and zero-flicker client hydration.
- **🛡️ Full Agent Transparency** — Interactive telemetry panel displaying tool parameters, live execution status, and agent reasoning traces.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION TIER                             │
│  ┌─────────────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │ Conversational Chat UI  │  │ AG Grid Audit  │  │ PayPal Checkout │  │
│  │ (Next.js 16 / React 19) │  │  & Telemetry   │  │  Smart Buttons  │  │
│  └────────────┬────────────┘  └───────┬────────┘  └────────┬────────┘  │
└───────────────┼───────────────────────┼────────────────────┼───────────┘
                │                       │                    │
┌───────────────▼───────────────────────▼────────────────────▼───────────┐
│                          APPLICATION & AGENT ENGINE                    │
│  ┌─────────────────────────┐  ┌────────────────┐  ┌─────────────────┐  │
│  │  Gemini 3.1 Flash Agent │  │ PayPal Client  │  │ Channel3 Search │  │
│  │    Function Calling     │  │ (Orders v2 API)│  │ Catalog Service │  │
│  └────────────┬────────────┘  └────────────────┘  └─────────────────┘  │
└───────────────┼────────────────────────────────────────────────────────┘
                │
┌───────────────▼────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE & ORCHESTRATION                     │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Render Cloud Web Service + Render Workflows Background Execution │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 | React 19, App Router, Turbopack |
| **Styling** | Tailwind CSS v4 | High-performance CSS engine with theme variables |
| **Agent Intelligence** | Google Gemini API | `@google/genai` (Gemini 3.1 Flash) |
| **Catalog & Discovery** | Channel3 API | Live multi-merchant agentic commerce data |
| **Payment Gateway** | PayPal Orders v2 | REST API & `@paypal/react-paypal-js` SDK |
| **Data Grid & Telemetry** | AG Grid Community | v36 high-performance table & filtering |
| **Cloud & Workflows** | Render | Managed Web Service & `@renderinc/sdk` Workflows |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- [PayPal Developer Account](https://developer.paypal.com/) (Sandbox or Live)
- [Google AI Studio API Key](https://aistudio.google.com/apikey)
- [Channel3 API Key](https://www.channel3.ai/) *(optional; graceful mock fallback included)*

### Local Installation

```bash
# 1. Clone the repository
git clone https://github.com/yashvantatk/PayAgent.git
cd PayAgent

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
```

### Environment Configuration

Configure your `.env.local` file with the appropriate keys:

```env
# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_MODE=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Channel3 Catalog API Key (Optional)
CHANNEL3_API_KEY=your_channel3_api_key
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 Agent Tools & Capabilities

The conversational agent operates via structured function calling with autonomous tool selection:

| Tool Name | Parameters | Description |
|---|---|---|
| `search_products` | `query`, `category`, `minPrice`, `maxPrice` | Queries Channel3 and the product catalog |
| `get_product_details` | `productId` | Retrieves full product specifications and pricing |
| `add_to_cart` | `productId`, `quantity` | Adds items to the session cart |
| `remove_from_cart` | `productId` | Removes items from the session cart |
| `view_cart` | _none_ | Summarizes current cart contents and total |
| `create_checkout` | _none_ | Generates an active PayPal order token |
| `get_categories` | _none_ | Lists available product taxonomy |

---

## 📊 Analytics & Telemetry Dashboard

PayAgent includes an interactive administrative dashboard accessible at `/dashboard`:
- **Real-Time Transaction Stream** — Instant tracking of order IDs, transaction statuses, and PayPal capture details.
- **Audit Logging** — Transparent recording of every agent tool invocation, input arguments, and response payloads.
- **Performance Metrics** — Average order values, conversion volume, and tool execution latency.

---

## 🌐 Deployment

PayAgent is configured for zero-downtime deployment on **Render**:
- Blueprint specification provided via [`render.yaml`](./render.yaml).
- Production build: `npm install --include=dev && npm run build`
- Start command: `npm start`

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
