import type { BacktestMetrics } from '@/lib/types'
import MetricsBadge from './MetricsBadge'

interface Props {
  name: string
  description: string
  symbol: string
  interval: string
  metrics: BacktestMetrics
  rank?: number
}

export default function StrategyCard({ name, description, symbol, interval, metrics, rank }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            {rank && (
              <span className="text-xs font-bold bg-zinc-700 text-zinc-300 rounded px-2 py-0.5">
                #{rank}
              </span>
            )}
            <h3 className="text-white font-semibold text-lg">{name}</h3>
          </div>
          <p className="text-zinc-400 text-sm mt-0.5">{description}</p>
          <p className="text-zinc-500 text-xs mt-1">
            {symbol} · {interval}
          </p>
        </div>
        <span
          className={`text-2xl font-bold ${
            metrics.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {metrics.totalReturn >= 0 ? '+' : ''}
          {metrics.totalReturn}%
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MetricsBadge label="Win Rate" value={`${metrics.winRate}%`} neutral />
        <MetricsBadge label="Max Drawdown" value={`${metrics.maxDrawdown}%`} negative />
        <MetricsBadge label="Trades" value={metrics.totalTrades} neutral />
        <MetricsBadge label="Sharpe" value={metrics.sharpeRatio} neutral />
      </div>
    </div>
  )
}
