export interface Candle {
  time: number // unix timestamp in seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Signal {
  time: number
  action: 'BUY' | 'SELL' | 'HOLD'
  price: number
}

export interface Trade {
  entryTime: number
  exitTime: number
  entryPrice: number
  exitPrice: number
  pnl: number
  pnlPct: number
  side: 'LONG'
}

export interface BacktestMetrics {
  totalReturn: number
  winRate: number
  maxDrawdown: number
  totalTrades: number
  sharpeRatio: number
}

export interface BacktestResult {
  trades: Trade[]
  equityCurve: { time: number; value: number }[]
  metrics: BacktestMetrics
}

export interface Strategy {
  name: string
  description: string
  defaultParams: Record<string, number>
  run(candles: Candle[], params: Record<string, number>): Signal[]
}

export interface SavedResult {
  id: string
  savedAt: string
  label: string
  symbol: string
  interval: string
  strategy: string
  params: Record<string, number>
  metrics: BacktestMetrics
  equityCurve: { time: number; value: number }[]
  trades: Trade[]
}

export interface Position {
  symbol: string
  entryPrice: number
  entryTime: number
  quantity: number
}

export interface PaperPortfolio {
  balance: number
  positions: Position[]
  tradeHistory: Trade[]
}
