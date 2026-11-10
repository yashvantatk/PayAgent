import { NextResponse } from "next/server";
import { captureOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const capture = await captureOrder(orderId);

    return NextResponse.json(capture);
  } catch (error) {
    console.error("Capture order error:", error);
    return NextResponse.json(
      {
        error: "Failed to capture PayPal order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
