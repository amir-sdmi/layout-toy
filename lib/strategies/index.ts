import smaCrossover from './sma-crossover'
import rsi from './rsi'
import macd from './macd'
import type { Strategy } from '../types'

export const strategies: Strategy[] = [smaCrossover, rsi, macd]

export const strategyMap: Record<string, Strategy> = {
  'SMA Crossover': smaCrossover,
  RSI: rsi,
  MACD: macd,
}
