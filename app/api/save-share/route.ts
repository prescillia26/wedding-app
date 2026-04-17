import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

const redis = new Redis({
  url: process.env.STORAGE_URL!,
  token: process.env.STORAGE_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const id = randomUUID()
    await redis.set(id, data)
    return Response.json({ id })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
