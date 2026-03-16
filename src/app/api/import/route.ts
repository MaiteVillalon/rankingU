import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * POST /api/import
 *
 * Importa ramos y profesores desde JSON o CSV.
 *
 * Formato JSON:
 * {
 *   "profesores": [{ "nombre": "...", "departamento": "...", "email": "..." }],
 *   "ramos": [{
 *     "nombre": "...", "codigo": "...", "creditos": 10,
 *     "carrera_codigo": "ICI",
 *     "profesores": ["Nombre Profesor 1", "Nombre Profesor 2"]
 *   }]
 * }
 *
 * Formato CSV (dos requests separados con ?type=profesores o ?type=ramos):
 *   profesores → nombre,departamento,email
 *   ramos      → nombre,codigo,creditos,carrera_codigo,profesores (separados por |)
 *
 * Requiere header: Authorization: Bearer <IMPORT_SECRET>
 */

interface ProfesorInput {
  nombre: string
  departamento?: string
  email?: string
}

interface RamoInput {
  nombre: string
  codigo: string
  creditos?: number
  carrera_codigo: string
  profesores?: string[]
}

interface ImportPayload {
  profesores?: ProfesorInput[]
  ramos?: RamoInput[]
}

function parseCsvRows(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = values[i] ?? '' })
    return row
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

async function importProfesores(
  supabase: AnyClient,
  profesores: ProfesorInput[]
): Promise<{ count: number; errores: string[] }> {
  const errores: string[] = []
  const valid = profesores.filter((p) => !!p.nombre)
  if (!valid.length) return { count: 0, errores }

  const rows = valid.map((p) => ({
    nombre: p.nombre,
    departamento: p.departamento ?? null,
    email: p.email ?? null,
  }))

  // Batch upsert in chunks of 100
  const CHUNK = 100
  let count = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error, data } = await supabase
      .from('profesores')
      .upsert(chunk, { onConflict: 'email', ignoreDuplicates: true })
      .select('id')
    if (error) errores.push(`Batch ${i / CHUNK + 1}: ${error.message}`)
    else count += data?.length ?? chunk.length
  }

  return { count, errores }
}

async function importRamos(
  supabase: AnyClient,
  ramos: RamoInput[]
): Promise<{ countRamos: number; countRelaciones: number; errores: string[] }> {
  let countRamos = 0
  let countRelaciones = 0
  const errores: string[] = []

  for (const r of ramos) {
    if (!r.nombre || !r.codigo || !r.carrera_codigo) continue

    const { data: carrera } = await supabase
      .from('carreras')
      .select('id')
      .eq('codigo', r.carrera_codigo)
      .single()

    if (!carrera) {
      errores.push(`Ramo "${r.nombre}": carrera "${r.carrera_codigo}" no encontrada.`)
      continue
    }

    const { data: ramo, error: ramoError } = await supabase
      .from('ramos')
      .upsert(
        { nombre: r.nombre, codigo: r.codigo, creditos: r.creditos ?? null, carrera_id: carrera.id },
        { onConflict: 'codigo,carrera_id' }
      )
      .select('id')
      .single()

    if (ramoError || !ramo) {
      errores.push(`Ramo "${r.nombre}": ${ramoError?.message ?? 'error desconocido'}`)
      continue
    }
    countRamos++

    for (const profNombre of r.profesores ?? []) {
      const { data: prof } = await supabase
        .from('profesores')
        .select('id')
        .ilike('nombre', profNombre)
        .single()

      if (!prof) {
        errores.push(`Profesor "${profNombre}" no encontrado para ramo "${r.nombre}".`)
        continue
      }

      await supabase
        .from('ramo_profesor')
        .upsert({ ramo_id: ramo.id, profesor_id: prof.id }, { ignoreDuplicates: true })
      countRelaciones++
    }
  }

  return { countRamos, countRelaciones, errores }
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!secret || secret !== process.env.IMPORT_SECRET) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as unknown as AnyClient
  const contentType = request.headers.get('content-type') ?? ''
  const type = request.nextUrl.searchParams.get('type')

  let payload: ImportPayload = {}

  if (contentType.includes('application/json')) {
    payload = await request.json() as ImportPayload
  } else if (contentType.includes('text/csv') || contentType.includes('text/plain')) {
    const text = await request.text()
    const rows = parseCsvRows(text)

    if (type === 'profesores') {
      payload.profesores = rows.map((r) => ({
        nombre: r.nombre,
        departamento: r.departamento || undefined,
        email: r.email || undefined,
      }))
    } else if (type === 'ramos') {
      payload.ramos = rows.map((r) => ({
        nombre: r.nombre,
        codigo: r.codigo,
        creditos: r.creditos ? parseInt(r.creditos) : undefined,
        carrera_codigo: r.carrera_codigo,
        profesores: r.profesores ? r.profesores.split('|').map((p) => p.trim()) : [],
      }))
    }
  }

  const allErrors: string[] = []
  let profesoresCount = 0
  let ramosCount = 0
  let relacionesCount = 0

  if (payload.profesores?.length) {
    const res = await importProfesores(supabase, payload.profesores)
    profesoresCount = res.count
    allErrors.push(...res.errores)
  }

  if (payload.ramos?.length) {
    const res = await importRamos(supabase, payload.ramos)
    ramosCount = res.countRamos
    relacionesCount = res.countRelaciones
    allErrors.push(...res.errores)
  }

  return NextResponse.json(
    { profesores: profesoresCount, ramos: ramosCount, relaciones: relacionesCount, errores: allErrors },
    { status: 200 }
  )
}
