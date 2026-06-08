"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/nav";

export default function Orders() {
  const [orders, setOrders] = useState<any>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/orders").then(r => r.json()).then(setOrders).catch(() => setOrders({ error: true }));
  }, []);

  async function addToQueue(receipt: any) {
    setAdding(receipt.receipt_id);
    const firstTx = receipt.transactions?.[0];
    await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        etsy_receipt_id: String(receipt.receipt_id),
        customer_name: receipt.name,
        product_name: firstTx?.title ?? "Unknown product",
        listing_id: firstTx?.listing_id ? String(firstTx.listing_id) : null,
        quantity: firstTx?.quantity ?? 1,
      }),
    });
    setAdded(prev => new Set(prev).add(receipt.receipt_id));
    setAdding(null);
  }

  const results = orders?.results ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Orders</h1>
          {orders?.count != null && (
            <span className="text-zinc-400 text-sm">{orders.count} total</span>
          )}
        </div>

        {orders?.error && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-center">
            <p className="text-zinc-400">Connect your Etsy store to see orders.</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wide border-b border-zinc-800">
                  <th className="px-6 py-3 text-left">Order</th>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {results.map((o: any) => (
                  <tr key={o.receipt_id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-zinc-400 text-xs">#{o.receipt_id}</td>
                    <td className="px-6 py-4 font-medium">{o.name}</td>
                    <td className="px-6 py-4 text-zinc-400">
                      {o.transactions?.map((t: any) => (
                        <div key={t.transaction_id} className="truncate max-w-[200px]">{t.title}</div>
                      ))}
                    </td>
                    <td className="px-6 py-4">${((o.grandtotal?.amount ?? 0) / (o.grandtotal?.divisor ?? 100)).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={o.status} shipped={o.is_shipped} />
                    </td>
                    <td className="px-6 py-4">
                      {!o.is_shipped && !o.is_canceled && (
                        added.has(o.receipt_id) ? (
                          <span className="text-green-400 text-xs">Added</span>
                        ) : (
                          <button
                            onClick={() => addToQueue(o)}
                            disabled={adding === o.receipt_id}
                            className="text-xs bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white px-3 py-1.5 rounded-md transition-colors"
                          >
                            {adding === o.receipt_id ? "Adding…" : "+ Queue"}
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!orders?.error && results.length === 0 && orders !== null && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">No orders found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status, shipped }: { status: string; shipped: boolean }) {
  if (shipped) return <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-full">Shipped</span>;
  if (status === "paid") return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">Paid</span>;
  if (status === "completed") return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Completed</span>;
  if (status === "canceled") return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">Canceled</span>;
  return <span className="bg-zinc-700 text-zinc-300 text-xs px-2 py-1 rounded-full">{status}</span>;
}
