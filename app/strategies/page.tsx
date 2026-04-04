'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import StrategyCard from '@/components/StrategyCard'
import TradeTable from '@/components/TradeTable'
import { loadCandles } from '@/lib/data-loader'
import { runBacktest } from '@/lib/backtester'
import { strategies } from '@/lib/strategies'
import { loadAllResults, deleteResult } from '@/lib/saved-results'
import type { BacktestResult, SavedResult } from '@/lib/types'

const EquityCurveChart = dynamic(() => import('@/components/EquityCurveChart'), { ssr: false })

interface PresetResult {
  strategy: (typeof strategies)[number]
  result: BacktestResult
}

type SortKey = 'totalReturn' | 'winRate' | 'maxDrawdown' | 'sharpeRatio'

export default function StrategiesPage() {
  const [tab, setTab] = useState<'presets' | 'saved'>('presets')
  const [presets, setPresets] = useState<PresetResult[]>([])
  const [loadingPresets, setLoadingPresets] = useState(false)
  const [savedResults, setSavedResults] = useState<SavedResult[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('totalReturn')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setSavedResults(loadAllResults())
  }, [tab])

  async function loadPresets() {
    setLoadingPresets(true)
    try {
      const candles = await loadCandles('BTCUSDT', '1d')
      const results: PresetResult[] = strategies.map((s) => {
        const signals = s.run(candles, s.defaultParams)
        const result = runBacktest(candles, signals, 10000)
        return { strategy: s, result }
      })
      results.sort((a, b) => b.result.metrics.totalReturn - a.result.metrics.totalReturn)
      setPresets(results)
    } catch (e) {
      console.error(e)
    }
    setLoadingPresets(false)
  }

  useEffect(() => {
    if (tab === 'presets' && presets.length === 0) {
      loadPresets()
    }
  }, [tab])

  function handleDelete(id: string) {
    deleteResult(id)
    setSavedResults((prev) => prev.filter((r) => r.id !== id))
  }

  const sortedSaved = [...savedResults].sort((a, b) => {
    if (sortKey === 'maxDrawdown') return a.metrics[sortKey] - b.metrics[sortKey]
    return b.metrics[sortKey] - a.metrics[sortKey]
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Strategies</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {(['presets', 'saved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t === 'presets' ? 'Strategy Presets' : `Saved Results (${savedResults.length})`}
          </button>
        ))}
      </div>

      {/* Presets Tab */}
      {tab === 'presets' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-zinc-400 text-sm">BTCUSDT · 1d · All 2025 data · $10,000 starting capital</p>
            <button
              onClick={loadPresets}
              disabled={loadingPresets}
              className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loadingPresets ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loadingPresets ? (
            <div className="text-zinc-400 text-center py-12">Running all strategies...</div>
          ) : (
            presets.map((p, i) => (
              <StrategyCard
                key={p.strategy.name}
                name={p.strategy.name}
                description={p.strategy.description}
                symbol="BTCUSDT"
                interval="1d"
                metrics={p.result.metrics}
                rank={i + 1}
              />
            ))
          )}
        </div>
      )}

      {/* Saved Results Tab */}
      {tab === 'saved' && (
        <div className="flex flex-col gap-4">
          {savedResults.length === 0 ? (
            <div className="text-zinc-500 text-center py-12">
              No saved results yet. Run a backtest and click &ldquo;Save Result&rdquo;.
            </div>
          ) : (
            <>
              {/* Sort controls */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-sm">Sort by:</span>
                {(['totalReturn', 'winRate', 'maxDrawdown', 'sharpeRatio'] as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setSortKey(k)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      sortKey === k
                        ? 'bg-indigo-700 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {k === 'totalReturn' ? 'Return' : k === 'winRate' ? 'Win Rate' : k === 'maxDrawdown' ? 'Drawdown ↑' : 'Sharpe'}
                  </button>
                ))}
              </div>

              {sortedSaved.map((r) => (
                <div key={r.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <div>
                      <p className="text-white font-medium">{r.label}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Saved {new Date(r.savedAt).toLocaleDateString()} · {r.trades.length} trades
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-zinc-400 text-xs">Win Rate</p>
                        <p className="text-white text-sm font-medium">{r.metrics.winRate}%</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-zinc-400 text-xs">Drawdown</p>
                        <p className="text-red-400 text-sm font-medium">{r.metrics.maxDrawdown}%</p>
                      </div>
                      <span
                        className={`text-xl font-bold min-w-[80px] text-right ${
                          r.metrics.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {r.metrics.totalReturn >= 0 ? '+' : ''}{r.metrics.totalReturn}%
                      </span>
                      <span className="text-zinc-500">{expandedId === r.id ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {expandedId === r.id && (
                    <div className="border-t border-zinc-800 px-5 py-4 flex flex-col gap-4">
                      <EquityCurveChart data={r.equityCurve} height={180} />
                      <TradeTable trades={r.trades} />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Delete this result
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
