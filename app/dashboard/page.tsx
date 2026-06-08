import Link from "next/link";

const nav = [
  { href: "/orders", label: "Orders" },
  { href: "/queue", label: "Print Queue" },
  { href: "/listings", label: "Listings" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">Voxly</span>
        <nav className="flex gap-6">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href} className="text-zinc-400 hover:text-white transition-colors text-sm">
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Open Orders", value: "—" },
            { label: "In Queue", value: "—" },
            { label: "Active Listings", value: "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
              <p className="text-zinc-400 text-sm">{label}</p>
              <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <p className="text-zinc-500 text-sm">No orders yet — connect your Etsy store to get started.</p>
        </div>
      </main>
    </div>
  );
}
