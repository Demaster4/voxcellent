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

  // The access_token has the user_id as a numeric prefix: "12345678.tokenstring"
  // Extract it directly — no extra API call needed.
  let user_id: number | undefined;
  const tokenPrefix = tokens.access_token?.split(".")[0];
  if (tokenPrefix && /^\d+$/.test(tokenPrefix)) {
    user_id = parseInt(tokenPrefix, 10);
    console.log("[etsy-callback] user_id from token:", user_id);
  }

  let shop_id: number | undefined;
  try {
    if (!user_id) {
      // Fallback: call getMe if we couldn't parse user_id from token
      const me = await getMe(tokens.access_token);
      user_id = me.user_id;
      console.log("[etsy-callback] user_id from getMe:", user_id);
    }
    const shop = await getShopByOwner(user_id!, tokens.access_token);
    shop_id = shop.shop_id;
    console.log("[etsy-callback] shop_id:", shop_id);
  } catch (e: any) {
    console.error("[etsy-callback] error fetching user/shop:", e.message);
  }

  await saveTokens({ ...tokens, user_id, shop_id });

  cookieStore.delete("etsy_pkce_verifier");
  cookieStore.delete("etsy_oauth_state");

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
