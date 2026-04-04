/**
 * One-time script to fetch 2025 OHLCV data from Binance and save to public/data/.
 * Run with: npx tsx scripts/fetch-historical.ts
 */
import fs from 'fs'
import path from 'path'

interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']
const INTERVALS = ['1d', '4h', '1h']
const START = new Date('2025-01-01').getTime()
const OUT_DIR = path.join(process.cwd(), 'public', 'data')

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

async function fetchBatch(
  symbol: string,
  interval: string,
  startTime: number
): Promise<Candle[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&limit=1000`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${symbol} ${interval}`)
  const raw: unknown[][] = await res.json()
  return raw.map(parseCandle)
}

async function fetchAll(symbol: string, interval: string): Promise<Candle[]> {
  const all: Candle[] = []
  let startTime = START
  process.stdout.write(`  Fetching ${symbol} ${interval}...`)

  while (true) {
    const batch = await fetchBatch(symbol, interval, startTime)
    if (!batch.length) break
    all.push(...batch)
    process.stdout.write(` ${all.length}`)
    if (batch.length < 1000) break
    startTime = batch[batch.length - 1].time * 1000 + 1
    // Small delay to be polite to the API
    await new Promise((r) => setTimeout(r, 200))
  }

  console.log(` → ${all.length} candles`)
  return all
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const symbol of SYMBOLS) {
    for (const interval of INTERVALS) {
      const file = path.join(OUT_DIR, `${symbol}_${interval}.json`)
      if (fs.existsSync(file)) {
        console.log(`  Skipping ${symbol}_${interval}.json (already exists)`)
        continue
      }
      try {
        const candles = await fetchAll(symbol, interval)
        fs.writeFileSync(file, JSON.stringify(candles))
        console.log(`  Saved ${file}`)
      } catch (err) {
        console.error(`  Error fetching ${symbol} ${interval}:`, err)
      }
    }
  }

  console.log('\nDone!')
}

main()
