# EVident Battery Analytics Dashboard

A real-time browser-based sensor analytics dashboard simulating battery IoT telemetry — built as a portfolio piece targeting EVident Battery's sensor analytics work.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts (live charts)
- `setInterval` simulating a 1Hz IoT sensor stream

## Features

- Live updating voltage, temperature, current, and SoC charts (1 reading/sec)
- Semicircular SoC gauge with color-coded status
- Anomaly alert log (overvoltage, thermal overrun, low charge)
- Scrollable readings table (last 50 entries)
- Three switchable simulated sensor feeds (Pack A, B, C)
- Pause, Resume, and Reset controls
- Responsive layout

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

Output goes to `dist/`.

## Deploy to Vercel (recommended — free tier)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com and import the repo
3. Vercel auto-detects Vite — no config needed
4. Click Deploy

## Deploy to Netlify

1. Push to GitHub
2. Go to https://netlify.com → New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click Deploy

## Deploy via Netlify CLI (fastest)

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

## Connecting Real WebSocket Data

To replace simulated data with a real sensor stream, edit `src/hooks/useSensorStream.ts`:

Replace the `setInterval` block with a WebSocket connection:

```ts
const ws = new WebSocket('wss://your-sensor-endpoint')

ws.onmessage = (event) => {
  const reading: SensorReading = JSON.parse(event.data)
  // then call the same setLatest, setChartData, setTableData, setAlerts
}

return () => ws.close()
```

The rest of the dashboard (charts, alerts, gauge, table) will work without any changes.

## Customizing Thresholds

Edit `src/types/index.ts` — the `THRESHOLDS` object controls when KPI cards turn red and alerts fire:

```ts
export const THRESHOLDS = {
  voltage: { lo: 36, hi: 58 },
  temp:    { lo: 0,  hi: 50 },
  current: { lo: 0,  hi: 70 },
  soc:     { lo: 10, hi: 100 },
}
```

## File Structure

```
src/
  App.tsx                   — top-level layout and orchestration
  main.tsx                  — React entry point
  index.css                 — Tailwind + custom animations
  types/index.ts            — shared types, feed configs, thresholds
  hooks/
    useSensorStream.ts      — all sensor data logic (sim or real WS)
  components/
    KpiCard.tsx             — metric card with bar + trend arrow
    SocGauge.tsx            — SVG semicircular gauge
    LiveChart.tsx           — Recharts dual-axis line chart
    AlertsPanel.tsx         — scrollable anomaly alert log
    ReadingsTable.tsx       — last-50 readings table
```
