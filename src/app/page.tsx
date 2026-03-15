import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BookOpen, Users, Star, ArrowRight, GraduationCap, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Facultad } from '@/types'

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

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: facultades }, { count: totalProfesores }, { count: totalReviews }] =
    await Promise.all([
      supabase.from('facultades').select('*').order('nombre'),
      supabase.from('profesores').select('*', { count: 'exact', head: true }),
      supabase.from('reviews_profesores').select('*', { count: 'exact', head: true }),
    ])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <GraduationCap className="w-14 h-14 opacity-90" />
            <h1 className="text-5xl font-bold">RankingU PUCV</h1>
          </div>
          <p className="text-xl text-blue-100 mb-3">Pontificia Universidad Católica de Valparaíso</p>
          <p className="text-lg text-blue-50/80 max-w-2xl mx-auto mb-10">
            Descubre las opiniones de otros estudiantes y ayuda a tu comunidad universitaria
            compartiendo tu experiencia con los profesores y ramos.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" variant="secondary" className="gap-2 font-semibold">
              <Link href="/facultades">
                Explorar facultades
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-700 gap-2"
            >
              <Link href="/login">
                <Users className="w-4 h-4" />
                Iniciar sesión
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <div className="text-3xl font-bold">{totalProfesores ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Profesores</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <div className="text-3xl font-bold">{facultades?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Facultades</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-3xl font-bold">{totalReviews ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1">Evaluaciones</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Facultades */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Selecciona tu Facultad</h2>
          <p className="text-muted-foreground">
            Encuentra profesores y ramos organizados por facultad
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(facultades as Facultad[] | null)?.map((f, i) => (
            <Link key={f.id} href={`/facultades/${f.id}`}>
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md h-full">
                <div className={`h-1.5 bg-gradient-to-r ${FACULTY_COLORS[i % FACULTY_COLORS.length]}`} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${FACULTY_COLORS[i % FACULTY_COLORS.length]} shrink-0`}>
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
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

                  <div className="flex items-center justify-between border-t pt-3 mt-auto">
                    <span className="text-xs text-muted-foreground">Ver carreras y profesores</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-3">¿Listo para compartir tu experiencia?</h2>
          <p className="text-blue-100 mb-7">
            Inicia sesión con tu email PUCV y ayuda a la comunidad universitaria.
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2 font-semibold">
            <Link href="/login">
              <Users className="w-4 h-4" />
              Únete a la comunidad
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RankingU PUCV — Plataforma estudiantil de la Pontificia Universidad Católica de Valparaíso</p>
          <p className="text-xs mt-1 opacity-70">Mantén un lenguaje respetuoso y constructivo en todas tus evaluaciones</p>
        </div>
      </footer>
    </div>
  )
}
