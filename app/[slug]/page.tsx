import { Redis } from '@upstash/redis'
import type { Metadata } from 'next'
import { cache } from 'react'
import RedirectClient from './redirect-client'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// ✅ Fonction unique qui transforme une URL Cloudinary au format OG parfait
function toCloudinaryOgUrl(raw: string | undefined | null, version?: number): string {
  if (!raw) return ''
  if (raw.includes('/upload/')) {
    const url = raw.replace('/upload/', '/upload/w_1200,h_630,c_fill,g_face:center,q_auto,f_auto/')
    // Ajouter un paramètre de version pour invalider le cache WhatsApp/Facebook quand les photos changent
    return version ? `${url}?v=${version}` : url
  }
  return version ? `${raw}?v=${version}` : raw
}

// ✅ React cache() : évite que Redis soit appelé 2 fois par page
// (une fois dans generateMetadata + une fois dans SlugPage → mutualisé)
const getData = cache(async (slug: string) => {
  const shareId = await redis.get<string>(`slug:${slug}`)
  if (!shareId) return null
  const data = await redis.get<{
    marie1Prenom?: string
    marie2Prenom?: string
    photosFond?: string[]
    photoFond?: string
    dateMariage?: string
    ville?: string
    lieu?: string
    ogVersion?: number
    customLogoUrl?: string
    luxeMonogramUrl?: string
    ceremonies?: { illustrationUrl?: string }[]
    style?: string
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

  // Priorité OG image : photo uploadée > illustration cérémonie > logo custom > monogramme
  const rawPhoto = result.data.photosFond?.[0]
    || result.data.photoFond
    || result.data.ceremonies?.find(c => c.illustrationUrl)?.illustrationUrl
    || result.data.customLogoUrl
    || result.data.luxeMonogramUrl
    || ''
  const ogImage = rawPhoto ? toCloudinaryOgUrl(rawPhoto, result.data.ogVersion) : ''

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
      images: [{
        url: ogImage || 'https://res.cloudinary.com/dau96mui2/image/upload/w_1200,h_630,c_fill,q_auto/v1780178453/watercolors/st6oedinlfobqf1tqgkk.png',
        width: 1200,
        height: 630,
        alt: `Invitation de mariage de ${marie1Prenom} & ${marie2Prenom}`,
        type: 'image/png',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage || 'https://res.cloudinary.com/dau96mui2/image/upload/w_1200,h_630,c_fill,q_auto/v1780178453/watercolors/st6oedinlfobqf1tqgkk.png'],
    },
    robots: { index: false, follow: false },
  }
}

// ✅ UNE SEULE fonction SlugPage (pas deux !)
export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getData(slug)

  const rawPhoto = result?.data?.photosFond?.[0]
    || result?.data?.photoFond
    || result?.data?.ceremonies?.find(c => c.illustrationUrl)?.illustrationUrl
    || result?.data?.customLogoUrl
    || result?.data?.luxeMonogramUrl
    || ''
  const photo = rawPhoto ? toCloudinaryOgUrl(rawPhoto, result?.data?.ogVersion) : ''
  const accent = '#C9A84C'
  const targetUrl = result?.shareId
    ? `/faire-part?share=${result.shareId}&role=guest`
    : '/faire-part'

  return (
    <>
      {/* ✅ Redirection automatique des humains (bots ignorent le JS) */}
      <RedirectClient to={targetUrl} />

      {/* Écran de transition (~100ms) + fallback si JS désactivé */}
      <div style={{ background: '#fdf8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>
        <div style={{ textAlign: 'center', padding: '48px 32px', maxWidth: 400 }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accent}`, marginBottom: 28 }} />
          )}
          <div style={{ fontSize: 14, color: '#8a6040', marginTop: 20 }}>
            Redirection vers votre invitation…
          </div>
          <noscript>
            <a href={targetUrl} style={{ display: 'inline-block', marginTop: 20, padding: '14px 40px', border: `1.5px solid ${accent}`, borderRadius: 9999, color: accent, textDecoration: 'none' }}>
              Accéder à l&apos;invitation ✦
            </a>
          </noscript>
        </div>
      </div>
    </>
  )
}