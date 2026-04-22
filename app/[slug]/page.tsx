import { Redis } from '@upstash/redis'
import type { Metadata } from 'next'
import { cache } from 'react'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// ✅ Fonction unique qui transforme une URL Cloudinary au format OG parfait
function toCloudinaryOgUrl(raw: string | undefined | null): string {
  if (!raw) return ''
  if (raw.includes('/upload/')) {
    // g_auto = recadre automatiquement sur les visages
    // q_auto,f_auto = optimise qualité/format pour chaque device
    return raw.replace('/upload/', '/upload/w_1200,h_630,c_fill,g_auto,q_auto,f_auto/')
  }
  return raw
}

// ✅ React cache() : évite que Redis soit appelé 2 fois par page
// (avant : une fois dans generateMetadata + une fois dans SlugPage)
const getData = cache(async (slug: string) => {
  const shareId = await redis.get<string>(`slug:${slug}`)
  if (!shareId) return null
  const data = await redis.get<{
    marie1Prenom?: string
    marie2Prenom?: string
    photosFond?: string[]
    photoFond?: string
    dateMariage?: string // optionnel : si tu l'as en base, il sera utilisé
    ville?: string       // optionnel
    lieu?: string        // optionnel
  }>(shareId)
  if (!data) return null
  return { shareId, data }
})

function formatDateFR(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const result = await getData(slug)

  if (!result?.data) {
    return {
      title: "Invitation introuvable · Lov'it",
      description: "Cette invitation de mariage n'existe pas ou a été retirée.",
      robots: { index: false, follow: false },
    }
  }

  const { marie1Prenom = '', marie2Prenom = '', dateMariage, ville, lieu } = result.data
  const dateFR = formatDateFR(dateMariage)
  const lieuTxt = ville || lieu || ''

  // ✅ Titre 50-60 chars optimal
  const title = dateFR
    ? `${marie1Prenom} & ${marie2Prenom} se marient le ${dateFR}`
    : `${marie1Prenom} & ${marie2Prenom} — Vous êtes invité(e) à notre mariage`

  // ✅ Description 110-160 chars optimal
  const descParts = [
    `${marie1Prenom} & ${marie2Prenom} ont l'immense joie de vous convier à leur mariage`,
    dateFR && `le ${dateFR}`,
    lieuTxt && `à ${lieuTxt}`,
  ].filter(Boolean)
  const description = descParts.join(' ') + '. Découvrez les informations et confirmez votre présence.'

  // ✅ MÊME transformation Cloudinary que dans le composant
  const rawPhoto = result.data.photosFond?.[0] || result.data.photoFond
  const ogImage = toCloudinaryOgUrl(rawPhoto)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'fr_FR',
      url: `/${slug}`,
      siteName: "Lov'it — Invitations de mariage",
      images: ogImage ? [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `Invitation de mariage de ${marie1Prenom} & ${marie2Prenom}`,
        type: 'image/jpeg',
      }] : [],
    },
    // ✅ Twitter Card : même rendu sur X, LinkedIn, iMessage
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    // ✅ Invitations privées : pas d'indexation Google
    robots: { index: false, follow: false },
  }
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getData(slug) // ← cache() → pas de 2e appel Redis

  const prenom1 = result?.data?.marie1Prenom || ''
  const prenom2 = result?.data?.marie2Prenom || ''
  const rawPhoto = result?.data?.photosFond?.[0] || result?.data?.photoFond || ''
  const photo = toCloudinaryOgUrl(rawPhoto)
  const accent = '#C9A84C'
  const targetUrl = result?.shareId
    ? `/faire-part?share=${result.shareId}&role=guest`
    : '/faire-part'

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