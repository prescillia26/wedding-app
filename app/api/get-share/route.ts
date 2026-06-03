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
    let data = await redis.get<Record<string, unknown>>(id)
    if (!data) {
      return Response.json({ error: 'Faire-part introuvable' }, { status: 404 })
    }
    // Si cet ID est un ancien doublon, charger les données du nouvel ID canonique
    if (data.canonicalId && typeof data.canonicalId === 'string') {
      const canonical = await redis.get<Record<string, unknown>>(data.canonicalId)
      if (canonical) {
        data = canonical
      }
    }
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
