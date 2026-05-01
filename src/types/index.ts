export type FeedKey = 'A' | 'B' | 'C'

export interface SensorReading {
  ts: string
  voltage: number
  temp: number        // cell temperature (degC)
  ambientTemp: number // real ambient from Open-Meteo (degC)
  current: number
  soc: number
}

export interface ChartPoint {
  time: string
  voltage: number
  temp: number
  ambientTemp: number
  current: number
  soc: number
}

export interface AlertEntry {
  id: number
  type: 'crit' | 'warn'
  msg: string
  time: string
}

export interface PackConfig {
  label: string
  thermalMass: number
  selfHeating: number
  baseLoad: number
  loadAmplitude: number
  loadPeriod: number
  nominalVoltage: number
  voltageDropPerSoC: number
  tempVoltageCoeff: number
  initSoc: number
  socCapacity: number
}

export const PACKS: Record<FeedKey, PackConfig> = {
  A: {
    label: 'Pack A — Cell Cluster 1',
    thermalMass: 0.08,
    selfHeating: 0.12,
    baseLoad: 38,
    loadAmplitude: 18,
    loadPeriod: 90,
    nominalVoltage: 52.0,
    voltageDropPerSoC: 0.06,
    tempVoltageCoeff: -0.018,
    initSoc: 78,
    socCapacity: 200,
  },
  B: {
    label: 'Pack B — Cell Cluster 2',
    thermalMass: 0.12,
    selfHeating: 0.18,
    baseLoad: 55,
    loadAmplitude: 25,
    loadPeriod: 60,
    nominalVoltage: 48.0,
    voltageDropPerSoC: 0.05,
    tempVoltageCoeff: -0.022,
    initSoc: 62,
    socCapacity: 160,
  },
  C: {
    label: 'Pack C — Thermal Zone',
    thermalMass: 0.05,
    selfHeating: 0.08,
    baseLoad: 22,
    loadAmplitude: 10,
    loadPeriod: 120,
    nominalVoltage: 36.0,
    voltageDropPerSoC: 0.04,
    tempVoltageCoeff: -0.015,
    initSoc: 91,
    socCapacity: 280,
  },
}

export const THRESHOLDS = {
  voltage: { lo: 30, hi: 58 },
  temp:    { lo: 0,  hi: 55 },
  current: { lo: 0,  hi: 80 },
  soc:     { lo: 10, hi: 100 },
}

export const MAX_CHART_PTS = 40
export const MAX_TABLE_ROWS = 50
export const MAX_ALERTS = 20

// Houston coordinates for Open-Meteo (no API key required)
export const LOCATION = { lat: 29.7604, lon: -95.3698, name: 'Houston, TX' }
