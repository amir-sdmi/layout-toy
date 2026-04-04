'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/backtest', label: 'Backtest' },
  { href: '/strategies', label: 'Strategies' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-3 flex items-center gap-8">
      <span className="text-white font-bold text-lg tracking-tight">
        📈 Paper Trader
      </span>
      <div className="flex gap-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              pathname === href
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
