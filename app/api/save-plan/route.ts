import { Redis } from '@upstash/redis'
import { getSession } from '@/lib/auth'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { shareId, tables } = await request.json()
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    // Vérifier ownership
    const session = await getSession()
    if (!session?.email) return Response.json({ error: 'Non connecté' }, { status: 401 })
    const shareData = await redis.get<Record<string, unknown>>(shareId)
    if (shareData?.ownerEmail && shareData.ownerEmail !== session.email) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    await redis.set(`plan:${shareId}`, tables)
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
