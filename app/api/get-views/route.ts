import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const shareId = new URL(request.url).searchParams.get('shareId')
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    const views = await redis.get<{ timestamp: string; pays: string }[]>(`views:${shareId}`) ?? []
    return Response.json(views)
  } catch (err) {
    console.error('get-views error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
