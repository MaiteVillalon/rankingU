'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StarRating } from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  ramoId: string
}

export function RamoReviewForm({ ramoId }: Props) {
  const router = useRouter()
  const [dificultad, setDificultad] = useState(0)
  const [carga, setCarga] = useState(0)
  const [calidadAprendizaje, setCalidadAprendizaje] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!dificultad || !carga || !calidadAprendizaje) {
      setError('Debes calificar todas las categorías.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/reviews/ramos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ramo_id: ramoId,
        dificultad,
        carga,
        calidad_aprendizaje: calidadAprendizaje,
        comentario,
      }),
    })

    const data = await res.json() as { error?: string }

    if (!res.ok) {
      setError(data.error ?? 'Error al enviar la evaluación.')
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evaluar ramo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StarRating value={dificultad} onChange={setDificultad} label="Dificultad" />
            <StarRating value={carga} onChange={setCarga} label="Carga de trabajo" />
            <StarRating value={calidadAprendizaje} onChange={setCalidadAprendizaje} label="Calidad del aprendizaje" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Comentario (opcional)
            </label>
            <Textarea
              placeholder="Comparte tu experiencia con este ramo..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={500}
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{comentario.length}/500</p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Publicar evaluación'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
