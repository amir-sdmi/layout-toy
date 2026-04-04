import type { Trade } from '@/lib/types'

interface Props {
  trades: Trade[]
}

function fmt(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}

export default function TradeTable({ trades }: Props) {
  if (!trades.length) {
    return <p className="text-zinc-500 text-sm text-center py-6">No trades yet.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-400 border-b border-zinc-800 text-left">
            <th className="py-2 pr-4 font-medium">Entry</th>
            <th className="py-2 pr-4 font-medium">Exit</th>
            <th className="py-2 pr-4 font-medium text-right">Buy</th>
            <th className="py-2 pr-4 font-medium text-right">Sell</th>
            <th className="py-2 font-medium text-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => (
            <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
              <td className="py-2 pr-4 text-zinc-300">{fmt(t.entryTime)}</td>
              <td className="py-2 pr-4 text-zinc-300">{fmt(t.exitTime)}</td>
              <td className="py-2 pr-4 text-right text-zinc-200">
                ${t.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td className="py-2 pr-4 text-right text-zinc-200">
                ${t.exitPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td
                className={`py-2 text-right font-medium ${
                  t.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {t.pnlPct >= 0 ? '+' : ''}
                {t.pnlPct.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
