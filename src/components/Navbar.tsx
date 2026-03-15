import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { GraduationCap, LogOut, User } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <GraduationCap className="h-6 w-6" />
          <span className="text-lg">RankingU</span>
          <span className="text-xs text-muted-foreground font-normal hidden sm:inline">PUCV</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/facultades"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline px-3 py-2 rounded-md hover:bg-accent"
          >
            Facultades
          </Link>

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                {getInitials(user.email ?? 'U')}
              </div>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild size="sm" className="ml-1">
              <Link href="/login">
                <User className="h-4 w-4 mr-1" />
                Ingresar
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
