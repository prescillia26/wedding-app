import { redis } from '@/lib/redis'
import { getCurrentUser } from '@/lib/auth'

interface RsvpEntry {
  nom?: string
  reponses?: { ceremonie: string; present: boolean; nbPersonnes: number }[]
}

interface FairepartData {
  marie1Prenom?: string
  marie2Prenom?: string
  ceremonies?: { type: string; date: string; lieu: string }[]
  photosFond?: string[]
  style?: string
  slug?: string
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return Response.json({ error: 'Non connecté' }, { status: 401 })
    }

    // Récupérer les données de chaque faire-part
    const faireparts = await Promise.all(
      user.faireparts.map(async (shareId) => {
        const [data, rsvps] = await Promise.all([
          redis.get<FairepartData>(shareId),
          redis.get<RsvpEntry[]>(`rsvp:${shareId}`) ?? [],
        ])

        const rsvpList = rsvps ?? []
        const totalInvites = rsvpList.length
        const confirmes = rsvpList.filter(r =>
          r.reponses?.some(rep => rep.present)
        ).length

        return {
          shareId,
          marie1Prenom: data?.marie1Prenom ?? '',
          marie2Prenom: data?.marie2Prenom ?? '',
          ceremonies: data?.ceremonies ?? [],
          photo: data?.photosFond?.[0] ?? null,
          style: data?.style ?? 'rose-fleuri',
          slug: data?.slug ?? '',
          rsvp: { total: totalInvites, confirmes },
        }
      })
    )

    return Response.json({
      email: user.email,
      needsPassword: user.needsPassword,
      faireparts,
    })
  } catch (err) {
    console.error('dashboard error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
