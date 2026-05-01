import { useState, useEffect, useCallback, useRef } from 'react'
import {
  FeedKey, SensorReading, ChartPoint, AlertEntry,
  PACKS, THRESHOLDS, MAX_CHART_PTS, MAX_TABLE_ROWS, MAX_ALERTS, LOCATION,
} from '../types'

let alertIdCounter = 0

// ---------------------------------------------------------------------------
// Open-Meteo fetch — real current temperature for Houston, no API key needed
// ---------------------------------------------------------------------------
async function fetchAmbientTemp(): Promise<number> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${LOCATION.lat}&longitude=${LOCATION.lon}` +
    `&current=temperature_2m` +
    `&temperature_unit=celsius` +
    `&timezone=America%2FChicago`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Open-Meteo fetch failed')
  const data = await res.json()
  return data.current.temperature_2m as number
}

// ---------------------------------------------------------------------------
// Battery physics model
// ---------------------------------------------------------------------------

interface PackState {
  soc: number         // current SoC %
  cellTemp: number    // current cell temp degC
}

function noise(amp: number): number {
  return (Math.random() - 0.5) * 2 * amp
}

function computeReading(
  feed: FeedKey,
  state: PackState,
  ambientTemp: number,
  elapsed: number,
): { reading: SensorReading; nextState: PackState } {
  const pack = PACKS[feed]

  // Current: sinusoidal charge/discharge cycle
  const current = pack.baseLoad
    + Math.sin((elapsed / pack.loadPeriod) * 2 * Math.PI) * pack.loadAmplitude
    + noise(1.5)

  // Thermal model: cell temp drifts toward (ambient + self-heating from load)
  const heatTarget = ambientTemp + Math.abs(current) * pack.selfHeating
  const nextCellTemp =
    state.cellTemp + (heatTarget - state.cellTemp) * pack.thermalMass + noise(0.15)

  // Voltage: nominal - SoC sag - temp sag + noise
  const voltage =
    pack.nominalVoltage
    - (100 - state.soc) * pack.voltageDropPerSoC
    + (nextCellTemp - 25) * pack.tempVoltageCoeff
    + noise(0.12)

  // SoC: drain proportional to current draw (coulomb counting, 1s tick)
  // socCapacity is in Ah, current in A, tick is 1s = 1/3600 h
  const socDrain = (current / (pack.socCapacity * 3600)) * 100
  const nextSoc = Math.max(3, Math.min(100, state.soc - socDrain))

  const pad = (n: number) => String(n).padStart(2, '0')
  const d = new Date()
  const ts = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

  const reading: SensorReading = {
    ts,
    voltage:     parseFloat(Math.max(0, voltage).toFixed(2)),
    temp:        parseFloat(nextCellTemp.toFixed(1)),
    ambientTemp: parseFloat(ambientTemp.toFixed(1)),
    current:     parseFloat(Math.max(0, current).toFixed(2)),
    soc:         parseFloat(nextSoc.toFixed(1)),
  }

  return {
    reading,
    nextState: { soc: nextSoc, cellTemp: nextCellTemp },
  }
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
function checkAlerts(reading: SensorReading, feed: FeedKey): AlertEntry[] {
  const alerts: AlertEntry[] = []
  const { ts } = reading

  if (reading.voltage > THRESHOLDS.voltage.hi)
    alerts.push({ id: alertIdCounter++, type: 'crit', msg: `Pack ${feed}: Overvoltage ${reading.voltage.toFixed(2)}V (limit ${THRESHOLDS.voltage.hi}V)`, time: ts })
  else if (reading.voltage < THRESHOLDS.voltage.lo)
    alerts.push({ id: alertIdCounter++, type: 'warn', msg: `Pack ${feed}: Low voltage ${reading.voltage.toFixed(2)}V`, time: ts })

  if (reading.temp > THRESHOLDS.temp.hi)
    alerts.push({ id: alertIdCounter++, type: 'crit', msg: `Pack ${feed}: Thermal overrun ${reading.temp.toFixed(1)}°C (ambient ${reading.ambientTemp.toFixed(1)}°C)`, time: ts })
  else if (reading.temp > THRESHOLDS.temp.hi - 5)
    alerts.push({ id: alertIdCounter++, type: 'warn', msg: `Pack ${feed}: Elevated cell temp ${reading.temp.toFixed(1)}°C`, time: ts })

  if (reading.soc < 10)
    alerts.push({ id: alertIdCounter++, type: 'crit', msg: `Pack ${feed}: Critical SoC ${reading.soc.toFixed(1)}%`, time: ts })
  else if (reading.soc < 20)
    alerts.push({ id: alertIdCounter++, type: 'warn', msg: `Pack ${feed}: Low SoC ${reading.soc.toFixed(1)}%`, time: ts })

  return alerts
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export interface WeatherStatus {
  status: 'loading' | 'ok' | 'error'
  ambientTemp: number | null
  lastFetched: string | null
}

export function useSensorStream() {
  const [feed, setFeed] = useState<FeedKey>('A')
  const [paused, setPaused] = useState(false)
  const [tickCount, setTickCount] = useState(0)
  const [latest, setLatest] = useState<SensorReading | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [tableData, setTableData] = useState<SensorReading[]>([])
  const [alerts, setAlerts] = useState<AlertEntry[]>([])
  const [weather, setWeather] = useState<WeatherStatus>({ status: 'loading', ambientTemp: null, lastFetched: null })

  const pausedRef    = useRef(false)
  const feedRef      = useRef<FeedKey>('A')
  const startRef     = useRef(Date.now())
  const ambientRef   = useRef<number>(28)   // fallback until first fetch
  const packStateRef = useRef<Record<FeedKey, PackState>>({
    A: { soc: PACKS.A.initSoc, cellTemp: 30 },
    B: { soc: PACKS.B.initSoc, cellTemp: 36 },
    C: { soc: PACKS.C.initSoc, cellTemp: 47 },
  })

  pausedRef.current = paused
  feedRef.current   = feed

  // Fetch real ambient temp from Open-Meteo every 10 minutes
  const refreshWeather = useCallback(async () => {
    try {
      const temp = await fetchAmbientTemp()
      ambientRef.current = temp
      const now = new Date()
      const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      setWeather({ status: 'ok', ambientTemp: temp, lastFetched: ts })
    } catch {
      setWeather(prev => ({ ...prev, status: 'error' }))
    }
  }, [])

  useEffect(() => {
    refreshWeather()
    const weatherInterval = setInterval(refreshWeather, 10 * 60 * 1000)
    return () => clearInterval(weatherInterval)
  }, [refreshWeather])

  const reset = useCallback(() => {
    startRef.current = Date.now()
    setTickCount(0)
    setLatest(null)
    setChartData([])
    setTableData([])
    setAlerts([])
    packStateRef.current = {
      A: { soc: PACKS.A.initSoc, cellTemp: ambientRef.current + 5 },
      B: { soc: PACKS.B.initSoc, cellTemp: ambientRef.current + 8 },
      C: { soc: PACKS.C.initSoc, cellTemp: ambientRef.current + 12 },
    }
  }, [])

  const switchFeed = useCallback((newFeed: FeedKey) => {
    setFeed(newFeed)
    feedRef.current = newFeed
    startRef.current = Date.now()
    setTickCount(0)
    setLatest(null)
    setChartData([])
    setTableData([])
    setAlerts([])
  }, [])

  // 1Hz sensor tick
  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return

      const f = feedRef.current
      const elapsed = (Date.now() - startRef.current) / 1000
      const currentPackState = packStateRef.current[f]

      const { reading, nextState } = computeReading(f, currentPackState, ambientRef.current, elapsed)
      packStateRef.current = { ...packStateRef.current, [f]: nextState }

      const newAlerts = checkAlerts(reading, f)

      setLatest(reading)
      setTickCount(c => c + 1)

      setChartData(prev => {
        const next = [...prev, {
          time:        reading.ts.slice(-5),
          voltage:     reading.voltage,
          temp:        reading.temp,
          ambientTemp: reading.ambientTemp,
          current:     reading.current,
          soc:         reading.soc,
        }]
        return next.length > MAX_CHART_PTS ? next.slice(-MAX_CHART_PTS) : next
      })

      setTableData(prev => {
        const next = [reading, ...prev]
        return next.length > MAX_TABLE_ROWS ? next.slice(0, MAX_TABLE_ROWS) : next
      })

      if (newAlerts.length > 0) {
        setAlerts(prev => {
          const next = [...newAlerts, ...prev]
          return next.length > MAX_ALERTS ? next.slice(0, MAX_ALERTS) : next
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return { feed, paused, tickCount, latest, chartData, tableData, alerts, weather, setPaused, switchFeed, reset }
}
