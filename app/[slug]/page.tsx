import { redirect } from 'next/navigation'
import { Redis } from '@upstash/redis'
import type { Metadata } from 'next'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const shareId = await redis.get<string>(`slug:${slug}`)
  if (!shareId) return { title: 'Lov\'it' }
  
  const data = await redis.get<Record<string, string>>(shareId as string)
  if (!data) return { title: 'Lov\'it' }

  const prenom1 = data.marie1Prenom || ''
  const prenom2 = data.marie2Prenom || ''
  const photo = data.photosFond?.[0] || data.photoFond || ''

  return {
    title: `${prenom1} & ${prenom2} — Faire-part`,
    description: `${prenom1} & ${prenom2} vous invitent à célébrer leur mariage`,
    openGraph: {
      title: `💍 ${prenom1} & ${prenom2}`,
      description: `${prenom1} & ${prenom2} vous invitent à célébrer leur mariage`,
      images: photo ? [{ url: photo, width: 1200, height: 630 }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `💍 ${prenom1} & ${prenom2}`,
      description: `${prenom1} & ${prenom2} vous invitent à célébrer leur mariage`,
      images: photo ? [photo] : [],
    },
  }
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const shareId = await redis.get<string>(`slug:${slug}`)
  if (!shareId) redirect('/faire-part')
  redirect(`/faire-part?share=${shareId}&role=guest`)
}