"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/nav";
import Link from "next/link";

type QueueStat = { status: string; count: number };

export default function Dashboard() {
  const [shopData, setShopData] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);

  useEffect(() => {
    fetch("/api/shop").then(r => r.json()).then(setShopData);
    fetch("/api/orders").then(r => r.json()).then(setOrders).catch(() => {});
  }, []);

  const queueStats: QueueStat[] = shopData?.queueStats ?? [];
  const pending = queueStats.find(s => s.status === "pending")?.count ?? 0;
  const printing = queueStats.find(s => s.status === "printing")?.count ?? 0;
  const totalQueue = queueStats.reduce((a, s) => a + (s.status !== "shipped" ? s.count : 0), 0);
  const recentOrders = orders?.results?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {shopData && !shopData.connected && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="font-medium">Etsy store not connected</p>
              <p className="text-zinc-400 text-sm mt-1">Connect your store to start managing orders.</p>
            </div>
            <Link href="/api/auth/etsy" className="bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Connect Etsy
            </Link>
          </div>
        )}

        {shopData?.shop && (
          <div>
            <h1 className="text-2xl font-semibold">{shopData.shop.shop_name}</h1>
            <p className="text-zinc-400 text-sm mt-1">{shopData.shop.listing_active_count ?? 0} active listings</p>
          </div>
        )}

        {!shopData?.shop && shopData?.connected && (
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Open Orders", value: orders?.count ?? "—" },
            { label: "In Queue", value: totalQueue || "—" },
            { label: "Pending Print", value: pending || "—" },
            { label: "Printing Now", value: printing || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
              <p className="text-zinc-400 text-xs uppercase tracking-wide">{label}</p>
              <p className="text-3xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/orders" className="text-zinc-400 hover:text-white text-sm transition-colors">View all</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-zinc-500 text-sm">
              {shopData?.connected ? "No orders yet." : "Connect your Etsy store to see orders."}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wide border-b border-zinc-800">
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o: any) => (
                  <tr key={o.receipt_id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{o.name}</td>
                    <td className="px-6 py-4 text-zinc-400">{o.transactions?.length ?? 1} item{o.transactions?.length !== 1 ? "s" : ""}</td>
                    <td className="px-6 py-4">${((o.grandtotal?.amount ?? 0) / (o.grandtotal?.divisor ?? 100)).toFixed(2)}</td>
                    <td className="px-6 py-4"><StatusBadge status={o.status} shipped={o.is_shipped} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
