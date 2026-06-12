import { randomUUID } from 'crypto'
import { redis } from '@/lib/redis'
import { getSession, type User } from '@/lib/auth'

const MAX_BYTES = 4_000_000

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { fixedId, ...shareData } = data

    const id = fixedId ?? randomUUID()

    // ── Vérification paiement / authentification ──
    // Pour CRÉER un nouveau partage (pas de fixedId), l'utilisateur DOIT être connecté (= a payé)
    const session = await getSession()
    if (!fixedId && !session?.email) {
      return Response.json({ error: 'Vous devez être connecté pour partager votre faire-part. Veuillez d\'abord effectuer le paiement.' }, { status: 403 })
    }

    // Vérifier la propriété si c'est une mise à jour (fixedId fourni)
    // Quiconque a le shareId peut modifier (il faut le shareId pour modifier)
    // L'ownerEmail est préservé — jamais écrasé
    // ⚠️ FUSION : on merge les nouvelles données avec les existantes pour ne rien perdre
    let mergedData = { ...shareData }
    if (fixedId) {
      const existing = await redis.get<Record<string, unknown>>(fixedId)
      if (existing) {
        // Fusionner : les données envoyées prennent le dessus sur les existantes
        mergedData = { ...existing, ...shareData }
        // Fusionner les objets imbriqués (textOverrides, zoneStyles, accueilLayout)
        if (existing.textOverrides && shareData.textOverrides) {
          mergedData.textOverrides = { ...(existing.textOverrides as Record<string, string>), ...shareData.textOverrides }
        }
        if (existing.zoneStyles && shareData.zoneStyles) {
          mergedData.zoneStyles = { ...(existing.zoneStyles as Record<string, unknown>), ...shareData.zoneStyles }
        }
        if (existing.accueilLayout && shareData.accueilLayout) {
          mergedData.accueilLayout = { ...(existing.accueilLayout as Record<string, unknown>), ...shareData.accueilLayout }
        }
        // Préserver l'ownerEmail
        if (existing.ownerEmail) {
          mergedData.ownerEmail = existing.ownerEmail as string
        }
      }
    }

    if (session?.email) {
      mergedData.ownerEmail = session.email
    }

    const size = new TextEncoder().encode(JSON.stringify(mergedData)).length
    if (size > MAX_BYTES) {
      return Response.json({ error: 'Données trop volumineuses.' }, { status: 413 })
    }

    // Timestamp pour invalider le cache des previews WhatsApp/Facebook quand les photos changent
    mergedData.ogVersion = Date.now()
    await redis.set(id, mergedData, { ex: 31536000 })

    // Sauvegarder un snapshot initial (uniquement à la première génération)
    const initialExists = await redis.exists(`${id}:initial`)
    if (!initialExists) {
      await redis.set(`${id}:initial`, mergedData, { ex: 31536000 })
    }

    if (mergedData.emailMaries) {
      await redis.set(`email:${id}`, mergedData.emailMaries as string, { ex: 31536000 })
    }
    if (mergedData.emailMaries2) {
      await redis.set(`email2:${id}`, mergedData.emailMaries2 as string, { ex: 31536000 })
    }

    if (mergedData.slug) {
      const slug = (mergedData.slug as string).toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (slug) {
        const existingSlugOwner = await redis.get<string>(`slug:${slug}`)
        if (existingSlugOwner && existingSlugOwner !== id) {
          const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
          let suffix = ''
          for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
          const newSlug = `${slug}-${suffix}`
          mergedData.slug = newSlug
          await redis.set(`slug:${newSlug}`, id, { ex: 31536000 })
        } else {
          await redis.set(`slug:${slug}`, id, { ex: 31536000 })
        }
      }
    }

    // Lier le faire-part au compte utilisateur
    if (session?.email) {
      const user = await redis.get<User>(`user:${session.email}`)
      if (user && !user.faireparts.includes(id)) {
        user.faireparts.push(id)
        await redis.set(`user:${session.email}`, user)
      }
    }

    return Response.json({ id, slug: mergedData.slug || null })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
