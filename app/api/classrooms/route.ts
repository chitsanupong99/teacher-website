import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, subject_id, subject_ids } = body

    const payload: Record<string, any> = { name }
    if (subject_ids?.length > 0) {
      payload.subject_ids = subject_ids
    } else if (subject_id) {
      payload.subject_id = subject_id
    }

    const { data, error } = await supabase.from('classrooms').insert(payload).select()
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, subject_id, subject_ids } = body

    const payload: Record<string, any> = { name }
    if (subject_ids?.length > 0) {
      payload.subject_ids = subject_ids
    } else if (subject_id) {
      payload.subject_id = subject_id
    }

    const { data, error } = await supabase
      .from('classrooms')
      .update(payload)
      .eq('id', id)
      .select()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) throw new Error('ID is required')

    // Delete related data first
    await supabase.from('attendance').delete().eq('classroom_id', id)
    await supabase.from('students').delete().eq('classroom_id', id)

    const { error } = await supabase.from('classrooms').delete().eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
