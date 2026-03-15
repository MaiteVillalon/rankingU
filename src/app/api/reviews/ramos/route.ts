import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { moderateComment } from '@/lib/moderate'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const body = await request.json() as {
    ramo_id: string
    dificultad: number
    carga: number
    calidad_aprendizaje: number
    comentario?: string
  }

  const { ramo_id, dificultad, carga, calidad_aprendizaje, comentario } = body

  if (!ramo_id || !dificultad || !carga || !calidad_aprendizaje) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
  }

  const ratings = [dificultad, carga, calidad_aprendizaje]
  if (ratings.some((r) => r < 1 || r > 5 || !Number.isInteger(r))) {
    return NextResponse.json({ error: 'Las calificaciones deben ser enteros entre 1 y 5.' }, { status: 400 })
  }

  if (comentario && comentario.trim().length > 0) {
    const moderation = await moderateComment(comentario.trim())
    if (!moderation.approved) {
      return NextResponse.json(
        { error: `Comentario rechazado: ${moderation.reason}` },
        { status: 422 }
      )
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as unknown as SupabaseClient<any>
  const { error } = await db.from('reviews_ramos').insert({
    user_id: user.id,
    ramo_id,
    dificultad,
    carga,
    calidad_aprendizaje,
    comentario: comentario?.trim() || null,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya evaluaste este ramo.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al guardar la evaluación.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
