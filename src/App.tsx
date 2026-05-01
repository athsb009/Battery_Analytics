import { useRef } from 'react'
import { useSensorStream } from './hooks/useSensorStream'
import { PACKS, FeedKey, THRESHOLDS, LOCATION } from './types'
import KpiCard from './components/KpiCard'
import SocGauge from './components/SocGauge'
import LiveChart from './components/LiveChart'
import AlertsPanel from './components/AlertsPanel'
import ReadingsTable from './components/ReadingsTable'

const FEED_KEYS: FeedKey[] = ['A', 'B', 'C']

export default function App() {
  const { feed, paused, tickCount, latest, chartData, tableData, alerts, weather, setPaused, switchFeed, reset } =
    useSensorStream()

  const prevReading = useRef<typeof latest>(null)
  const prev = prevReading.current
  prevReading.current = latest

  return (
    <div className="min-h-screen bg-ink-50 font-sans text-ink-900">

      {/* Header */}
      <header className="bg-white border-b border-ink-100 px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-teal-400 rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="5" width="10" height="7" rx="1.5" stroke="white" strokeWidth="1.2"/>
              <path d="M12 7.5h1.5a.5.5 0 0 1 0 2H12" stroke="white" strokeWidth="1.2"/>
              <path d="M5 5V3.5M8 5V3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M4.5 9l1.5-2 1.5 1.5L9 7" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <span className="text-[11px] text-ink-400 ml-1.5">Battery Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Weather / Open-Meteo badge */}
          <div className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full border ${
            weather.status === 'loading' ? 'bg-ink-50 border-ink-200 text-ink-400' :
            weather.status === 'error'   ? 'bg-coral-50 border-coral-200 text-coral-600' :
                                           'bg-blue-50 border-blue-200 text-blue-600'
          }`}>
            <span className="text-[10px]">{weather.status === 'error' ? 'WX ERR' : 'WX'}</span>
            {weather.status === 'ok' && weather.ambientTemp !== null
              ? <span className="font-medium">{weather.ambientTemp.toFixed(1)}°C — {LOCATION.name}</span>
              : <span>{weather.status === 'loading' ? 'fetching...' : 'unavailable'}</span>
            }
            {weather.lastFetched && (
              <span className="text-blue-400 ml-1">@ {weather.lastFetched}</span>
            )}
          </div>

          {/* Live badge */}
          <div className={`flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-full border ${
            paused
              ? 'bg-ink-50 border-ink-200 text-ink-400'
              : 'bg-teal-50 border-teal-200 text-teal-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              paused ? 'bg-ink-300 live-dot-paused' : 'bg-teal-400 live-dot'
            }`} />
            {paused ? 'PAUSED' : 'LIVE'}
          </div>

          <button
            onClick={() => setPaused(p => !p)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors ${
              paused
                ? 'bg-teal-50 border-teal-200 text-teal-700'
                : 'bg-white border-ink-200 text-ink-700 hover:bg-ink-50'
            }`}
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 text-[12px] font-medium rounded-lg border bg-white border-coral-200 text-coral-600 hover:bg-coral-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 space-y-3.5 max-w-[1400px] mx-auto">

        {/* Feed selector row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium uppercase tracking-widest text-ink-400">Sensor Feed</span>
            <div className="flex gap-1.5 flex-wrap">
              {FEED_KEYS.map(k => (
                <button
                  key={k}
                  onClick={() => switchFeed(k)}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all ${
                    feed === k
                      ? 'bg-blue-600 text-blue-50 border-blue-600'
                      : 'bg-white text-ink-500 border-ink-200 hover:bg-ink-50'
                  }`}
                >
                  {PACKS[k].label}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[10px] font-mono text-ink-300">
            {tickCount} {tickCount === 1 ? 'reading' : 'readings'}
          </span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2.5">
          <KpiCard
            label="Voltage" unit="V"
            value={latest?.voltage ?? null}
            prevValue={prev?.voltage ?? null}
            barColor="#378ADD" barMin={28} barMax={60}
            thresholdLo={THRESHOLDS.voltage.lo} thresholdHi={THRESHOLDS.voltage.hi}
            decimals={2}
          />
          <KpiCard
            label="Cell Temp" unit="°C"
            value={latest?.temp ?? null}
            prevValue={prev?.temp ?? null}
            barColor="#D85A30" barMin={0} barMax={65}
            thresholdLo={THRESHOLDS.temp.lo} thresholdHi={THRESHOLDS.temp.hi}
            decimals={1}
          />
          <KpiCard
            label="Current" unit="A"
            value={latest?.current ?? null}
            prevValue={prev?.current ?? null}
            barColor="#9FE1CB" barMin={0} barMax={80}
            thresholdLo={THRESHOLDS.current.lo} thresholdHi={THRESHOLDS.current.hi}
            decimals={2}
          />
          <KpiCard
            label="State of Charge" unit="%"
            value={latest?.soc ?? null}
            prevValue={prev?.soc ?? null}
            barColor="#1D9E75" barMin={0} barMax={100}
            thresholdLo={THRESHOLDS.soc.lo} thresholdHi={THRESHOLDS.soc.hi}
            decimals={1}
          />
        </div>

        {/* Charts row */}
        <div className="grid gap-3.5" style={{ gridTemplateColumns: '1fr 280px' }}>
          <div className="bg-white rounded-xl border border-ink-100 p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <span className="text-[13px] font-semibold text-ink-900">Voltage & Temperature — Live Stream</span>
              <div className="flex items-center gap-3 text-[11px] text-ink-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />
                  Voltage (V)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-coral-400 inline-block" />
                  Cell temp (°C)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ink-400 inline-block" />
                  Ambient (°C)
                </span>
              </div>
            </div>
            <LiveChart data={chartData} />
          </div>

          <div className="bg-white rounded-xl border border-ink-100 p-4">
            <span className="text-[13px] font-semibold text-ink-900">State of Charge</span>
            <SocGauge soc={latest?.soc ?? null} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-3.5">
          <AlertsPanel alerts={alerts} />
          <ReadingsTable data={tableData} />
        </div>

      </main>
    </div>
  )
}
