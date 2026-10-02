import { createClient } from '@/lib/supabase/server'
import MeasurementsTable from '@/app/components/MeasurementsTable'
import MeasurementCharts, { CurrentConditions } from '@/app/components/MeasurementCharts'

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
  const latest = measurements[0] ?? null

  return (
    <main className="max-w-6xl mx-auto p-6 bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-medium text-white mb-6">
        Weather Station Dashboard
      </h1>

      {/* Current conditions card */}
      <CurrentConditions latest={latest} />

      {/* Charts */}
      <MeasurementCharts data={measurements} />

      {/* Table */}
      <div className="mt-8">
        <MeasurementsTable initial={measurements} />
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Showing last {measurements.length} measurements · times in CEST · live updates enabled
      </p>
    </main>
  )
}