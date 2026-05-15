import { Redis } from '@upstash/redis'
import { getSession } from '@/lib/auth'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const shareId = new URL(request.url).searchParams.get('shareId')
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    // Vérifier que l'utilisateur est propriétaire
    const session = await getSession()
    if (session?.email) {
      const shareData = await redis.get<Record<string, unknown>>(shareId)
      if (shareData && shareData.ownerEmail && shareData.ownerEmail !== session.email) {
        return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
    }

    const views = await redis.get<{ timestamp: string; pays: string }[]>(`views:${shareId}`) ?? []
    return Response.json(views)
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
