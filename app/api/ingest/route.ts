//.Weather station POST request
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAdminClient } from "@/lib/supabase/server"

//.Validate the incoming JSON payload
const MeasurementSchema = z.object({
    recorded_at: z.iso.datetime({ offset: true }),
    temperature: z.number().optional(),
    pressure:    z.number().optional(),
    humidity:    z.number().optional(),
    aqi:         z.number().int().optional(),
    uv:          z.number().optional(),
})

export async function POST(request: NextRequest) {
    //.1. Check API key
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== process.env.INGEST_API_KEY) {
        return NextResponse.json(
            { error: "Unauthorized" }, 
            { status: 401 }
        )
    }

    //.2. Parse and validate the body
    const body = await request.json()
    const result = MeasurementSchema.safeParse(body)
    if (!result.success) {
        return NextResponse.json(
            { error: 'Invalid payload', details: z.treeifyError(result.error) },
            { status: 400 }
        )
    }

    //.3. Insert into Supabase
    const supabase = createAdminClient()
    const { error } = await supabase
        .from("measurements")
        .insert(result.data)

    if (error) {
        return NextResponse.json(
            { error: 'Database error', details: error.message },
            { status: 500 }
        )
    }
    
    //.4. Return success
    return NextResponse.json(
        { success: true },
        { status: 201 }
    )
}