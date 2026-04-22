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
  accessCode?: string
}

const ACCESS_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateAccessCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ACCESS_CHARS[Math.floor(Math.random() * ACCESS_CHARS.length)]
  }
  return code
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

    // CAS 1 : Code déjà utilisé par cette personne → on lui redonne son accès
    if (data.usedAt && data.accessCode) {
      const existingAccess = await redis.get(`access:${data.accessCode}`)
      if (existingAccess) {
        return Response.json({
          valid: true,
          accessCode: data.accessCode,
          pack: data.pack,
          returning: true,
        })
      }
    }

    // CAS 2/3 : Première utilisation OU accessCode expiré → on en génère un nouveau
    const accessCode = generateAccessCode()
    const entry = {
      pack: data.pack || 'premium',
      email: normalizedEmail,
      promo: normalized,
      date: new Date().toISOString(),
    }

    await redis.set(`access:${accessCode}`, entry, { ex: 60 * 60 * 24 * 365 })

    await redis.set(`promo:${normalized}`, {
      ...data,
      usedAt: data.usedAt || new Date().toISOString(),
      usedBy: normalizedEmail,
      accessCode,
    })

    await redis.set(`email-access:${normalizedEmail}`, accessCode, { ex: 60 * 60 * 24 * 365 })

    return Response.json({
      valid: true,
      accessCode,
      pack: data.pack,
      returning: !!data.usedAt,
    })
  } catch (err) {
    console.error('check-promo error:', err)
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}
