import { NextResponse } from "next/server";
import { chat, clearCart } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, resetCart } = body;

    if (resetCart) {
      clearCart();
      return NextResponse.json({ success: true, message: "Cart cleared" });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const response = await chat(messages);

    return NextResponse.json({
      text: response.text,
      products: response.products || [],
      cart: response.cart || [],
      checkoutOrderId: response.checkoutOrderId || null,
      agentActions: response.agentActions || [],
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
