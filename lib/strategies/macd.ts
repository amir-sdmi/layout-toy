import type { Candle, Signal, Strategy } from '../types'

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = new Array(values.length).fill(NaN)
  // Find first valid index
  let start = period - 1
  let sum = 0
  for (let i = 0; i < period; i++) sum += values[i]
  result[start] = sum / period
  for (let i = start + 1; i < values.length; i++) {
    result[i] = values[i] * k + result[i - 1] * (1 - k)
  }
  return result
}

const macd: Strategy = {
  name: 'MACD',
  description: 'Buy when MACD line crosses above signal line, sell when it crosses below.',
  defaultParams: { fast: 12, slow: 26, signal: 9 },

  run(candles: Candle[], params: Record<string, number>): Signal[] {
    const fastP = params.fast ?? 12
    const slowP = params.slow ?? 26
    const signalP = params.signal ?? 9

    const closes = candles.map((c) => c.close)
    const fastEma = ema(closes, fastP)
    const slowEma = ema(closes, slowP)

    const macdLine = closes.map((_, i) =>
      isNaN(fastEma[i]) || isNaN(slowEma[i]) ? NaN : fastEma[i] - slowEma[i]
    )

    const validMacd = macdLine.filter((v) => !isNaN(v))
    const signalLinePartial = ema(validMacd, signalP)

    // Map signal line back to original indices
    const signalLine: number[] = new Array(candles.length).fill(NaN)
    let validIdx = 0
    for (let i = 0; i < candles.length; i++) {
      if (!isNaN(macdLine[i])) {
        signalLine[i] = signalLinePartial[validIdx]
        validIdx++
      }
    }

    const signals: Signal[] = []
    for (let i = 1; i < candles.length; i++) {
      const prevM = macdLine[i - 1]
      const currM = macdLine[i]
      const prevS = signalLine[i - 1]
      const currS = signalLine[i]

      if (isNaN(prevM) || isNaN(currM) || isNaN(prevS) || isNaN(currS)) continue

      if (prevM <= prevS && currM > currS) {
        signals.push({ time: candles[i].time, action: 'BUY', price: candles[i].close })
      } else if (prevM >= prevS && currM < currS) {
        signals.push({ time: candles[i].time, action: 'SELL', price: candles[i].close })
      }
    }

    return signals
  },
}

export default macd
