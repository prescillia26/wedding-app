import type { Metadata } from 'next'
import { redis } from '@/lib/redis'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ share?: string }> | undefined }): Promise<Metadata> {
  if (!searchParams) return {}
  const params = await searchParams
  const shareId = params?.share
  if (!shareId) return {}

  try {
    const data = await redis.get<Record<string, unknown>>(shareId)
    if (!data) return {}

    const prenom1 = (data.marie1Prenom as string) || ''
    const prenom2 = (data.marie2Prenom as string) || ''
    const title = prenom1 && prenom2 ? `${prenom1} & ${prenom2}` : "Faire-part de mariage"
    const description = `${prenom1} & ${prenom2} ont le plaisir de vous convier à leur mariage`
    const image = (data.illustrationCoupleId as string) || (data.videoPosterUrl as string) || (data.customLogoUrl as string) || ''

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default function FairePartLayout({ children }: { children: React.ReactNode }) {
  return children
}
