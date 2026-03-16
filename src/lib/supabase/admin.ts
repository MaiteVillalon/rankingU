import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con service role key — bypasea RLS.
 * Solo usar en API routes protegidas (nunca en el cliente).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}
