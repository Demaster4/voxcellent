import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export async function getStoredTokens() {
  const rows = await sql`
    SELECT * FROM etsy_tokens WHERE id = 1 LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function saveTokens(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  await sql`
    INSERT INTO etsy_tokens (id, access_token, refresh_token, expires_at, updated_at)
    VALUES (1, ${tokens.access_token}, ${tokens.refresh_token}, ${expires_at}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      expires_at = EXCLUDED.expires_at,
      updated_at = NOW()
  `;
}
