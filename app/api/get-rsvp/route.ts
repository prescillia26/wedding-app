import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    const key = `rsvp:${shareId}`
    const entries = await redis.get<unknown[]>(key) ?? []
    return Response.json(entries)
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
