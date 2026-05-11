import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface GuestEntry {
  name: string
  phone: string
  sentAt?: string   // ISO date when WhatsApp was opened
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const shareId = searchParams.get('shareId')
  if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

  const guests = await redis.get<GuestEntry[]>(`guests:${shareId}`) ?? []
  return Response.json({ guests })
}

export async function POST(request: Request) {
  try {
    const { shareId, guests } = await request.json() as { shareId: string; guests: GuestEntry[] }
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })

    await redis.set(`guests:${shareId}`, guests)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
