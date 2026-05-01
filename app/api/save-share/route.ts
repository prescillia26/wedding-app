import { randomUUID } from 'crypto'
import { redis } from '@/lib/redis'
import { getSession, type User } from '@/lib/auth'

const MAX_BYTES = 900_000

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { fixedId, ...shareData } = data

    const id = fixedId ?? randomUUID()

    // Vérifier la propriété si c'est une mise à jour (fixedId fourni)
    const session = await getSession()
    if (fixedId) {
      // Vérifier si ce faire-part a un owner
      const existing = await redis.get<Record<string, unknown>>(fixedId)
      if (existing?.ownerEmail && session?.email !== existing.ownerEmail) {
        return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
      }
    }

    const size = new TextEncoder().encode(JSON.stringify(shareData)).length
    if (size > MAX_BYTES) {
      return Response.json({ error: 'Données trop volumineuses.' }, { status: 413 })
    }

    // Ajouter l'ownerEmail si connecté
    if (session?.email) {
      shareData.ownerEmail = session.email
    }

    await redis.set(id, shareData, { ex: 31536000 })

    if (shareData.emailMaries) {
      await redis.set(`email:${id}`, shareData.emailMaries, { ex: 31536000 })
    }

    if (shareData.slug) {
      const slug = shareData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (slug) {
        await redis.set(`slug:${slug}`, id, { ex: 31536000 })
      }
    }

    // Lier le faire-part au compte utilisateur
    if (session?.email) {
      const user = await redis.get<User>(`user:${session.email}`)
      if (user && !user.faireparts.includes(id)) {
        user.faireparts.push(id)
        await redis.set(`user:${session.email}`, user)
      }
    }

    return Response.json({ id, slug: shareData.slug || null })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
