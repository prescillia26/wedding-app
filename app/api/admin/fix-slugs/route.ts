import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { adminPassword, email } = await request.json()
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur et ses faire-parts
    const user = await redis.get<{ faireparts: string[] }>(`user:${email}`)
    if (!user) return Response.json({ error: 'Utilisateur non trouvé' }, { status: 404 })

    const results: { shareId: string; slug: string; fixed: boolean; prenoms: string }[] = []

    for (const shareId of user.faireparts) {
      const data = await redis.get<Record<string, unknown>>(shareId)
      if (!data) continue

      const slug = data.slug as string | undefined
      const prenoms = `${data.marie1Prenom || '?'} & ${data.marie2Prenom || '?'}`

      if (slug) {
        // Vérifier que le slug pointe vers ce shareId
        const currentTarget = await redis.get<string>(`slug:${slug}`)
        if (currentTarget !== shareId) {
          // Le slug pointe vers le mauvais faire-part → corriger
          await redis.set(`slug:${slug}`, shareId, { ex: 31536000 })
          results.push({ shareId, slug, fixed: true, prenoms })
        } else {
          results.push({ shareId, slug, fixed: false, prenoms })
        }
      } else {
        results.push({ shareId, slug: '(aucun)', fixed: false, prenoms })
      }
    }

    return Response.json({ email, faireparts: results })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
