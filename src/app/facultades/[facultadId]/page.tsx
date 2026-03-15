import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, GraduationCap, ArrowLeft, BookOpen } from 'lucide-react'
import type { Facultad, Carrera } from '@/types'

interface Props {
  params: Promise<{ facultadId: string }>
}

export default async function FacultadPage({ params }: Props) {
  const { facultadId } = await params
  const supabase = await createClient()

  const [{ data: facultadRaw }, { data: carrerasRaw }] = await Promise.all([
    supabase.from('facultades').select('*').eq('id', facultadId).single(),
    supabase.from('carreras').select('*').eq('facultad_id', facultadId).order('nombre'),
  ])

  if (!facultadRaw) notFound()

  const facultad = facultadRaw as Facultad
  const carreras = (carrerasRaw ?? []) as Carrera[]

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link
            href="/facultades"
            className="inline-flex items-center text-sm text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Todas las facultades
          </Link>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 shrink-0">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0">
                {facultad.codigo}
              </Badge>
              <h1 className="text-3xl font-bold">{facultad.nombre}</h1>
              {facultad.descripcion && (
                <p className="text-blue-100 mt-2 max-w-2xl">{facultad.descripcion}</p>
              )}
              <p className="text-blue-200 text-sm mt-3">{carreras.length} carreras</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {carreras.map((c) => (
            <Link key={c.id} href={`/carreras/${c.id}`}>
              <Card className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-xl p-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold group-hover:text-primary transition-colors">{c.nombre}</p>
                      <p className="text-sm text-muted-foreground">{c.codigo}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
