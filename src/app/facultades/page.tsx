import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, GraduationCap, BookOpen, Users } from 'lucide-react'

const FACULTY_COLORS = [
  'from-blue-500 to-blue-700',
  'from-purple-500 to-purple-700',
  'from-emerald-500 to-emerald-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
  'from-cyan-500 to-cyan-700',
  'from-indigo-500 to-indigo-700',
  'from-teal-500 to-teal-700',
  'from-orange-500 to-orange-700',
  'from-pink-500 to-pink-700',
]

interface FacultadConConteos {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  carreras: { count: number }[]
}

export default async function FacultadesPage() {
  const supabase = await createClient()

  const { data: facultades } = await supabase
    .from('facultades')
    .select('id, nombre, codigo, descripcion, carreras(count)')
    .order('nombre')

  // Contar profesores por facultad en paralelo
  const facultadesConProfs = await Promise.all(
    (facultades ?? []).map(async (f) => {
      const fac = f as unknown as FacultadConConteos
      const { count } = await supabase
        .from('profesores')
        .select('*', { count: 'exact', head: true })
        .ilike('departamento', fac.nombre)
      return { ...fac, profesoresCount: count ?? 0 }
    })
  )

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <h1 className="text-4xl font-bold mb-3">Facultades</h1>
          <p className="text-blue-100 text-lg">
            Selecciona una facultad para explorar sus carreras, ramos y profesores
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facultadesConProfs.map((f, i) => {
            const carrerasCount = f.carreras?.[0]?.count ?? 0
            return (
              <Link key={f.id} href={`/facultades/${f.id}`}>
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md h-full">
                  <div className={`h-1.5 bg-gradient-to-r ${FACULTY_COLORS[i % FACULTY_COLORS.length]}`} />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-br ${FACULTY_COLORS[i % FACULTY_COLORS.length]} shrink-0`}>
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
                          {f.nombre}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{f.codigo}</p>
                      </div>
                    </div>

                    {f.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {f.descripcion}
                      </p>
                    )}

                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {carrerasCount > 0 && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {carrerasCount} carreras
                          </span>
                        )}
                        {f.profesoresCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {f.profesoresCount} profesores
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
