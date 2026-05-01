interface KpiCardProps {
  label: string
  unit: string
  value: number | null
  prevValue: number | null
  barColor: string
  barMax: number
  barMin: number
  thresholdLo: number
  thresholdHi: number
  decimals?: number
}

export default function KpiCard({
  label, unit, value, prevValue, barColor, barMax, barMin,
  thresholdLo, thresholdHi, decimals = 2,
}: KpiCardProps) {
  const isAlert = value !== null && (value < thresholdLo || value > thresholdHi)
  const diff = value !== null && prevValue !== null ? value - prevValue : null
  const barPct = value !== null
    ? Math.min(100, Math.max(0, ((value - barMin) / (barMax - barMin)) * 100))
    : 0

  return (
    <div className={`rounded-xl border p-4 transition-colors duration-300 ${
      isAlert
        ? 'bg-coral-50 border-coral-200'
        : 'bg-white border-ink-100'
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-widest text-ink-400">{label}</span>
        <span className="text-[10px] font-mono bg-ink-50 text-ink-400 rounded px-1 py-0.5">{unit}</span>
      </div>

      <div className={`text-[26px] font-bold font-mono leading-none tracking-tight mb-1 ${
        isAlert ? 'text-coral-600' : 'text-ink-900'
      }`}>
        {value !== null ? value.toFixed(decimals) : '--.-'}
      </div>

      <div className={`text-[11px] font-mono ${
        diff === null ? 'text-ink-200' :
        diff > 0 ? 'text-teal-400' : diff < 0 ? 'text-coral-400' : 'text-ink-400'
      }`}>
        {diff === null ? '--' : (diff > 0 ? '+' : '') + diff.toFixed(decimals)}
      </div>

      <div className="h-0.5 rounded-full bg-ink-100 mt-2.5 overflow-hidden">
        <div
          className="h-full rounded-full kpi-bar-fill"
          style={{ width: `${barPct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
