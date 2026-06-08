import { neon } from "@neondatabase/serverless";
import { refreshAccessToken } from "./etsy";

export const sql = neon(process.env.DATABASE_URL!);

export async function getStoredTokens() {
  const rows = await sql`SELECT * FROM etsy_tokens WHERE id = 1 LIMIT 1`;
  return rows[0] ?? null;
}

export async function saveTokens(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id?: number;
  shop_id?: number;
}) {
  const expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  await sql`
    INSERT INTO etsy_tokens (id, access_token, refresh_token, expires_at, user_id, shop_id, updated_at)
    VALUES (1, ${tokens.access_token}, ${tokens.refresh_token}, ${expires_at}, ${tokens.user_id ?? null}, ${tokens.shop_id ?? null}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      user_id = COALESCE(EXCLUDED.user_id, etsy_tokens.user_id),
      shop_id = COALESCE(EXCLUDED.shop_id, etsy_tokens.shop_id),
      updated_at = NOW()
  `;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getStoredTokens();
  if (!tokens) return null;

  if (new Date(tokens.expires_at) > new Date(Date.now() + 60_000)) {
    return tokens.access_token;
  }

  const refreshed = await refreshAccessToken(tokens.refresh_token);
  await saveTokens(refreshed);
  return refreshed.access_token;
}

export async function getQueueItems(status?: string) {
  if (status) {
    return sql`SELECT * FROM print_queue WHERE status = ${status} ORDER BY created_at DESC`;
  }
  return sql`SELECT * FROM print_queue ORDER BY created_at DESC`;
}

export async function addToQueue(item: {
  etsy_receipt_id: string;
  etsy_order_id?: string;
  customer_name?: string;
  product_name?: string;
  listing_id?: string;
  quantity?: number;
  color_combo?: string;
  notes?: string;
}) {
  const rows = await sql`
    INSERT INTO print_queue (etsy_receipt_id, etsy_order_id, customer_name, product_name, listing_id, quantity, color_combo, notes)
    VALUES (${item.etsy_receipt_id}, ${item.etsy_order_id ?? null}, ${item.customer_name ?? null}, ${item.product_name ?? null}, ${item.listing_id ?? null}, ${item.quantity ?? 1}, ${item.color_combo ?? null}, ${item.notes ?? null})
    ON CONFLICT (etsy_receipt_id) DO NOTHING
    RETURNING *
  `;
  return rows[0];
}

export async function updateQueueStatus(id: number, status: string) {
  const rows = await sql`
    UPDATE print_queue SET status = ${status}, updated_at = NOW()
    WHERE id = ${id} RETURNING *
  `;
  return rows[0];
}

export async function getQueueStats() {
  const rows = await sql`
    SELECT status, COUNT(*)::int as count FROM print_queue GROUP BY status
  `;
  return rows;
}
