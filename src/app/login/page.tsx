'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isValidPucvEmail } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!isValidPucvEmail(email)) {
      setError('Debes usar tu email institucional (@pucv.cl o @alu.ucv.cl)')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError('Error al enviar el enlace. Intenta nuevamente.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/30 dark:to-purple-950/20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">RankingU PUCV</h1>
          <p className="text-muted-foreground text-sm mt-1">Plataforma estudiantil de la PUCV</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Usa tu email institucional para acceder
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Revisa tu correo</h3>
                <p className="text-muted-foreground text-sm">
                  Enviamos un enlace de acceso a{' '}
                  <strong className="text-foreground">{email}</strong>.
                  Haz clic en él para ingresar.
                </p>
                <Button variant="ghost" className="mt-5" onClick={() => setSent(false)}>
                  Usar otro correo
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email institucional</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu.nombre@alu.ucv.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Solo emails @pucv.cl o @alu.ucv.cl
                  </p>
                </div>
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? 'Enviando...' : (
                    <>Enviar enlace de acceso <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Al ingresar aceptas mantener un lenguaje respetuoso en tus evaluaciones.
        </p>
      </div>
    </div>
  )
}
