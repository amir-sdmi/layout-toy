import type { Candle } from './types'

const BINANCE_BASE = 'https://api.binance.com'

async function fetchFromBinance(
  symbol: string,
  interval: string,
  startTime?: number,
  limit = 1000
): Promise<Candle[]> {
  const params = new URLSearchParams({ symbol, interval, limit: String(limit) })
  if (startTime) params.set('startTime', String(startTime))
  const res = await fetch(`${BINANCE_BASE}/api/v3/klines?${params}`)
  if (!res.ok) throw new Error(`Binance error ${res.status}`)
  const raw: unknown[][] = await res.json()
  return raw.map((r) => ({
    time: Math.floor((r[0] as number) / 1000),
    open: parseFloat(r[1] as string),
    high: parseFloat(r[2] as string),
    low: parseFloat(r[3] as string),
    close: parseFloat(r[4] as string),
    volume: parseFloat(r[5] as string),
  }))
}

async function fetchAllSince(symbol: string, interval: string, since: number): Promise<Candle[]> {
  const all: Candle[] = []
  let startTime = since
  while (true) {
    const batch = await fetchFromBinance(symbol, interval, startTime, 1000)
    if (!batch.length) break
    all.push(...batch)
    if (batch.length < 1000) break
    startTime = batch[batch.length - 1].time * 1000 + 1
  }
  return all
}

/**
 * Load candles: tries pre-cached JSON first, falls back to live Binance fetch.
 * Pass `since` as a unix ms timestamp to fetch from a specific date (default: 2025-01-01).
 */
export async function loadCandles(
  symbol: string,
  interval: string,
  since = new Date('2025-01-01').getTime()
): Promise<Candle[]> {
  // Try cached file first (populated by scripts/fetch-historical.ts)
  try {
    const res = await fetch(`/data/${symbol}_${interval}.json`)
    if (res.ok) {
      const data: Candle[] = await res.json()
      if (data.length > 0) return data
    }
  } catch {
    // ignore, fall through to live fetch
  }

  // Fallback: fetch live from Binance (client-side, works in browser)
  return fetchAllSince(symbol, interval, since)
}
