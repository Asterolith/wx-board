'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Measurement = {
  id: number
  recorded_at: string
  temperature: number | null
  pressure: number | null
  humidity: number | null
  aqi: number | null
  uv: number | null
}

export default function MeasurementsTable({
  initial,
}: {
  initial: Measurement[]
}) {
  const [measurements, setMeasurements] = useState<Measurement[]>(initial)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('measurements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'measurements',
        },
        (payload) => {
          setMeasurements((current) => [
            payload.new as Measurement,
            ...current,
          ])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-right">Temp (°C)</th>
            <th className="px-4 py-3 text-right">Pressure (hPa)</th>
            <th className="px-4 py-3 text-right">Humidity (%)</th>
            <th className="px-4 py-3 text-right">AQI</th>
            <th className="px-4 py-3 text-right">UV</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {measurements.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600">
                {new Date(m.recorded_at).toLocaleString('de-DE', {
                  timeZone: 'Europe/Berlin',
                })}
              </td>
              <td className="px-4 py-3 text-right">{m.temperature ?? '—'}</td>
              <td className="px-4 py-3 text-right">{m.pressure ?? '—'}</td>
              <td className="px-4 py-3 text-right">{m.humidity ?? '—'}</td>
              <td className="px-4 py-3 text-right">{m.aqi ?? '—'}</td>
              <td className="px-4 py-3 text-right">{m.uv ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}