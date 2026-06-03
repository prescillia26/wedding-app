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

    // Vérifier la propriété : le shareId doit appartenir à l'utilisateur
    const user = await redis.get<User>(`user:${session.email}`)
    if (!user || !user.faireparts.includes(shareId)) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Sauvegarder le brouillon (expiration 1 an)
    await redis.set(`draft:${shareId}`, { formData }, { ex: 60 * 60 * 24 * 365 })

    // ✅ Aussi mettre à jour la version publiée (visible par les invités)
    // pour que les modifications soient immédiatement visibles
    const published = await redis.get<Record<string, unknown>>(shareId)
    if (published) {
      // Fusionner les données du formulaire dans la version publiée
      // en conservant les métadonnées existantes (ownerEmail, slug, etc.)
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
