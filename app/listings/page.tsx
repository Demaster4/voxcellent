"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/nav";

export default function Listings() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/listings").then(r => r.json()).then(setData).catch(() => setData({ error: true }));
  }, []);

  const listings = data?.results ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Nav />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Listings</h1>
          {data?.count != null && (
            <span className="text-zinc-400 text-sm">{data.count} active</span>
          )}
        </div>

        {data?.error && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 text-center">
            <p className="text-zinc-400">Connect your Etsy store to see listings.</p>
          </div>
        )}

        {listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l: any) => (
              <div key={l.listing_id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-3">
                <div>
                  <p className="font-medium leading-snug line-clamp-2">{l.title}</p>
                  <p className="text-zinc-400 text-sm mt-1">
                    ${((l.price?.amount ?? 0) / (l.price?.divisor ?? 100)).toFixed(2)} · {l.quantity} in stock
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${l.state === "active" ? "bg-green-500/20 text-green-400" : "bg-zinc-700 text-zinc-400"}`}>
                    {l.state}
                  </span>
                  <span className="text-zinc-500 text-xs">{l.views ?? 0} views</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!data?.error && listings.length === 0 && data !== null && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
            <p className="text-zinc-500">No active listings found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
