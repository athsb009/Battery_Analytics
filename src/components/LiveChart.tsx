import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartPoint } from '../types'

interface LiveChartProps {
  data: ChartPoint[]
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-ink-900 text-white rounded-lg px-3 py-2 text-[11px] font-mono shadow-lg">
      <p className="text-ink-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(p.name.includes('°C') ? 1 : 2)}
        </p>
      ))}
    </div>
  )
}

export default function LiveChart({ data }: LiveChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,135,128,0.15)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#888780' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          yAxisId="v"
          orientation="left"
          tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#378ADD' }}
          tickLine={false}
          axisLine={false}
          width={36}
          domain={['auto', 'auto']}
        />
        <YAxis
          yAxisId="t"
          orientation="right"
          tick={{ fontFamily: 'JetBrains Mono', fontSize: 9, fill: '#D85A30' }}
          tickLine={false}
          axisLine={false}
          width={36}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />

        <Line
          yAxisId="v"
          type="monotone"
          dataKey="voltage"
          name="Voltage (V)"
          stroke="#378ADD"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          yAxisId="t"
          type="monotone"
          dataKey="temp"
          name="Cell temp (°C)"
          stroke="#D85A30"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
          strokeDasharray="4 2"
        />
        <Line
          yAxisId="t"
          type="monotone"
          dataKey="ambientTemp"
          name="Ambient (°C)"
          stroke="#888780"
          strokeWidth={1}
          dot={false}
          isAnimationActive={false}
          strokeDasharray="2 4"
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
