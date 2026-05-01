import { SensorReading, THRESHOLDS } from '../types'

interface ReadingsTableProps {
  data: SensorReading[]
}

export default function ReadingsTable({ data }: ReadingsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-ink-900">Recent Readings</span>
        <span className="text-[10px] font-mono text-ink-400">Last 50</span>
      </div>

      <div className="overflow-y-auto max-h-44 custom-scroll">
        <table className="w-full text-[11px] font-mono" style={{ tableLayout: 'fixed' }}>
          <thead className="sticky top-0 bg-white">
            <tr>
              {['Time', 'V', 'Cell°C', 'Amb°C', 'A', 'SoC%'].map((h, i) => (
                <th
                  key={h}
                  className="text-[10px] font-sans font-medium uppercase tracking-wider text-ink-300 pb-2 border-b border-ink-50"
                  style={{ textAlign: i === 0 ? 'left' : 'right', width: i === 0 ? '56px' : '46px' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, idx) => {
              const vAlert = r.voltage < THRESHOLDS.voltage.lo || r.voltage > THRESHOLDS.voltage.hi
              const tAlert = r.temp < THRESHOLDS.temp.lo || r.temp > THRESHOLDS.temp.hi
              const isLatest = idx === 0

              return (
                <tr key={r.ts + idx} className="border-b border-ink-50 last:border-0">
                  <td className={`py-1 text-left ${isLatest ? 'text-ink-400' : 'text-ink-200'}`}>{r.ts}</td>
                  <td className={`py-1 text-right ${vAlert ? 'text-coral-400' : isLatest ? 'text-ink-800 font-medium' : 'text-ink-400'}`}>
                    {r.voltage.toFixed(2)}
                  </td>
                  <td className={`py-1 text-right ${tAlert ? 'text-coral-400' : isLatest ? 'text-ink-800 font-medium' : 'text-ink-400'}`}>
                    {r.temp.toFixed(1)}
                  </td>
                  <td className={`py-1 text-right ${isLatest ? 'text-ink-500' : 'text-ink-300'}`}>
                    {r.ambientTemp.toFixed(1)}
                  </td>
                  <td className={`py-1 text-right ${isLatest ? 'text-ink-800 font-medium' : 'text-ink-400'}`}>
                    {r.current.toFixed(2)}
                  </td>
                  <td className={`py-1 text-right ${isLatest ? 'text-ink-800 font-medium' : 'text-ink-400'}`}>
                    {r.soc.toFixed(1)}
                  </td>
                </tr>
              )
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-5 text-center text-ink-300 font-sans">Waiting for data...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
