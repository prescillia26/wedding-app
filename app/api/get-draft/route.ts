import { redis } from '@/lib/redis'
import { getSession, type User } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Non connecté' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')
    if (!shareId) {
      return Response.json({ error: 'shareId requis' }, { status: 400 })
    }

    // Vérifier la propriété
    const user = await redis.get<User>(`user:${session.email}`)
    if (!user || !user.faireparts.includes(shareId)) {
      return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const draft = await redis.get<{ formData: unknown }>(`draft:${shareId}`)
    if (!draft) {
      return Response.json({ error: 'Aucun brouillon trouvé' }, { status: 404 })
    }

    return Response.json({ formData: draft.formData })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
