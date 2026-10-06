import { Agent } from "veyra";

import { withVeyraX402 } from "../../../lib/veyra-x402-seller";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const agent = new Agent({
  apiKey: process.env.VEYRA_API_KEY ?? "",
  baseUrl: process.env.VEYRA_BASE_URL ?? "https://veyra-agent.fly.dev",
});

export const GET = withVeyraX402(
  {
    network: process.env.VEYRA_X402_NETWORK ?? "stellar:testnet",
    priceUsdc: process.env.VEYRA_X402_PRICE_USDC ?? "0.02",
    payTo: process.env.VEYRA_X402_PAY_TO ?? "",
    resource: "/api/premium/signals",
    description: "Veyra premium market signals",
  },
  async () => {
    const { signals } = await agent.getRecentSignals(5);

    return Response.json({
      ok: true,
      count: signals.length,
      signals,
    });
  },
);
