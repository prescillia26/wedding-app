import { destroySession } from '@/lib/auth'

export async function POST() {
  try {
    await destroySession()
    return Response.json({ ok: true })
  } catch (err) {
    console.error('logout error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
