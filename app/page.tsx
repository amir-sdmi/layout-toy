'use client'
import { useEffect, useState } from 'react'
import MetricsBadge from '@/components/MetricsBadge'
import TradeTable from '@/components/TradeTable'
import {
  loadPortfolio,
  savePortfolio,
  openPosition,
  closePosition,
  resetPortfolio,
} from '@/lib/paper-portfolio'
import type { PaperPortfolio } from '@/lib/types'

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PaperPortfolio | null>(null)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [buySymbol, setBuySymbol] = useState('BTCUSDT')
  const [buyAmount, setBuyAmount] = useState(1000)
  const [loadingPrices, setLoadingPrices] = useState(false)

  useEffect(() => {
    setPortfolio(loadPortfolio())
  }, [])

  async function fetchPrices() {
    setLoadingPrices(true)
    try {
      const results = await Promise.all(
        SYMBOLS.map(async (s) => {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${s}`)
          const data = await res.json()
          return [s, parseFloat(data.price)] as [string, number]
        })
      )
      setPrices(Object.fromEntries(results))
    } catch {
      // silently fail if Binance unreachable
    }
    setLoadingPrices(false)
  }

  function update(next: PaperPortfolio) {
    setPortfolio(next)
    savePortfolio(next)
  }

  function handleBuy() {
    if (!portfolio || !prices[buySymbol]) return
    update(openPosition(portfolio, buySymbol, prices[buySymbol], buyAmount))
  }

  function handleSell(symbol: string) {
    if (!portfolio || !prices[symbol]) return
    update(closePosition(portfolio, symbol, prices[symbol]))
  }

  function handleReset() {
    if (!confirm('Reset your paper portfolio to $10,000?')) return
    setPortfolio(resetPortfolio())
  }

  if (!portfolio) return <div className="text-zinc-400 py-10 text-center">Loading...</div>

  const totalPositionValue = portfolio.positions.reduce((sum, pos) => {
    const price = prices[pos.symbol] ?? pos.entryPrice
    return sum + pos.quantity * price
  }, 0)
  const totalEquity = portfolio.balance + totalPositionValue
  const totalPnl = totalEquity - 10000
  const totalPnlPct = (totalPnl / 10000) * 100

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchPrices}
            disabled={loadingPrices}
            className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {loadingPrices ? 'Loading...' : 'Refresh Prices'}
          </button>
          <button
            onClick={handleReset}
            className="text-sm bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            Reset Portfolio
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricsBadge
          label="Total Equity"
          value={`$${totalEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          neutral
        />
        <MetricsBadge
          label="Cash Balance"
          value={`$${portfolio.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          neutral
        />
        <MetricsBadge
          label="Total P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${Math.abs(totalPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          positive={totalPnl >= 0}
          negative={totalPnl < 0}
        />
        <MetricsBadge
          label="Return"
          value={`${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`}
          positive={totalPnlPct >= 0}
          negative={totalPnlPct < 0}
        />
      </div>

      {/* Open Positions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Open Positions</h2>
        {portfolio.positions.length === 0 ? (
          <p className="text-zinc-500 text-sm">No open positions. Use &ldquo;Open Paper Trade&rdquo; below.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {portfolio.positions.map((pos) => {
              const currentPrice = prices[pos.symbol] ?? pos.entryPrice
              const pnlPct = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100
              return (
                <div
                  key={pos.symbol}
                  className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-white font-medium">{pos.symbol}</p>
                    <p className="text-zinc-400 text-sm">
                      Entry: ${pos.entryPrice.toLocaleString()} · Qty: {pos.quantity.toFixed(6)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                    </p>
                    <p className="text-zinc-400 text-sm">
                      {prices[pos.symbol] ? `$${currentPrice.toLocaleString()}` : 'Refresh prices'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSell(pos.symbol)}
                    disabled={!prices[pos.symbol]}
                    className="ml-4 text-sm bg-red-900/40 hover:bg-red-900 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Trade */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Open Paper Trade</h2>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400 text-xs uppercase tracking-wider">Symbol</label>
            <select
              value={buySymbol}
              onChange={(e) => setBuySymbol(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2"
            >
              {SYMBOLS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-zinc-400 text-xs uppercase tracking-wider">Amount (USDT)</label>
            <input
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(Number(e.target.value))}
              min={10}
              step={100}
              className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 w-32"
            />
          </div>
          <button
            onClick={handleBuy}
            disabled={!prices[buySymbol] || portfolio.balance < buyAmount}
            className="bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium text-sm rounded-lg px-5 py-2 transition-colors"
          >
            {prices[buySymbol]
              ? `Buy @ $${prices[buySymbol].toLocaleString()}`
              : 'Refresh prices first'}
          </button>
        </div>
        {portfolio.balance < buyAmount && (
          <p className="text-red-400 text-sm mt-2">Insufficient balance.</p>
        )}
      </div>

      {/* Trade History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">
          Trade History ({portfolio.tradeHistory.length})
        </h2>
        <TradeTable trades={portfolio.tradeHistory} />
      </div>
    </div>
  )
}
