import { Redis } from '@upstash/redis'
import { getSession } from '@/lib/auth'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id || !/^[0-9a-f-]+$/i.test(id)) {
      return Response.json({ error: 'ID invalide' }, { status: 400 })
    }
    const data = await redis.get<Record<string, unknown>>(id)
    if (!data) {
      return Response.json({ error: 'Faire-part introuvable' }, { status: 404 })
    }
    // Debug: loguer les champs logo pour diagnostiquer
    console.log('[get-share] id:', id, 'customLogoUrl:', data.customLogoUrl || '(vide)', 'luxeMonogramUrl:', data.luxeMonogramUrl || '(vide)')
    // Retourner ownerEmail SEULEMENT si le requester est le propriétaire
    const session = await getSession()
    if (session?.email && data.ownerEmail === session.email) {
      return Response.json(data) // Propriétaire → données complètes
    }
    // Visiteur → cacher ownerEmail
    const { ownerEmail: _owner, ...safeData } = data
    return Response.json(safeData)
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
