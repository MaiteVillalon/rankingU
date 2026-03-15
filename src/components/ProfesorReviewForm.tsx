'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StarRating } from '@/components/StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Ramo } from '@/types'

interface Props {
  profesorId: string
  ramos: Ramo[]
}

export function ProfesorReviewForm({ profesorId, ramos }: Props) {
  const router = useRouter()
  const [claridad, setClaridad] = useState(0)
  const [puntualidad, setPuntualidad] = useState(0)
  const [justicia, setJusticia] = useState(0)
  const [ramoId, setRamoId] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!claridad || !puntualidad || !justicia) {
      setError('Debes calificar todas las categorías.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/reviews/profesores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profesor_id: profesorId,
        ramo_id: ramoId || undefined,
        claridad,
        puntualidad,
        justicia,
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
        <CardTitle className="text-lg">Evaluar profesor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {ramos.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                Ramo (opcional)
              </label>
              <select
                value={ramoId}
                onChange={(e) => setRamoId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Ninguno / General</option>
                {ramos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StarRating value={claridad} onChange={setClaridad} label="Claridad" />
            <StarRating value={puntualidad} onChange={setPuntualidad} label="Puntualidad" />
            <StarRating value={justicia} onChange={setJusticia} label="Justicia" />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Comentario (opcional)
            </label>
            <Textarea
              placeholder="Comparte tu experiencia con este profesor..."
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
