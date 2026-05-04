import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { code, email, pack, adminPassword } = await request.json() as {
      code: string
      email: string
      pack: string
      adminPassword: string
    }

    if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
      return Response.json({ success: false, error: 'Non autorisé' }, { status: 401 })
    }

    const normalized = code?.toUpperCase().trim()
    if (!normalized || !email || !pack) {
      return Response.json({ success: false, error: 'Paramètres manquants' }, { status: 400 })
    }

    const validPacks = ['essentiel', 'premium', 'luxe']
    if (!validPacks.includes(pack)) {
      return Response.json({ success: false, error: 'Pack invalide' }, { status: 400 })
    }

    await redis.set(`promo:${normalized}`, {
      email: email.trim().toLowerCase(),
      pack,
      createdAt: new Date().toISOString(),
    })

    return Response.json({ success: true, code: normalized })
  } catch (err) {
    return Response.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
