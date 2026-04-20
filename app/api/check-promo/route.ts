import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface PromoEntry {
  email: string
  pack: string
  createdAt: string
  usedAt?: string
  usedBy?: string
}

export async function POST(request: Request) {
  try {
    const { code, email } = await request.json() as { code: string; email: string }
    const normalized = code?.toUpperCase().trim()
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalized) return Response.json({ valid: false, reason: 'Code manquant' })
    if (!normalizedEmail) return Response.json({ valid: false, reason: 'Email manquant' })

    const data = await redis.get<PromoEntry>(`promo:${normalized}`)
    if (!data) return Response.json({ valid: false, reason: 'Code promo invalide' })

    if (data.email.toLowerCase() !== normalizedEmail) {
      return Response.json({ valid: false, reason: 'Cet email ne correspond pas à ce code promo' })
    }

    if (data.usedAt) {
      return Response.json({ valid: false, reason: 'Ce code promo a déjà été utilisé' })
    }

    // Marquer comme utilisé
    await redis.set(`promo:${normalized}`, {
      ...data,
      usedAt: new Date().toISOString(),
      usedBy: normalizedEmail,
    })

    // Générer un code d'accès
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let accessCode = ''
    for (let i = 0; i < 6; i++) accessCode += chars[Math.floor(Math.random() * chars.length)]

    const entry = { pack: data.pack || 'premium', email: normalizedEmail, promo: normalized, date: new Date().toISOString() }
    await redis.set(`access:${accessCode}`, entry, { ex: 60 * 60 * 24 * 365 })

    return Response.json({ valid: true, accessCode, pack: data.pack })
  } catch (err) {
    console.error('check-promo error:', err)
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}
