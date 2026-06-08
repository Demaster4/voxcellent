import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getStoredTokens() {
  const { data } = await supabase
    .from("etsy_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export async function saveTokens(tokens: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const expires_at = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  await supabase.from("etsy_tokens").upsert({
    id: 1,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at,
    updated_at: new Date().toISOString(),
  });
}
