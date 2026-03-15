interface Props {
  value: number
  max?: number
}

export function RatingBar({ value, max = 5 }: Props) {
  const pct = Math.round((value / max) * 100)

  const color =
    value >= 4.5
      ? 'bg-green-500'
      : value >= 3.5
        ? 'bg-blue-500'
        : value >= 2.5
          ? 'bg-yellow-500'
          : value >= 1.5
            ? 'bg-orange-500'
            : 'bg-red-500'

  return (
    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}
