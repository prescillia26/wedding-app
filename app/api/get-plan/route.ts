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

    // Vérifier ownership
    const session = await getSession()
    if (!session?.email) return Response.json({ error: 'Non connecté' }, { status: 401 })
    const shareData = await redis.get<Record<string, unknown>>(shareId)
    if (shareData?.ownerEmail && shareData.ownerEmail !== session.email) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const plan = await redis.get(`plan:${shareId}`) ?? []
    return Response.json(plan)
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
