import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForToken, getMe, getShopByOwner } from "@/lib/etsy";
import { saveTokens } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const verifier = cookieStore.get("etsy_pkce_verifier")?.value;
  const savedState = cookieStore.get("etsy_oauth_state")?.value;

  if (!code || !verifier || state !== savedState) {
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }

  const tokens = await exchangeCodeForToken(code, verifier);

  let user_id: number | undefined;
  let shop_id: number | undefined;
  try {
    const me = await getMe(tokens.access_token);
    user_id = me.user_id;
    const shop = await getShopByOwner(me.user_id, tokens.access_token);
    shop_id = shop.shop_id;
  } catch {}

  await saveTokens({ ...tokens, user_id, shop_id });

  cookieStore.delete("etsy_pkce_verifier");
  cookieStore.delete("etsy_oauth_state");

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
