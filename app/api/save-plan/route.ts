import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const { shareId, tables } = await request.json()
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })
    await redis.set(`plan:${shareId}`, tables)
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
