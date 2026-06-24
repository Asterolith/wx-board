import { createClient } from '@/lib/supabase/server'
import MeasurementsTable from '@/app/components/MeasurementsTable'

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
      <h1 className="text-2xl font-medium mb-6">
        Weather Station Dashboard</h1>

      <MeasurementsTable initial={measurements} />

      <p className="text-xs text-gray-400 mt-4">
        Showing last {measurements.length} measurements · times in CEST live updates enabled
      </p>
    </main>
  )
}