import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RatingBar } from '@/components/RatingBar'
import { RamoReviewForm } from '@/components/RamoReviewForm'
import { ArrowLeft, MessageSquare, Users, TrendingUp, Lock, BookOpen } from 'lucide-react'
import { formatRating, getInitials } from '@/lib/utils'
import type { Ramo, Profesor } from '@/types'

interface Props {
  params: Promise<{ ramoId: string }>
}

interface ReviewRamo {
  id: string
  user_id: string
  ramo_id: string
  dificultad: number
  carga: number
  calidad_aprendizaje: number
  comentario: string | null
  created_at: string
}

interface RamoConCarrera extends Ramo {
  carreras: { id: string; nombre: string } | null
}

export default async function RamoPage({ params }: Props) {
  const { ramoId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: ramoRaw }, { data: reviewsRaw }, { data: profesoresRel }] = await Promise.all([
    supabase
      .from('ramos')
      .select('*, carreras(id, nombre)')
      .eq('id', ramoId)
      .single(),
    supabase
      .from('reviews_ramos')
      .select('*')
      .eq('ramo_id', ramoId)
      .order('created_at', { ascending: false }),
    supabase
      .from('ramo_profesor')
      .select('profesores(*)')
      .eq('ramo_id', ramoId),
  ])

  if (!ramoRaw) notFound()

  const ramo = ramoRaw as unknown as RamoConCarrera
  const reviews = (reviewsRaw ?? []) as ReviewRamo[]
  const profesores = (profesoresRel ?? []).map(
    (r) => (r as unknown as { profesores: Profesor }).profesores
  )

  const avgDificultad = reviews.length
    ? reviews.reduce((s, r) => s + r.dificultad, 0) / reviews.length
    : null
  const avgCarga = reviews.length
    ? reviews.reduce((s, r) => s + r.carga, 0) / reviews.length
    : null
  const avgCalidad = reviews.length
    ? reviews.reduce((s, r) => s + r.calidad_aprendizaje, 0) / reviews.length
    : null

  const userAlreadyReviewed = user ? reviews.some((r) => r.user_id === user.id) : false

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-background dark:from-blue-950/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {ramo.carreras && (
            <Link
              href={`/carreras/${ramo.carreras.id}`}
              className="inline-flex items-center text-sm text-blue-200 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> {ramo.carreras.nombre}
            </Link>
          )}
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-xl p-3 shrink-0">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0">
                {ramo.codigo}
              </Badge>
              <h1 className="text-3xl font-bold">{ramo.nombre}</h1>
              {ramo.creditos && (
                <p className="text-blue-200 mt-1">{ramo.creditos} créditos</p>
              )}
              <p className="text-blue-200 text-sm mt-2">{reviews.length} evaluaciones</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Card className="shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-orange-500" /> Dificultad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{formatRating(avgDificultad)}<span className="text-sm text-muted-foreground font-normal">/5</span></p>
              {avgDificultad && <RatingBar value={avgDificultad} />}
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Carga de trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{formatRating(avgCarga)}<span className="text-sm text-muted-foreground font-normal">/5</span></p>
              {avgCarga && <RatingBar value={avgCarga} />}
            </CardContent>
          </Card>
          <Card className="shadow-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Calidad del aprendizaje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{formatRating(avgCalidad)}<span className="text-sm text-muted-foreground font-normal">/5</span></p>
              {avgCalidad && <RatingBar value={avgCalidad} />}
            </CardContent>
          </Card>
        </div>

        {/* Professors */}
        {profesores.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Profesores que dictan este ramo
            </h2>
            <div className="flex flex-wrap gap-3">
              {profesores.map((p) => (
                <Link key={p.id} href={`/profesores/${p.id}`}>
                  <div className="flex items-center gap-2 bg-secondary rounded-full px-4 py-2 hover:bg-primary/10 transition-colors cursor-pointer">
                    <div className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                      {getInitials(p.nombre)}
                    </div>
                    <span className="text-sm font-medium">{p.nombre}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Review form */}
        {user && !userAlreadyReviewed && (
          <div className="mb-8">
            <RamoReviewForm ramoId={ramoId} />
          </div>
        )}
        {!user && (
          <Card className="border-dashed border-2 shadow-none mb-8">
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

        {/* Reviews */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Evaluaciones ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((r) => (
              <Card key={r.id} className="shadow-sm border-0">
                <CardContent className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">Dificultad: {r.dificultad}/5</Badge>
                    <Badge variant="secondary">Carga: {r.carga}/5</Badge>
                    <Badge variant="secondary">Aprendizaje: {r.calidad_aprendizaje}/5</Badge>
                  </div>
                  {r.comentario && <p className="text-sm leading-relaxed mb-3">{r.comentario}</p>}
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
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="font-medium mb-1">Aún no hay evaluaciones</p>
                  <p className="text-muted-foreground text-sm">¡Sé el primero!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
