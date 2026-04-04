import type { Candle } from './types'

const BASE = 'https://api.binance.com'

function parseCandle(raw: unknown[]): Candle {
  return {
    time: Math.floor((raw[0] as number) / 1000),
    open: parseFloat(raw[1] as string),
    high: parseFloat(raw[2] as string),
    low: parseFloat(raw[3] as string),
    close: parseFloat(raw[4] as string),
    volume: parseFloat(raw[5] as string),
  }
}

export async function fetchKlines(
  symbol: string,
  interval: string,
  startTime?: number,
  limit = 1000
): Promise<Candle[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    limit: String(limit),
  })
  if (startTime) params.set('startTime', String(startTime))
  const res = await fetch(`${BASE}/api/v3/klines?${params}`)
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`)
  const raw: unknown[][] = await res.json()
  return raw.map(parseCandle)
}

export async function fetchAllKlinesSince(
  symbol: string,
  interval: string,
  since: number
): Promise<Candle[]> {
  const all: Candle[] = []
  let startTime = since

  while (true) {
    const batch = await fetchKlines(symbol, interval, startTime, 1000)
    if (!batch.length) break
    all.push(...batch)
    const last = batch[batch.length - 1]
    startTime = last.time * 1000 + 1
    if (batch.length < 1000) break
  }

  return all
}
