import { redis } from '@/lib/redis'
import { getSession, type User } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { shareId, formData } = await request.json()
    if (!shareId || !formData) {
      return Response.json({ error: 'shareId et formData requis' }, { status: 400 })
    }

    // Vérifier la propriété : via user.faireparts OU via ownerEmail du faire-part publié
    const user = await redis.get<User>(`user:${session.email}`)
    const published = await redis.get<Record<string, unknown>>(shareId)
    const ownsViaUser = user?.faireparts?.includes(shareId)
    const ownsViaPublished = published?.ownerEmail === session.email
    if (!ownsViaUser && !ownsViaPublished) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Sauvegarder le brouillon (expiration 1 an)
    await redis.set(`draft:${shareId}`, { formData }, { ex: 60 * 60 * 24 * 365 })

    // ✅ Aussi mettre à jour la version publiée (visible par les invités)
    if (published) {
      const updated = {
        ...published,
        ...formData,
        ownerEmail: published.ownerEmail,
        slug: published.slug,
        ogVersion: Date.now(),
      }
      await redis.set(shareId, updated, { ex: 60 * 60 * 24 * 365 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
