'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import BacktestForm, { type BacktestParams } from '@/components/BacktestForm'
import MetricsBadge from '@/components/MetricsBadge'
import TradeTable from '@/components/TradeTable'
import { loadCandles } from '@/lib/data-loader'
import { runBacktest } from '@/lib/backtester'
import { saveResult, generateId } from '@/lib/saved-results'
import type { BacktestResult } from '@/lib/types'

const CandlestickChart = dynamic(() => import('@/components/CandlestickChart'), { ssr: false })
const EquityCurveChart = dynamic(() => import('@/components/EquityCurveChart'), { ssr: false })

export default function BacktestPage() {
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [lastParams, setLastParams] = useState<BacktestParams | null>(null)
  const [candles, setCandles] = useState<import('@/lib/types').Candle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleRun(params: BacktestParams) {
    setLoading(true)
    setError(null)
    setSaved(false)
    try {
      const data = await loadCandles(params.symbol, params.interval)
      const signals = params.strategy.run(data, params.params)
      const res = runBacktest(data, signals, params.startCapital)
      setCandles(data)
      setResult(res)
      setLastParams(params)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    }
    setLoading(false)
  }

  function handleSave() {
    if (!result || !lastParams) return
    const label = `${lastParams.symbol} ${lastParams.interval} ${lastParams.strategy.name}(${Object.values(lastParams.params).join(',')})`
    saveResult({
      id: generateId(),
      savedAt: new Date().toISOString(),
      label,
      symbol: lastParams.symbol,
      interval: lastParams.interval,
      strategy: lastParams.strategy.name,
      params: lastParams.params,
      metrics: result.metrics,
      equityCurve: result.equityCurve,
      trades: result.trades,
    })
    setSaved(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Backtest</h1>

      <BacktestForm onSubmit={handleRun} loading={loading} />

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 rounded-xl px-5 py-4 text-sm">
          {error}
        </div>
      )}

      {result && lastParams && (
        <>
          {/* Metrics */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold">
              {lastParams.strategy.name} · {lastParams.symbol} {lastParams.interval}
            </h2>
            <button
              onClick={handleSave}
              disabled={saved}
              className="text-sm bg-indigo-700 hover:bg-indigo-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {saved ? 'Saved!' : 'Save Result'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <MetricsBadge
              label="Total Return"
              value={`${result.metrics.totalReturn >= 0 ? '+' : ''}${result.metrics.totalReturn}%`}
              positive={result.metrics.totalReturn >= 0}
              negative={result.metrics.totalReturn < 0}
            />
            <MetricsBadge label="Win Rate" value={`${result.metrics.winRate}%`} neutral />
            <MetricsBadge
              label="Max Drawdown"
              value={`${result.metrics.maxDrawdown}%`}
              negative
            />
            <MetricsBadge label="Trades" value={result.metrics.totalTrades} neutral />
            <MetricsBadge label="Sharpe" value={result.metrics.sharpeRatio} neutral />
          </div>

          {/* Candlestick chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm mb-3">Price Chart (with trade markers)</p>
            <CandlestickChart candles={candles} trades={result.trades} height={320} />
          </div>

          {/* Equity curve */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-zinc-400 text-sm mb-3">Equity Curve</p>
            <EquityCurveChart data={result.equityCurve} height={200} />
          </div>

          {/* Trades */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4">
              Trades ({result.trades.length})
            </h2>
            <TradeTable trades={result.trades} />
          </div>
        </>
      )}
    </div>
  )
}
