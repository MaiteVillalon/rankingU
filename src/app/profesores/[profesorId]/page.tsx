import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RatingBar } from '@/components/RatingBar'
import { ProfesorReviewForm } from '@/components/ProfesorReviewForm'
import { ArrowLeft, MessageSquare, BookOpen, Star, TrendingUp, ThumbsUp, Lock } from 'lucide-react'
import { formatRating, getInitials } from '@/lib/utils'
import type { Profesor, Ramo } from '@/types'

interface Props {
  params: Promise<{ profesorId: string }>
}

interface ReviewProfesor {
  id: string
  user_id: string
  profesor_id: string
  ramo_id: string | null
  claridad: number
  puntualidad: number
  justicia: number
  comentario: string | null
  created_at: string
}

export default async function ProfesorPage({ params }: Props) {
  const { profesorId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profesorRaw }, { data: reviewsRaw }, { data: ramosRel }] = await Promise.all([
    supabase.from('profesores').select('*').eq('id', profesorId).single(),
    supabase
      .from('reviews_profesores')
      .select('*')
      .eq('profesor_id', profesorId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ramo_profesor')
      .select('ramos(*)')
      .eq('profesor_id', profesorId),
  ])

  if (!profesorRaw) notFound()

  const profesor = profesorRaw as Profesor
  const reviews = (reviewsRaw ?? []) as ReviewProfesor[]
  const ramos = (ramosRel ?? []).map(
    (r) => (r as unknown as { ramos: Ramo }).ramos
  )

  const avgClaridad = reviews.length
    ? reviews.reduce((s, r) => s + r.claridad, 0) / reviews.length
    : null
  const avgPuntualidad = reviews.length
    ? reviews.reduce((s, r) => s + r.puntualidad, 0) / reviews.length
    : null
  const avgJusticia = reviews.length
    ? reviews.reduce((s, r) => s + r.justicia, 0) / reviews.length
    : null

  const overallAvg =
    avgClaridad && avgPuntualidad && avgJusticia
      ? (avgClaridad + avgPuntualidad + avgJusticia) / 3
      : null

  const userAlreadyReviewed = user ? reviews.some((r) => r.user_id === user.id) : false

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-background dark:from-blue-950/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Link
            href="/facultades"
            className="inline-flex items-center text-sm text-blue-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Explorar
          </Link>

          <div className="flex items-center gap-5">
            <div className="bg-white/20 text-white rounded-full w-20 h-20 flex items-center justify-center text-2xl font-bold shrink-0 border-2 border-white/30">
              {getInitials(profesor.nombre)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profesor.nombre}</h1>
              {profesor.departamento && (
                <p className="text-blue-200 mt-1">{profesor.departamento}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {overallAvg && (
                  <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                    <span className="font-bold">{formatRating(overallAvg)}</span>
                  </div>
                )}
                <span className="text-blue-200 text-sm">{reviews.length} evaluaciones</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Metrics + Ramos */}
          <div className="lg:col-span-1 space-y-5">
            {/* Metrics */}
            <Card className="shadow-md border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Métricas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">Claridad</span>
                    <span className="text-primary font-bold">{formatRating(avgClaridad)}<span className="text-muted-foreground font-normal">/5</span></span>
                  </div>
                  {avgClaridad && <RatingBar value={avgClaridad} />}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">Puntualidad</span>
                    <span className="text-primary font-bold">{formatRating(avgPuntualidad)}<span className="text-muted-foreground font-normal">/5</span></span>
                  </div>
                  {avgPuntualidad && <RatingBar value={avgPuntualidad} />}
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">Justicia</span>
                    <span className="text-primary font-bold">{formatRating(avgJusticia)}<span className="text-muted-foreground font-normal">/5</span></span>
                  </div>
                  {avgJusticia && <RatingBar value={avgJusticia} />}
                </div>
              </CardContent>
            </Card>

            {/* Ramos */}
            {ramos.length > 0 && (
              <Card className="shadow-md border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Ramos que dicta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ramos.map((r) => (
                      <Link key={r.id} href={`/ramos/${r.id}`}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/20 transition-colors py-1 px-2.5"
                        >
                          {r.nombre}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Review form + Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {user && !userAlreadyReviewed && (
              <ProfesorReviewForm profesorId={profesorId} ramos={ramos} />
            )}
            {!user && (
              <Card className="border-dashed border-2 shadow-none">
                <CardContent className="p-6 text-center">
                  <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    <Link href="/login" className="text-primary font-semibold hover:underline">
                      Inicia sesión
                    </Link>{' '}
                    con tu email PUCV para dejar una evaluación.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Reviews list */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Evaluaciones ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <Card key={r.id} className="shadow-sm border-0 bg-card">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          Claridad: {r.claridad}/5
                        </Badge>
                        <Badge variant="secondary">Puntualidad: {r.puntualidad}/5</Badge>
                        <Badge variant="secondary">Justicia: {r.justicia}/5</Badge>
                      </div>
                      {r.comentario && (
                        <p className="text-sm leading-relaxed mb-3">{r.comentario}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString('es-CL', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {reviews.length === 0 && (
                  <Card className="border-dashed border-2 shadow-none">
                    <CardContent className="p-10 text-center">
                      <ThumbsUp className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="font-medium mb-1">Aún no hay evaluaciones</p>
                      <p className="text-muted-foreground text-sm">¡Sé el primero en evaluar a este profesor!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
