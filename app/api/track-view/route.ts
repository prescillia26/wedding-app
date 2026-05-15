import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { shareId, country } = await request.json()
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    // Rate limiting : 20 vues par IP par minute
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rlKey = `ratelimit:view:${ip}`
    const attempts = await redis.get<number>(rlKey) ?? 0
    if (attempts >= 20) return Response.json({ ok: true }) // Silent drop
    await redis.set(rlKey, attempts + 1, { ex: 60 })

    const key = `views:${shareId}`
    const existing = await redis.get<{ timestamp: string; pays: string; userAgent?: string }[]>(key) ?? []
    // Utiliser le timestamp serveur (pas le client) et le user-agent des headers
    existing.push({
      timestamp: new Date().toISOString(),
      pays: country ?? 'fr',
      userAgent: request.headers.get('user-agent') || undefined,
    })
    await redis.set(key, existing)

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
