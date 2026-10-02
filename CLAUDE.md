@AGENTS.md

# WX-Board Weather Dashboard

## Stack
- Next.js 16 (App Router, TypeScript)
- Supabase (PostgreSQL + Realtime)
- Tailwind CSS
- Recharts

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — run ESLint

## Key files
- `app/api/ingest/route.ts` — POST endpoint for weather station data
- `app/components/MeasurementCharts.tsx` — charts + current conditions card
- `app/components/MeasurementsTable.tsx` — realtime data table
- `lib/supabase/` — Supabase client setup

## Environment variables
See `.env.local` (never commit this file)