import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { shareId, timestamp, userAgent, country } = await request.json()
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    const key = `views:${shareId}`
    const existing = await redis.get<{ timestamp: string; pays: string; userAgent?: string }[]>(key) ?? []
    existing.push({ timestamp: timestamp ?? new Date().toISOString(), pays: country ?? 'fr', userAgent })
    await redis.set(key, existing)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('track-view error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
