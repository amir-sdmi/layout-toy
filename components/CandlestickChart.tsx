'use client'
import { useEffect, useRef } from 'react'
import type { Candle, Trade } from '@/lib/types'

interface Props {
  candles: Candle[]
  trades?: Trade[]
  height?: number
}

export default function CandlestickChart({ candles, trades = [], height = 300 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !candles.length) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any = null

    import('lightweight-charts').then(({ createChart, CrosshairMode }) => {
      if (!containerRef.current) return

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: { background: { color: '#09090b' }, textColor: '#a1a1aa' },
        grid: { vertLines: { color: '#27272a' }, horzLines: { color: '#27272a' } },
        crosshair: { mode: CrosshairMode.Normal },
        rightPriceScale: { borderColor: '#3f3f46' },
        timeScale: { borderColor: '#3f3f46', timeVisible: true },
      })

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#34d399',
        downColor: '#f87171',
        borderUpColor: '#34d399',
        borderDownColor: '#f87171',
        wickUpColor: '#34d399',
        wickDownColor: '#f87171',
      })

      candleSeries.setData(
        candles.map((c) => ({
          time: c.time as import('lightweight-charts').Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      )

      // Add trade markers
      if (trades.length > 0) {
        const markers = trades.flatMap((t) => [
          {
            time: t.entryTime as import('lightweight-charts').Time,
            position: 'belowBar' as const,
            color: '#34d399',
            shape: 'arrowUp' as const,
            text: 'BUY',
          },
          {
            time: t.exitTime as import('lightweight-charts').Time,
            position: 'aboveBar' as const,
            color: '#f87171',
            shape: 'arrowDown' as const,
            text: 'SELL',
          },
        ])
        markers.sort((a, b) => (a.time as number) - (b.time as number))
        candleSeries.setMarkers(markers)
      }

      chart.timeScale().fitContent()

      const ro = new ResizeObserver(() => {
        if (containerRef.current && chart) {
          chart.applyOptions({ width: containerRef.current.clientWidth })
        }
      })
      ro.observe(containerRef.current)

      return () => ro.disconnect()
    })

    return () => {
      chart?.remove()
    }
  }, [candles, trades, height])

  return <div ref={containerRef} style={{ height }} className="w-full rounded-lg overflow-hidden" />
}
