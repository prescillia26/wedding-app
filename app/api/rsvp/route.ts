import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const shareId = data.shareId
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    const key = `rsvp:${shareId}`
    const existing = await redis.get<unknown[]>(key) ?? []
    existing.push(data)
    await redis.set(key, existing)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('rsvp error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
