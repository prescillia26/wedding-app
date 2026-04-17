import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.STORAGE_URL!,
  token: process.env.STORAGE_TOKEN!,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id || !/^[0-9a-f-]+$/i.test(id)) {
      return Response.json({ error: 'ID invalide' }, { status: 400 })
    }
    const data = await redis.get(id)
    if (!data) {
      return Response.json({ error: 'Faire-part introuvable' }, { status: 404 })
    }
    return Response.json(data)
  } catch (err) {
    console.error('get-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
