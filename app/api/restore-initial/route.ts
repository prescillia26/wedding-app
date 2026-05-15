import { redis } from '@/lib/redis'
import { getSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { shareId } = await request.json()
    if (!shareId) {
      return Response.json({ error: 'shareId manquant' }, { status: 400 })
    }

    // Vérifier que l'utilisateur est propriétaire
    const session = await getSession()
    if (!session?.email) {
      return Response.json({ error: 'Non connecté' }, { status: 401 })
    }

    const current = await redis.get<Record<string, unknown>>(shareId)
    if (!current) {
      return Response.json({ error: 'Faire-part introuvable' }, { status: 404 })
    }
    if (current.ownerEmail !== session.email) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Récupérer le snapshot initial
    const initial = await redis.get<Record<string, unknown>>(`${shareId}:initial`)
    if (!initial) {
      return Response.json({ error: 'Pas de version initiale disponible' }, { status: 404 })
    }

    // Restaurer : écraser la version courante avec le snapshot initial
    // On garde l'ownerEmail et le slug de la version courante
    initial.ownerEmail = current.ownerEmail
    initial.ogVersion = Date.now()
    await redis.set(shareId, initial, { ex: 31536000 })

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
