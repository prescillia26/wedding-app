import { Redis } from '@upstash/redis'
import type { Metadata } from 'next'
import { cache } from 'react'
import RedirectClient from './redirect-client'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

// ✅ Transforme une URL Cloudinary au format OG (1200x630)
function toCloudinaryOgUrl(raw: string | undefined | null, version?: number, bgColor?: string, isPhoto?: boolean): string {
  if (!raw) return ''
  if (raw.includes('/upload/')) {
    const bg = bgColor ? bgColor.replace('#', '') : 'fdf8f0'
    const transform = isPhoto
      ? 'w_1200,h_630,c_fill,g_face:center,q_auto,f_auto'
      : `w_1200,h_630,c_pad,b_rgb:${bg},q_auto,f_auto`
    const url = raw.replace('/upload/', `/upload/${transform}/`)
    return version ? `${url}?v=${version}` : url
  }
  return version ? `${raw}?v=${version}` : raw
}

// Illustrations couples — pour résoudre l'OG image
const ILLU_COUPLES: Record<string, string> = {
  'couple-01': 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878822/81_pzfb2j.png',
  'couple-02': 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878824/82_gbqs4r.png',
  'couple-03': 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878831/83_iw0wq9.png',
  'couple-04': 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878834/88_e6oobi.png',
  'couple-05': 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878835/87_hejtki.png',
  'couple-06': 'https://res.cloudinary.com/dau96mui2/image/upload/v1776878838/94_l7zjbv.png',
  'couple-07': 'https://res.cloudinary.com/dau96mui2/image/upload/v1780498222/1_dpwtiu.png',
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
    illustrationCoupleId?: string
    styleAccueil?: string
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

  const coupleIlluUrl = result.data.illustrationCoupleId ? ILLU_COUPLES[result.data.illustrationCoupleId] : ''

  // Couleur de fond du thème pour le padding des illustrations
  const THEME_BG: Record<string, string> = {
    'rose-fleuri': '#fff9f6', 'ivoire-or': '#fffdf5', 'bleu-floral': '#f6f9ff',
    'champetre': '#f6faf4', 'blanc-gris': '#fafafa', 'noir-blanc': '#1a1a1a',
    'chocolat': '#2c1a0e', 'bordeaux': '#fdf5f5', 'bordeaux-nuit': '#1a0810',
    'fuchsia': '#fff5fc', 'marine-or': '#0a1628', 'menthe': '#f2fbf7',
  }
  const bgColor = THEME_BG[result.data.style || ''] || '#fdf8f0'

  // Priorité OG image : photo > illustration couple > illustration cérémonie > logo > monogramme > fallback
  const userPhoto = result.data.photosFond?.[0] || result.data.photoFond || ''
  const fallbackImage = coupleIlluUrl
    || result.data.ceremonies?.find(c => c.illustrationUrl)?.illustrationUrl
    || result.data.customLogoUrl
    || result.data.luxeMonogramUrl
    || ''
  const rawOg = userPhoto || fallbackImage
  const isPhoto = !!userPhoto
  const ogImage = rawOg ? toCloudinaryOgUrl(rawOg, result.data.ogVersion, bgColor, isPhoto) : ''

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

  const coupleIllu2 = result?.data?.illustrationCoupleId ? ILLU_COUPLES[result.data.illustrationCoupleId] : ''
  const userPhoto2 = result?.data?.photosFond?.[0] || result?.data?.photoFond || ''
  const fallback2 = coupleIllu2
    || result?.data?.ceremonies?.find(c => c.illustrationUrl)?.illustrationUrl
    || result?.data?.customLogoUrl
    || result?.data?.luxeMonogramUrl
    || ''
  const rawOg2 = userPhoto2 || fallback2
  const bgC = result?.data?.style ? (({ 'rose-fleuri': '#fff9f6', 'ivoire-or': '#fffdf5', 'bleu-floral': '#f6f9ff', 'champetre': '#f6faf4', 'blanc-gris': '#fafafa', 'noir-blanc': '#1a1a1a', 'chocolat': '#2c1a0e', 'bordeaux': '#fdf5f5', 'bordeaux-nuit': '#1a0810', 'fuchsia': '#fff5fc', 'marine-or': '#0a1628', 'menthe': '#f2fbf7' }) as Record<string, string>)[result.data.style] || '#fdf8f0' : '#fdf8f0'
  const photo = rawOg2 ? toCloudinaryOgUrl(rawOg2, result?.data?.ogVersion, bgC, !!userPhoto2) : ''
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