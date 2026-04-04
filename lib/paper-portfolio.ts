import type { PaperPortfolio, Trade } from './types'

const STORAGE_KEY = 'paper_portfolio'
const INITIAL_BALANCE = 10000

function defaultPortfolio(): PaperPortfolio {
  return { balance: INITIAL_BALANCE, positions: [], tradeHistory: [] }
}

export function loadPortfolio(): PaperPortfolio {
  if (typeof window === 'undefined') return defaultPortfolio()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultPortfolio()
  } catch {
    return defaultPortfolio()
  }
}

export function savePortfolio(portfolio: PaperPortfolio): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio))
}

export function openPosition(
  portfolio: PaperPortfolio,
  symbol: string,
  price: number,
  usdtAmount: number
): PaperPortfolio {
  if (portfolio.positions.find((p) => p.symbol === symbol)) return portfolio
  if (usdtAmount > portfolio.balance) return portfolio
  const quantity = usdtAmount / price
  return {
    ...portfolio,
    balance: portfolio.balance - usdtAmount,
    positions: [
      ...portfolio.positions,
      { symbol, entryPrice: price, entryTime: Date.now() / 1000, quantity },
    ],
  }
}

export function closePosition(
  portfolio: PaperPortfolio,
  symbol: string,
  price: number
): PaperPortfolio {
  const pos = portfolio.positions.find((p) => p.symbol === symbol)
  if (!pos) return portfolio
  const proceeds = pos.quantity * price
  const pnl = proceeds - pos.quantity * pos.entryPrice
  const trade: Trade = {
    entryTime: pos.entryTime,
    exitTime: Date.now() / 1000,
    entryPrice: pos.entryPrice,
    exitPrice: price,
    pnl,
    pnlPct: ((price - pos.entryPrice) / pos.entryPrice) * 100,
    side: 'LONG',
  }
  return {
    balance: portfolio.balance + proceeds,
    positions: portfolio.positions.filter((p) => p.symbol !== symbol),
    tradeHistory: [trade, ...portfolio.tradeHistory],
  }
}

export function resetPortfolio(): PaperPortfolio {
  const fresh = defaultPortfolio()
  savePortfolio(fresh)
  return fresh
}
