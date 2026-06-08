import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">PrintDesk</h1>
        <p className="text-zinc-400 text-lg">Etsy store management for 3D printer sellers</p>
        <Link
          href="/api/auth/etsy"
          className="inline-block bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Connect Etsy Store
        </Link>
      </div>
    </main>
  );
}
