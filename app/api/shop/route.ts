import { NextResponse } from "next/server";
import { getValidAccessToken, getStoredTokens, getQueueStats } from "@/lib/db";
import { getShop } from "@/lib/etsy";

export async function GET() {
  const token = await getValidAccessToken();
  if (!token) return NextResponse.json({ connected: false });

  const stored = await getStoredTokens();
  if (!stored?.shop_id) return NextResponse.json({ connected: true, shop: null });

  const [shop, queueStats] = await Promise.all([
    getShop(stored.shop_id, token),
    getQueueStats(),
  ]);

  return NextResponse.json({ connected: true, shop, queueStats });
}
