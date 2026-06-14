import { Redis } from '@upstash/redis'
import { getSession } from '@/lib/auth'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    // Vérifier que l'utilisateur a accès au faire-part
    const session = await getSession()
    if (!session?.email) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    // Autoriser si : ownerEmail OU faire-part dans la liste de l'utilisateur
    const shareData = await redis.get<Record<string, unknown>>(shareId)
    if (!shareData) return Response.json({ error: 'Faire-part introuvable' }, { status: 404 })
    const isOwner = shareData.ownerEmail === session.email
    let hasFairepart = false
    if (!isOwner) {
      const user = await redis.get<{ faireparts: string[] }>(`user:${session.email}`)
      hasFairepart = !!user?.faireparts?.includes(shareId)
    }
    if (!isOwner && !hasFairepart) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const key = `rsvp:${shareId}`
    const entries = await redis.get<unknown[]>(key) ?? []
    return Response.json(entries)
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
