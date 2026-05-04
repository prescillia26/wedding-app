import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const PACK_PRICES: Record<string, number> = {
  essentiel: 79,
  premium: 129,
  luxe: 199,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('adminPassword') !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    // Récupérer tous les codes d'accès (= ventes)
    const accessKeys = await redis.keys('access:*')
    const rsvpKeys = await redis.keys('rsvp:*')

    interface AccessEntry { pack?: string; email?: string; date?: string; sessionId?: string }

    const accessValues = accessKeys.length
      ? await Promise.all(accessKeys.map(k => redis.get<AccessEntry>(k)))
      : []

    // Filtrer les entrées valides (ignorer les nulls)
    const sales = accessValues.filter(Boolean) as AccessEntry[]

    // Stats par pack
    const byPack: Record<string, number> = {}
    let revenue = 0
    sales.forEach(s => {
      const pack = s.pack || 'premium'
      byPack[pack] = (byPack[pack] || 0) + 1
      revenue += PACK_PRICES[pack] || 0
    })

    // Ventes par jour (30 derniers jours)
    const salesByDay: Record<string, number> = {}
    sales.forEach(s => {
      if (s.date) {
        const day = s.date.split('T')[0]
        salesByDay[day] = (salesByDay[day] || 0) + 1
      }
    })
    const salesByDayArr = Object.entries(salesByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ date, count }))

    // Compter les RSVP
    let totalRsvp = 0
    if (rsvpKeys.length) {
      const rsvpValues = await Promise.all(rsvpKeys.map(k => redis.get<unknown[]>(k)))
      rsvpValues.forEach(v => { if (Array.isArray(v)) totalRsvp += v.length })
    }

    // Liste clients (accès récents, max 50)
    const clients = sales
      .filter(s => s.email && s.date)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      .slice(0, 50)
      .map(s => ({
        email: s.email,
        pack: s.pack || 'premium',
        date: s.date,
        sessionId: s.sessionId,
      }))

    return Response.json({
      totalSales: sales.length,
      totalRsvp,
      revenue,
      byPack,
      salesByDay: salesByDayArr,
      clients,
    })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
