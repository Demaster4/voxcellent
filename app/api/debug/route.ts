import { NextResponse } from "next/server";
import { getStoredTokens } from "@/lib/db";
import { getMe, getShopByOwner } from "@/lib/etsy";

export async function GET() {
  const tokens = await getStoredTokens();
  if (!tokens) return NextResponse.json({ error: "no tokens in DB" });

  let me: any = null;
  let meError: string | null = null;
  try {
    me = await getMe(tokens.access_token);
  } catch (e: any) {
    meError = e.message;
  }

  let shop: any = null;
  let shopError: string | null = null;
  if (me?.user_id) {
    try {
      shop = await getShopByOwner(me.user_id, tokens.access_token);
    } catch (e: any) {
      shopError = e.message;
    }
  }

  return NextResponse.json({
    token_expires_at: tokens.expires_at,
    shop_id_in_db: tokens.shop_id,
    user_id_in_db: tokens.user_id,
    me,
    meError,
    shop,
    shopError,
  });
}
