import { AlertEntry } from '../types'

interface AlertsPanelProps {
  alerts: AlertEntry[]
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-4 max-h-56 overflow-y-auto custom-scroll">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-ink-900">Anomaly Alerts</span>
        <span className="text-[10px] font-mono text-ink-400">
          {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="text-center text-[12px] text-ink-300 py-5">No anomalies detected</p>
      ) : (
        <div className="space-y-0">
          {alerts.map((a) => (
            <div key={a.id} className="flex items-start gap-2 py-2 border-b border-ink-50 last:border-0">
              <div className={`w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold ${
                a.type === 'crit'
                  ? 'bg-coral-50 text-coral-600'
                  : 'bg-amber-50 text-amber-600'
              }`}>
                {a.type === 'crit' ? '!' : '~'}
              </div>
              <div>
                <p className="text-[12px] text-ink-800 leading-snug">{a.msg}</p>
                <p className="text-[10px] font-mono text-ink-300 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
