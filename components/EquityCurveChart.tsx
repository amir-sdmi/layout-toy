'use client'
import { useEffect, useRef } from 'react'

interface Point {
  time: number
  value: number
}

interface Props {
  data: Point[]
  height?: number
}

export default function EquityCurveChart({ data, height = 200 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !data.length) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let chart: any = null

    import('lightweight-charts').then(({ createChart }) => {
      if (!containerRef.current) return

      chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height,
        layout: { background: { color: '#09090b' }, textColor: '#a1a1aa' },
        grid: { vertLines: { color: '#27272a' }, horzLines: { color: '#27272a' } },
        rightPriceScale: { borderColor: '#3f3f46' },
        timeScale: { borderColor: '#3f3f46', timeVisible: true },
      })

      const lineSeries = chart.addLineSeries({
        color: '#818cf8',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: 0, minMove: 1 },
      })

      lineSeries.setData(
        data.map((p) => ({
          time: p.time as import('lightweight-charts').Time,
          value: p.value,
        }))
      )

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
  }, [data, height])

  return <div ref={containerRef} style={{ height }} className="w-full rounded-lg overflow-hidden" />
}
