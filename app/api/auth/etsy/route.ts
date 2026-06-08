import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generatePKCE, getAuthUrl } from "@/lib/etsy";
import crypto from "crypto";

export async function GET() {
  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("etsy_pkce_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  cookieStore.set("etsy_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(getAuthUrl(challenge, state));
}
