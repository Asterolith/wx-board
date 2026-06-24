import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

async function getMeasurements() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data
}

export default async function Home() {
  const measurements = await getMeasurements()

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-medium mb-6">Weather Station Dashboard</h1>

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
                    timeZone: 'Europe/Berlin'
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

      <p className="text-xs text-gray-400 mt-4">
        Showing last {measurements.length} measurements · times in CEST
      </p>
    </main>
  )
}