import type { Candle, Signal, Trade, BacktestResult } from './types'
import { computeMetrics } from './metrics'

export function runBacktest(
  candles: Candle[],
  signals: Signal[],
  startCapital = 10000
): BacktestResult {
  const signalMap = new Map(signals.map((s) => [s.time, s]))
  const trades: Trade[] = []
  const equityCurve: { time: number; value: number }[] = []

  let balance = startCapital
  let entryPrice: number | null = null
  let entryTime: number | null = null

  for (const candle of candles) {
    const signal = signalMap.get(candle.time)

    if (signal?.action === 'BUY' && entryPrice === null) {
      entryPrice = signal.price
      entryTime = signal.time
    } else if (signal?.action === 'SELL' && entryPrice !== null && entryTime !== null) {
      const pnlPct = (signal.price - entryPrice) / entryPrice
      const pnl = balance * pnlPct
      balance += pnl
      trades.push({
        entryTime,
        exitTime: signal.time,
        entryPrice,
        exitPrice: signal.price,
        pnl,
        pnlPct: pnlPct * 100,
        side: 'LONG',
      })
      entryPrice = null
      entryTime = null
    }

    // Mark-to-market equity
    const equity =
      entryPrice !== null
        ? balance * (1 + (candle.close - entryPrice) / entryPrice)
        : balance

    equityCurve.push({ time: candle.time, value: equity })
  }

  const metrics = computeMetrics(trades, equityCurve, startCapital)
  return { trades, equityCurve, metrics }
}
