import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, BookOpen, ArrowLeft, GraduationCap } from 'lucide-react'
import type { Ramo } from '@/types'

interface Props {
  params: Promise<{ carreraId: string }>
}

interface CarreraConFacultad {
  id: string
  nombre: string
  codigo: string
  facultad_id: string
  created_at: string
  facultades: { id: string; nombre: string } | null
}

export default async function CarreraPage({ params }: Props) {
  const { carreraId } = await params
  const supabase = await createClient()

  const [{ data: carreraRaw }, { data: ramosRaw }] = await Promise.all([
    supabase
      .from('carreras')
      .select('*, facultades(id, nombre)')
      .eq('id', carreraId)
      .single(),
    supabase.from('ramos').select('*').eq('carrera_id', carreraId).order('nombre'),
  ])

  if (!carreraRaw) notFound()

  const carrera = carreraRaw as unknown as CarreraConFacultad
  const ramos = (ramosRaw ?? []) as Ramo[]

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Link
            href={`/facultades/${carrera.facultades?.id}`}
            className="inline-flex items-center text-sm text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> {carrera.facultades?.nombre}
          </Link>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 shrink-0">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0">
                {carrera.codigo}
              </Badge>
              <h1 className="text-3xl font-bold">{carrera.nombre}</h1>
              <p className="text-blue-200 text-sm mt-2">{ramos.length} ramos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ramos.map((r) => (
            <Link key={r.id} href={`/ramos/${r.id}`}>
              <Card className="group hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-2 shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
                        {r.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.codigo}</p>
                      {r.creditos && (
                        <p className="text-xs text-muted-foreground">{r.creditos} créditos</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
