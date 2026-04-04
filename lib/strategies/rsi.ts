import type { Candle, Signal, Strategy } from '../types'

function computeRSI(closes: number[], period: number, index: number): number {
  if (index < period) return NaN
  let gains = 0
  let losses = 0
  for (let i = index - period + 1; i <= index; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff
    else losses -= diff
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

const rsi: Strategy = {
  name: 'RSI',
  description: 'Buy when RSI drops below oversold level, sell when it rises above overbought.',
  defaultParams: { period: 14, oversold: 30, overbought: 70 },

  run(candles: Candle[], params: Record<string, number>): Signal[] {
    const period = params.period ?? 14
    const oversold = params.oversold ?? 30
    const overbought = params.overbought ?? 70
    const closes = candles.map((c) => c.close)
    const signals: Signal[] = []

    let prevRsi = NaN
    let inPosition = false

    for (let i = 1; i < candles.length; i++) {
      const currRsi = computeRSI(closes, period, i)
      if (isNaN(currRsi) || isNaN(prevRsi)) {
        prevRsi = currRsi
        continue
      }

      if (!inPosition && prevRsi >= oversold && currRsi < oversold) {
        signals.push({ time: candles[i].time, action: 'BUY', price: candles[i].close })
        inPosition = true
      } else if (inPosition && prevRsi <= overbought && currRsi > overbought) {
        signals.push({ time: candles[i].time, action: 'SELL', price: candles[i].close })
        inPosition = false
      }

      prevRsi = currRsi
    }

    return signals
  },
}

export default rsi
