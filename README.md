# Battery Analytics Dashboard

A real-time browser-based sensor analytics dashboard for battery pack monitoring. Streams live telemetry at 1Hz, drives a physics-based battery model from real ambient weather data, and surfaces anomalies through an alert system — all running entirely in the browser with no backend required.

## Demo

Three switchable sensor feeds (Pack A, B, C) each with different thermal characteristics, load profiles, and capacity. Ambient temperature is pulled from a live weather API and used as the thermal input to the battery model — everything else is derived from it.

## Features

- Live line chart showing voltage, cell temperature, and ambient temperature
- Semicircular state-of-charge gauge with color-coded status (nominal / low / critical)
- KPI cards for voltage, cell temp, current, and SoC with trend arrows and threshold alerts
- Anomaly alert log with warning and critical severity levels
- Scrollable readings table showing the last 50 sensor entries
- Pause, resume, and reset controls
- Weather badge showing real ambient temp and last fetch time

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Open-Meteo API (free, no API key required)

## How the Data Works

Ambient temperature is fetched from Open-Meteo every 10 minutes for a configurable location. A physics model runs at 1Hz to derive:

- **Cell temperature** — ambient + self-heating from current draw, modulated by thermal mass (Newton's law of cooling)
- **Current** — sinusoidal charge/discharge cycle with pack-specific period and amplitude
- **Voltage** — nominal voltage minus SoC sag minus thermal sag, matching real Li-ion behavior
- **State of charge** — coulomb counting, draining proportionally to current draw over time

Pack state (SoC and cell temp) carries forward tick to tick so readings behave like a continuous system rather than independent samples.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to Vercel

```bash
npm run build
npx vercel --prod
```

Or import the repo directly at vercel.com — Vite is auto-detected, no configuration needed.

## Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

Or connect the repo at netlify.com with build command `npm run build` and publish directory `dist`.

## Configuration

**Location** — edit `src/types/index.ts`:
```ts
export const LOCATION = { lat: 29.7604, lon: -95.3698, name: 'Houston, TX' }
```

**Thresholds** — also in `src/types/index.ts`:
```ts
export const THRESHOLDS = {
  voltage: { lo: 30, hi: 58 },
  temp:    { lo: 0,  hi: 55 },
  current: { lo: 0,  hi: 80 },
  soc:     { lo: 10, hi: 100 },
}
```

**Pack profiles** — the `PACKS` object in the same file controls thermal mass, load amplitude, cycle period, nominal voltage, and capacity for each sensor feed.

## Connecting Real Sensor Data

To replace the simulated model with a live WebSocket stream, edit `src/hooks/useSensorStream.ts` and replace the `setInterval` block:

```ts
const ws = new WebSocket('wss://your-sensor-endpoint')

ws.onmessage = (event) => {
  const reading: SensorReading = JSON.parse(event.data)
  setLatest(reading)
  setChartData(prev => [...prev.slice(-MAX_CHART_PTS), { ...reading, time: reading.ts }])
  setTableData(prev => [reading, ...prev].slice(0, MAX_TABLE_ROWS))
  const newAlerts = checkAlerts(reading, feedRef.current)
  if (newAlerts.length > 0) setAlerts(prev => [...newAlerts, ...prev].slice(0, MAX_ALERTS))
}

return () => ws.close()
```

The rest of the dashboard — charts, gauge, alerts, table — requires no changes.

## Project Structure

```
src/
  App.tsx                        top-level layout and orchestration
  main.tsx                       React entry point
  index.css                      Tailwind base + custom animations
  types/
    index.ts                     shared types, pack configs, thresholds, location
  hooks/
    useSensorStream.ts           sensor data logic — swap this for real WebSocket
  components/
    KpiCard.tsx                  metric tile with fill bar and trend arrow
    SocGauge.tsx                 SVG semicircular gauge
    LiveChart.tsx                Recharts dual-axis line chart
    AlertsPanel.tsx              scrollable anomaly alert log
    ReadingsTable.tsx            last-50 readings table with anomaly highlighting
```
