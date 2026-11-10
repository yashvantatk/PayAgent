// PayPal REST API client for sandbox
// Uses Orders v2 API: https://developer.paypal.com/docs/api/orders/v2/

const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

interface PayPalTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/** Get an OAuth2 access token from PayPal */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal auth failed: ${response.status} - ${error}`);
  }

  const data: PayPalTokenResponse = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

/** Create a PayPal order with the given cart items */
export async function createOrder(
  items: { name: string; quantity: number; unitPrice: number; description?: string }[]
): Promise<{ id: string; status: string }> {
  const token = await getAccessToken();

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const orderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: totalAmount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: totalAmount.toFixed(2),
            },
          },
        },
        items: items.map((item) => ({
          name: item.name.substring(0, 127),
          description: item.description?.substring(0, 127) || "",
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: "USD",
            value: item.unitPrice.toFixed(2),
          },
          category: "PHYSICAL_GOODS",
        })),
      },
    ],
    application_context: {
      brand_name: "PayAgent - AI Shopping Assistant",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: "https://payagent.example.com/success",
      cancel_url: "https://payagent.example.com/cancel",
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal create order failed: ${response.status} - ${error}`);
  }

  const order = await response.json();
  return { id: order.id, status: order.status };
}

/** Capture an approved PayPal order */
export async function captureOrder(orderId: string): Promise<{
  id: string;
  status: string;
  amount: string;
  currency: string;
  payerEmail?: string;
  payerName?: string;
}> {
  const token = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal capture failed: ${response.status} - ${error}`);
  }

  const capture = await response.json();
  const captureDetails = capture.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    id: capture.id,
    status: capture.status,
    amount: captureDetails?.amount?.value || "0.00",
    currency: captureDetails?.amount?.currency_code || "USD",
    payerEmail: capture.payer?.email_address,
    payerName: capture.payer?.name
      ? `${capture.payer.name.given_name} ${capture.payer.name.surname}`
      : undefined,
  };
}

/** Get order details */
export async function getOrderDetails(orderId: string) {
  const token = await getAccessToken();

  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayPal get order failed: ${response.status} - ${error}`);
  }

  return response.json();
}
