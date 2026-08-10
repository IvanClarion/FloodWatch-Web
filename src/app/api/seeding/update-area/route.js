import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { municipality_id, name, latitude, longitude } = body

    if (!municipality_id) {
      return NextResponse.json(
        { success: false, error: 'Missing municipality_id.' },
        { status: 400 }
      )
    }

    const latNum = parseFloat(latitude)
    const lngNum = parseFloat(longitude)

    if (isNaN(latNum) || isNaN(lngNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid numeric coordinates provided.' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_SERVICE_ROLE_KEY
    )

    const updatePayload = {
      center_latitude: latNum,
      center_longitude: lngNum,
      updated_at: new Date().toISOString()
    }

    if (name && name.trim()) {
      updatePayload.name = name.trim()
    }

    const { data, error } = await supabase
      .from('municipality_or_city')
      .update(updatePayload)
      .eq('municipality_id', municipality_id)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, message: 'Area updated successfully.', data })
  } catch (err) {
    console.error("API update-area error:", err)
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update area record.' },
      { status: 500 }
    )
  }
}
