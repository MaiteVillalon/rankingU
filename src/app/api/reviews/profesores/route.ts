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
    profesor_id: string
    ramo_id?: string
    claridad: number
    puntualidad: number
    justicia: number
    comentario?: string
  }

  const { profesor_id, ramo_id, claridad, puntualidad, justicia, comentario } = body

  if (!profesor_id || !claridad || !puntualidad || !justicia) {
    return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 })
  }

  const ratings = [claridad, puntualidad, justicia]
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
  const { error } = await db.from('reviews_profesores').insert({
    user_id: user.id,
    profesor_id,
    ramo_id: ramo_id ?? null,
    claridad,
    puntualidad,
    justicia,
    comentario: comentario?.trim() || null,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya evaluaste a este profesor.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al guardar la evaluación.' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
