import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// Vérifie si un code d'accès (généré après paiement Stripe) est valide
// Rate limiting par IP pour empêcher le brute-force
async function rateLimit(request: Request): Promise<boolean> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rlKey = `ratelimit:access:${ip}`
  const attempts = await redis.get<number>(rlKey) ?? 0
  if (attempts >= 10) return false
  await redis.set(rlKey, attempts + 1, { ex: 60 })
  return true
}

export async function GET(request: Request) {
  try {
    if (!(await rateLimit(request))) {
      return Response.json({ valid: false, reason: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 })
    }
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    if (!code) return Response.json({ valid: false, reason: 'Code manquant' })

    const normalized = code.toUpperCase().trim()
    const data = await redis.get<{ pack?: string }>(`access:${normalized}`)

    if (!data) return Response.json({ valid: false, reason: 'Code invalide' })
    return Response.json({ valid: true, pack: data.pack || 'essentiel' })
  } catch (err) {
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!(await rateLimit(request))) {
      return Response.json({ valid: false, reason: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 })
    }
    const { code } = await request.json() as { code: string }
    const normalized = code?.toUpperCase().trim()
    if (!normalized) return Response.json({ valid: false, reason: 'Code manquant' })

    const data = await redis.get<{ pack?: string }>(`access:${normalized}`)
    if (!data) return Response.json({ valid: false, reason: 'Code invalide' })

    return Response.json({ valid: true, pack: data.pack || 'essentiel' })
  } catch (err) {
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}
