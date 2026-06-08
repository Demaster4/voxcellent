import { NextResponse } from "next/server";
import { getValidAccessToken, getStoredTokens } from "@/lib/db";
import { getListings } from "@/lib/etsy";

export async function GET() {
  const token = await getValidAccessToken();
  if (!token) return NextResponse.json({ error: "not_connected" }, { status: 401 });

  const stored = await getStoredTokens();
  if (!stored?.shop_id) return NextResponse.json({ error: "no_shop" }, { status: 400 });

  const data = await getListings(stored.shop_id, token);
  return NextResponse.json(data);
}
