import type { Candle, Signal, Strategy } from '../types'

function sma(values: number[], period: number, index: number): number {
  if (index < period - 1) return NaN
  let sum = 0
  for (let i = index - period + 1; i <= index; i++) sum += values[i]
  return sum / period
}

const smaCrossover: Strategy = {
  name: 'SMA Crossover',
  description: 'Buy when fast SMA crosses above slow SMA, sell when it crosses below.',
  defaultParams: { fast: 10, slow: 50 },

  run(candles: Candle[], params: Record<string, number>): Signal[] {
    const fast = params.fast ?? 10
    const slow = params.slow ?? 50
    const closes = candles.map((c) => c.close)
    const signals: Signal[] = []

    let prevFast = NaN
    let prevSlow = NaN

    for (let i = 0; i < candles.length; i++) {
      const currFast = sma(closes, fast, i)
      const currSlow = sma(closes, slow, i)

      if (!isNaN(prevFast) && !isNaN(prevSlow) && !isNaN(currFast) && !isNaN(currSlow)) {
        if (prevFast <= prevSlow && currFast > currSlow) {
          signals.push({ time: candles[i].time, action: 'BUY', price: candles[i].close })
        } else if (prevFast >= prevSlow && currFast < currSlow) {
          signals.push({ time: candles[i].time, action: 'SELL', price: candles[i].close })
        }
      }

      prevFast = currFast
      prevSlow = currSlow
    }

    return signals
  },
}

export default smaCrossover
