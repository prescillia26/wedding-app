import { redirect } from 'next/navigation'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const shareId = await redis.get<string>(`slug:${slug}`)
  if (!shareId) redirect('/faire-part')
  redirect(`/faire-part?share=${shareId}&role=guest`)
}