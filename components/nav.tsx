"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
  { href: "/queue", label: "Print Queue" },
  { href: "/listings", label: "Listings" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex items-center gap-8">
      <Link href="/dashboard" className="text-lg font-bold tracking-tight text-white">
        Voxcellent
      </Link>
      <nav className="flex gap-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              path.startsWith(href)
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
