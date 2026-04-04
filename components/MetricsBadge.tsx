interface Props {
  label: string
  value: string | number
  positive?: boolean
  negative?: boolean
  neutral?: boolean
}

export default function MetricsBadge({ label, value, positive, negative, neutral }: Props) {
  const color = positive
    ? 'text-emerald-400'
    : negative
    ? 'text-red-400'
    : neutral
    ? 'text-zinc-300'
    : 'text-zinc-100'

  return (
    <div className="bg-zinc-800 rounded-lg px-4 py-3 flex flex-col gap-0.5">
      <span className="text-zinc-400 text-xs uppercase tracking-wider">{label}</span>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  )
}
