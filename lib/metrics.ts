import type { Trade, BacktestMetrics } from './types'

export function computeMetrics(
  trades: Trade[],
  equityCurve: { time: number; value: number }[],
  startCapital: number
): BacktestMetrics {
  const totalTrades = trades.length

  // Total return
  const finalEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].value : startCapital
  const totalReturn = ((finalEquity - startCapital) / startCapital) * 100

  // Win rate
  const wins = trades.filter((t) => t.pnl > 0).length
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0

  // Max drawdown
  let peak = startCapital
  let maxDrawdown = 0
  for (const point of equityCurve) {
    if (point.value > peak) peak = point.value
    const dd = ((peak - point.value) / peak) * 100
    if (dd > maxDrawdown) maxDrawdown = dd
  }

  // Sharpe ratio (simplified: using daily returns)
  const returns: number[] = []
  for (let i = 1; i < equityCurve.length; i++) {
    const r = (equityCurve[i].value - equityCurve[i - 1].value) / equityCurve[i - 1].value
    returns.push(r)
  }
  let sharpeRatio = 0
  if (returns.length > 1) {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / returns.length
    const std = Math.sqrt(variance)
    sharpeRatio = std > 0 ? (mean / std) * Math.sqrt(252) : 0
  }

  return {
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    winRate: parseFloat(winRate.toFixed(1)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    totalTrades,
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
  }
}
