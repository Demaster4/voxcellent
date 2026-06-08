import Link from "next/link";

const MOCK_JOBS = [
  {
    id: 9283,
    name: "Custom Name Plate",
    color: "Jade Green",
    status: "Printing",
    statusCls: "bg-blue-500/20 text-blue-400",
    cardCls: "top-0 z-30 opacity-100",
  },
  {
    id: 9282,
    name: "Cable Management Box",
    color: "Carbon Black",
    status: "Queued",
    statusCls: "bg-yellow-500/20 text-yellow-400",
    cardCls: "top-[76px] z-20 opacity-[0.82]",
  },
  {
    id: 9281,
    name: "Desk Organizer",
    color: "Bone White",
    status: "Done",
    statusCls: "bg-green-500/20 text-green-400",
    cardCls: "top-[152px] z-10 opacity-60",
  },
];

const FEATURES = [
  {
    num: "01",
    title: "Sync Etsy Orders",
    desc: "Pull live orders directly from your store. Every sale visible in one place.",
  },
  {
    num: "02",
    title: "Manage the Queue",
    desc: "Turn orders into print jobs. Track each job from pending through shipped.",
  },
  {
    num: "03",
    title: "Watch Your Listings",
    desc: "See active listings, stock levels, and view counts without leaving the app.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      <section className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 dot-grid opacity-25 pointer-events-none" />

        <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-zinc-900">
          <span className="font-bold tracking-tight text-white">Voxcellent</span>
          <Link
            href="/dashboard"
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Dashboard
          </Link>
        </header>

        <div className="relative z-10 flex-1 flex items-center">
          <div className="max-w-6xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-16 items-center py-20">
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-orange-400 font-medium font-mono">
                  Built for Bambu X1C sellers
                </p>
                <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                  Voxcellent
                </h1>
                <p className="text-zinc-400 text-lg leading-relaxed max-w-sm pt-2">
                  Etsy orders. Print queue. Live listings. One tool built for 3D printer sellers.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <a
                  href="/api/auth/etsy"
                  className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors"
                >
                  Connect Etsy Store
                </a>
                <Link
                  href="/dashboard"
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  View dashboard
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative h-[260px]">
              {MOCK_JOBS.map((job) => (
                <div
                  key={job.id}
                  className={`absolute inset-x-0 bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4 ${job.cardCls}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{job.name}</p>
                    <p className="text-zinc-500 text-sm mt-0.5">
                      {job.color} · Order #{job.id}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${job.statusCls}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-zinc-800/50">
          <div className="max-w-6xl mx-auto px-8 py-16 grid sm:grid-cols-3 gap-10">
            {FEATURES.map((f) => (
              <div key={f.num} className="space-y-3">
                <p className="text-orange-500 font-mono text-sm font-semibold">{f.num}</p>
                <h3 className="font-semibold text-white text-lg">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
