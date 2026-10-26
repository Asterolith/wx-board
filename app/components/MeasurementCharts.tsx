'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'


type Measurement = {
  id: number
  recorded_at: string
  temperature: number | null
  pressure: number | null
  humidity: number | null
  aqi: number | null
  uv: number | null
}

type ChartData = Measurement & {
  time: string
  shortDate: string
}

type ChartConfig = {
  key: keyof Omit<Measurement, 'id' | 'recorded_at'>
  label: string
  unit: string
  color: string
}

const row1: ChartConfig[] = [
  { key: 'temperature', label: 'Temperature', unit: '°C',  color: '#f97316' },
  { key: 'humidity',    label: 'Humidity',    unit: '%',   color: '#3b82f6' },
  { key: 'pressure',   label: 'Pressure',    unit: 'hPa', color: '#8b5cf6' },
]

const row2: ChartConfig[] = [
  { key: 'aqi', label: 'Air Quality', unit: 'AQI', color: '#10b981' },
  { key: 'uv',  label: 'UV Index',    unit: 'UV',  color: '#eab308' },
]

function SingleChart({
  config,
  data,
  chartData,
}: {
  config: ChartConfig
  data: ChartData[]
  chartData: ChartData[]
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
      <h2 className="text-sm font-medium text-gray-400 mb-4">
        {config.label} ({config.unit})
      </h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            width={45}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: config.color }}
            formatter={(value) => {
              const v = value as number | undefined
              return v !== undefined
                ? [`${v} ${config.unit}`, config.label]
                : ['—', config.label]
            }}
            labelFormatter={(label) => {
              const match = chartData.find((d) => d.time === label)
              return match
                ? new Date(match.recorded_at).toLocaleString('de-DE', {
                    timeZone: 'Europe/Berlin',
                    day: '2-digit', month: '2-digit', year: '2-digit',
                    hour: '2-digit', minute: '2-digit',
                  })
                : label
            }}
          />
          <Line
            type="monotone"
            dataKey={config.key}
            stroke={config.color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


export function LastConditions({ latest }: { latest: Measurement | null }) {
  if (!latest) return null

  const time = new Date(latest.recorded_at).toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  const items = [
    { label: 'Temperature', value: latest.temperature, unit: '°C',  emoji: '🌡️' },
    { label: 'Humidity',    value: latest.humidity,    unit: '%',   emoji: '💧' },
    { label: 'Pressure',    value: latest.pressure,    unit: ' hPa',emoji: '📊' },
    { label: 'Air Quality', value: latest.aqi,         unit: ' AQI',emoji: '🍃' },
    { label: 'UV Index',    value: latest.uv,           unit: ' UV', emoji: '☀️' },
  ]


  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-medium text-white">Last Conditions</h2>
        <span className="text-xs text-gray-400">{time} CEST</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {items.map(({ label, value, unit, emoji }) => (
          <div key={label} className="text-center">
            <div className="text-lg mb-1">{emoji}</div>
            <div className="text-sm font-medium text-white leading-tight">
              {value ?? '—'}{unit}
            </div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function MeasurementCharts({ data }: { data: Measurement[] }) {
  const [measurements, setMeasurements] = useState<Measurement[]>(data)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('charts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'measurements' },
        (payload) => {
          setMeasurements((current) => {
            const updated = [...current, payload.new as Measurement]
            // max 50, delete old entries
            return updated.slice(-50)
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'measurements' },
        (payload) => {
          setMeasurements((current) =>
            current.filter((m) => m.id !== payload.old.id)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const latest = measurements.length > 0
    ? [...measurements].sort(
      (a,b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )[0]
    : null

  const chartData: ChartData[] = [...measurements]
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map((m) => ({
      ...m,
      shortDate: new Date(m.recorded_at).toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
      }),
      time: new Date(m.recorded_at).toLocaleTimeString('de-DE', {
        timeZone: 'Europe/Berlin',
        hour:  '2-digit', minute:'2-digit',
      }),
  }))

  return (
    <div>
      <LastConditions latest={latest} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
        {row1.map((config) => (
          <SingleChart key={config.key} config={config} data={chartData} chartData={chartData} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {row2.map((config) => (
          <SingleChart key={config.key} config={config} data={chartData} chartData={chartData} />
        ))}
      </div>
    </div>
  )
}