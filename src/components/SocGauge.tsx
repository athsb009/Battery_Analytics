interface SocGaugeProps {
  soc: number | null
}

export default function SocGauge({ soc }: SocGaugeProps) {
  const pct = soc ?? 0
  const totalLen = 220
  const filled = (pct / 100) * totalLen
  const dashOffset = totalLen - filled

  const getColor = () => {
    if (pct >= 50) return '#1D9E75'
    if (pct >= 20) return '#BA7517'
    return '#D85A30'
  }

  const getStatus = () => {
    if (soc === null) return { label: 'Awaiting data', cls: 'bg-ink-50 text-ink-400' }
    if (pct >= 50) return { label: 'Nominal', cls: 'bg-teal-50 text-teal-600' }
    if (pct >= 20) return { label: 'Low Charge', cls: 'bg-amber-50 text-amber-600' }
    return { label: 'Critical', cls: 'bg-coral-50 text-coral-600' }
  }

  const status = getStatus()

  return (
    <div className="flex flex-col items-center justify-center pt-3">
      <svg
        width="180"
        height="120"
        viewBox="0 0 180 120"
        className="overflow-visible"
        role="img"
        aria-label={`Battery state of charge gauge showing ${pct.toFixed(1)}%`}
      >
        {/* Track */}
        <path
          d="M20 110 A70 70 0 0 1 160 110"
          fill="none"
          stroke="#E1F5EE"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Fill arc */}
        <path
          d="M20 110 A70 70 0 0 1 160 110"
          fill="none"
          stroke={getColor()}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={totalLen}
          strokeDashoffset={dashOffset}
          className="gauge-arc"
        />
        {/* Value text */}
        <text
          x="90"
          y="95"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
          fill="#2C2C2A"
        >
          {soc !== null ? soc.toFixed(1) + '%' : '--%'}
        </text>
        <text
          x="90"
          y="110"
          textAnchor="middle"
          fontSize="10"
          fontFamily="'Syne', sans-serif"
          fill="#888780"
        >
          STATE OF CHARGE
        </text>
      </svg>

      <span className={`mt-2.5 text-[12px] font-medium px-4 py-1 rounded-full ${status.cls}`}>
        {status.label}
      </span>
    </div>
  )
}
