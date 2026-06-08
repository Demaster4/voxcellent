"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/nav";

const STATUSES = ["pending", "printing", "done", "shipped"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  printing: "bg-blue-500/20 text-blue-400",
  done: "bg-green-500/20 text-green-400",
  shipped: "bg-zinc-700 text-zinc-300",
};

export default function Queue() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const url = filter === "all" ? "/api/queue" : `/api/queue?status=${filter}`;
    fetch(url).then(r => r.json()).then(setItems);
  }, [filter]);

  async function setStatus(id: number, status: string) {
    setUpdating(id);
    const res = await fetch("/api/queue", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const updated = await res.json();
    setItems(prev => prev.map(i => i.id === id ? updated : i));
    setUpdating(null);
  }

  const nextStatus = (current: string) => {
    const idx = STATUSES.indexOf(current);
    return STATUSES[idx + 1] ?? null;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Print Queue</h1>
          <div className="flex gap-1">
            {["all", ...STATUSES].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                  filter === s ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">No items in queue. Add orders from the Orders page.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item: any) => {
              const next = nextStatus(item.status);
              return (
                <div key={item.id} className="bg-zinc-900 rounded-xl border border-zinc-800 px-6 py-4 flex items-center gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-medium truncate">{item.product_name ?? "Unknown product"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[item.status] ?? "bg-zinc-700 text-zinc-300"}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-zinc-400 text-sm">
                      <span>{item.customer_name}</span>
                      {item.quantity > 1 && <span>Qty: {item.quantity}</span>}
                      {item.color_combo && <span>{item.color_combo}</span>}
                      {item.notes && <span className="text-zinc-500 italic">{item.notes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-zinc-600 font-mono text-xs">#{item.etsy_receipt_id}</span>
                    {next && (
                      <button
                        onClick={() => setStatus(item.id, next)}
                        disabled={updating === item.id}
                        className="text-xs bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-md transition-colors capitalize"
                      >
                        {updating === item.id ? "…" : `Mark ${next}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
