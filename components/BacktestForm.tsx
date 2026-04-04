'use client'
import { useState } from 'react'
import { strategies } from '@/lib/strategies'
import type { Strategy } from '@/lib/types'

export interface BacktestParams {
  symbol: string
  interval: string
  strategy: Strategy
  params: Record<string, number>
  startCapital: number
}

interface Props {
  onSubmit: (p: BacktestParams) => void
  loading?: boolean
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']
const INTERVALS = [
  { value: '1d', label: '1 Day' },
  { value: '4h', label: '4 Hours' },
  { value: '1h', label: '1 Hour' },
]

export default function BacktestForm({ onSubmit, loading }: Props) {
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [interval, setInterval] = useState('1d')
  const [strategyIdx, setStrategyIdx] = useState(0)
  const [startCapital, setStartCapital] = useState(10000)

  const strategy = strategies[strategyIdx]
  const [params, setParams] = useState<Record<string, number>>(strategy.defaultParams)

  function handleStrategyChange(idx: number) {
    setStrategyIdx(idx)
    setParams(strategies[idx].defaultParams)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ symbol, interval, strategy, params, startCapital })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-5">
      <h2 className="text-white font-semibold text-base">Configure Backtest</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Symbol */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Interval */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">Interval</label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {INTERVALS.map((iv) => (
              <option key={iv.value} value={iv.value}>{iv.label}</option>
            ))}
          </select>
        </div>

        {/* Strategy */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">Strategy</label>
          <select
            value={strategyIdx}
            onChange={(e) => handleStrategyChange(Number(e.target.value))}
            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            {strategies.map((s, i) => (
              <option key={s.name} value={i}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Start Capital */}
        <div className="flex flex-col gap-1">
          <label className="text-zinc-400 text-xs uppercase tracking-wider">Capital ($)</label>
          <input
            type="number"
            value={startCapital}
            onChange={(e) => setStartCapital(Number(e.target.value))}
            min={100}
            step={100}
            className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Strategy params */}
      <div className="flex flex-col gap-2">
        <p className="text-zinc-400 text-xs uppercase tracking-wider">Parameters</p>
        <div className="flex gap-3 flex-wrap">
          {Object.entries(params).map(([key, val]) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-zinc-400 text-xs capitalize">{key}</label>
              <input
                type="number"
                value={val}
                onChange={(e) => setParams((p) => ({ ...p, [key]: Number(e.target.value) }))}
                min={1}
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 w-24 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium text-sm rounded-lg px-6 py-2.5 transition-colors self-start"
      >
        {loading ? 'Running...' : 'Run Backtest'}
      </button>
    </form>
  )
}
