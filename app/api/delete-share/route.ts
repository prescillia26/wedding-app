import { redis } from '@/lib/redis'
import { getSession, type User } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { shareId } = await request.json()
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    const session = await getSession()
    if (!session?.email) return Response.json({ error: 'Non connecté' }, { status: 401 })

    // Vérifier la propriété
    const data = await redis.get<Record<string, unknown>>(shareId)
    if (!data) return Response.json({ error: 'Faire-part introuvable' }, { status: 404 })
    if (data.ownerEmail !== session.email) return Response.json({ error: 'Accès non autorisé' }, { status: 403 })

    // Supprimer le faire-part + données liées
    await redis.del(shareId)
    await redis.del(`${shareId}:initial`)
    await redis.del(`draft:${shareId}`)
    await redis.del(`email:${shareId}`)

    // Supprimer le slug si existant
    if (data.slug) {
      const slug = (data.slug as string).toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (slug) await redis.del(`slug:${slug}`)
    }

    // Retirer du tableau de faire-parts de l'utilisateur
    const user = await redis.get<User>(`user:${session.email}`)
    if (user) {
      user.faireparts = user.faireparts.filter(id => id !== shareId)
      await redis.set(`user:${session.email}`, user)
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
