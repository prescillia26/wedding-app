import { Redis } from '@upstash/redis'
import type { Metadata } from 'next'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

async function getData(slug: string) {
  const shareId = await redis.get<string>(`slug:${slug}`)
  if (!shareId) return null
  const data = await redis.get<{
    marie1Prenom?: string
    marie2Prenom?: string
    photosFond?: string[]
    photoFond?: string
  }>(shareId)
  return { shareId, data }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const result = await getData(slug)
  if (!result?.data) return { title: "Lov'it" }
  const prenom1 = result.data.marie1Prenom || ''
  const prenom2 = result.data.marie2Prenom || ''
  const photo = result.data.photosFond?.[0] || result.data.photoFond || ''
  return {
    title: `${prenom1} & ${prenom2} — Invitation`,
    description: `${prenom1} & ${prenom2} vous invitent à célébrer leur mariage`,
    openGraph: {
      title: `💍 ${prenom1} & ${prenom2}`,
      description: `${prenom1} & ${prenom2} vous invitent à célébrer leur mariage`,
      images: photo ? [{ url: photo, width: 1200, height: 630 }] : [],
      type: 'website',
    },
  }
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getData(slug)
  const prenom1 = result?.data?.marie1Prenom || ''
  const prenom2 = result?.data?.marie2Prenom || ''
  const photo = result?.data?.photosFond?.[0] || result?.data?.photoFond || ''
  const accent = '#C9A84C'
  const targetUrl = result?.shareId ? `/faire-part?share=${result.shareId}&role=guest` : '/faire-part'

  return (
    <div style={{ background: '#fdf8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
      <div style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 400 }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}`, marginBottom: 28 }} />
        )}
        <div style={{ fontSize: 12, color: '#8a6040', letterSpacing: 4, textTransform: 'uppercase' as const, marginBottom: 20 }}>
          Invitation de mariage
        </div>
        <div style={{ fontSize: 42, color: accent, fontStyle: 'italic', marginBottom: 4 }}>{prenom1}</div>
        <div style={{ fontSize: 20, color: '#8a6040', marginBottom: 4 }}>&</div>
        <div style={{ fontSize: 42, color: accent, fontStyle: 'italic', marginBottom: 36 }}>{prenom2}</div>
        <a href={targetUrl} style={{ display: 'inline-block', padding: '14px 40px', border: `1.5px solid ${accent}`, borderRadius: 9999, color: accent, textDecoration: 'none', fontSize: 13, letterSpacing: 2 }}>
          Voir l&apos;invitation ✦
        </a>
        <div style={{ marginTop: 40, fontSize: 11, color: '#c4b5a0' }}>
          Créé avec ❤️ par Lov&apos;it
        </div>
      </div>
    </div>
  )
}