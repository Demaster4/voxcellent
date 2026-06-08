import { NextRequest, NextResponse } from "next/server";
import { getQueueItems, addToQueue, updateQueueStatus } from "@/lib/db";

export async function GET(req: NextRequest) {
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  const items = await getQueueItems(status);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = await addToQueue(body);
  if (!item) return NextResponse.json({ error: "already_queued" }, { status: 409 });
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { id, status } = await req.json();
  const item = await updateQueueStatus(id, status);
  return NextResponse.json(item);
}
