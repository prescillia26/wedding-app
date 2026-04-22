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
  const prenom1 = (data as Record<string, unknown>).marie1Prenom as string || ''
  const prenom2 = (data as Record<string, unknown>).marie2Prenom as string || ''
  const photosFond = (data as unknown as Record<string, string[]>).photosFond
  const photo = photosFond?.[0] || (data as Record<string, unknown>).photoFond as string || ''
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
  
  const data = await redis.get<Record<string, unknown>>(shareId as string)
  const prenom1 = (data?.marie1Prenom as string) || ''
  const prenom2 = (data?.marie2Prenom as string) || ''
  const photo = ((data?.photosFond as string[])?.[0]) || (data?.photoFond as string) || ''
  const accent = '#C9A84C'
  const targetUrl = `/faire-part?share=${shareId}&role=guest`

  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content={`0;url=${targetUrl}`} />
      </head>
      <body style={{ margin: 0, background: '#fdf8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center', padding: '48px 32px' }}>
          {photo && (
            <img src={photo} alt="" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}`, marginBottom: 24 }} />
          )}
          <div style={{ fontSize: 36, color: accent, marginBottom: 8 }}>
            {prenom1} & {prenom2}
          </div>
          <div style={{ fontSize: 14, color: '#8a6040', marginBottom: 32 }}>
            vous invitent à célébrer leur mariage
          </div>
          <a href={targetUrl} style={{ padding: '14px 40px', border: `1.5px solid ${accent}`, borderRadius: 9999, color: accent, textDecoration: 'none', fontSize: 14 }}>
            Voir l&apos;invitation ✦
          </a>
        </div>
      </body>
    </html>
  )
}