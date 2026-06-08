import crypto from "crypto";

const ETSY_BASE_URL = "https://openapi.etsy.com";
const ETSY_AUTH_URL = "https://www.etsy.com/oauth/connect";
const ETSY_TOKEN_URL = "https://api.etsy.com/v3/public/oauth/token";

export const ETSY_SCOPES = [
  "listings_r",
  "listings_w",
  "listings_d",
  "transactions_r",
  "transactions_w",
  "shops_r",
  "shops_w",
  "profile_r",
  "email_r",
].join(" ");

export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export function getAuthUrl(challenge: string, state: string) {
  const params = new URLSearchParams({
    response_type: "code",
    redirect_uri: process.env.ETSY_REDIRECT_URI!,
    scope: ETSY_SCOPES,
    client_id: process.env.ETSY_API_KEY!,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  return `${ETSY_AUTH_URL}?${params}`;
}

export async function exchangeCodeForToken(code: string, verifier: string) {
  const res = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ETSY_API_KEY!,
      redirect_uri: process.env.ETSY_REDIRECT_URI!,
      code,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);
  return res.json();
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(ETSY_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.ETSY_API_KEY!,
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);
  return res.json();
}

export async function etsyFetch(
  path: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const res = await fetch(`${ETSY_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": process.env.ETSY_SHARED_SECRET!,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Etsy API error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getMe(accessToken: string) {
  return etsyFetch("/v3/application/users/me", accessToken);
}

export async function getShopByOwner(userId: number, accessToken: string) {
  return etsyFetch(`/v3/application/users/${userId}/shops`, accessToken);
}

export async function getShop(shopId: number, accessToken: string) {
  return etsyFetch(`/v3/application/shops/${shopId}`, accessToken);
}

export async function getReceipts(shopId: number, accessToken: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ limit: "25", sort_on: "created", sort_order: "down", ...params });
  return etsyFetch(`/v3/application/shops/${shopId}/receipts?${qs}`, accessToken);
}

export async function getListings(shopId: number, accessToken: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ limit: "25", state: "active", ...params });
  return etsyFetch(`/v3/application/shops/${shopId}/listings?${qs}`, accessToken);
}

export function formatMoney(money: { amount: number; divisor: number; currency_code: string }) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency_code,
  }).format(money.amount / money.divisor);
}
