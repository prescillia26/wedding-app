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
    if (fixedId) {
      const existing = await redis.get<Record<string, unknown>>(fixedId)
      if (existing && existing.ownerEmail) {
        if (session?.email) {
          // Vérifier si cet email fait partie du même compte (a ce faire-part dans ses faireparts)
          const user = await redis.get<User>(`user:${session.email}`)
          const ownsIt = user?.faireparts?.includes(fixedId) || session.email === existing.ownerEmail
          if (!ownsIt) {
            return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
          }
          // Mettre à jour l'ownerEmail si le compte a changé d'email
          shareData.ownerEmail = session.email
        } else {
          // Pas connecté → on laisse passer (la session a pu expirer mais
          // l'utilisateur a le shareId = il est le propriétaire)
          shareData.ownerEmail = existing.ownerEmail
        }
      }
      if (!existing?.ownerEmail && session?.email) {
        shareData.ownerEmail = session.email
      }
    }

    const size = new TextEncoder().encode(JSON.stringify(shareData)).length
    if (size > MAX_BYTES) {
      return Response.json({ error: 'Données trop volumineuses.' }, { status: 413 })
    }

    // Ajouter l'ownerEmail si connecté
    if (session?.email) {
      shareData.ownerEmail = session.email
    }

    // Timestamp pour invalider le cache des previews WhatsApp/Facebook quand les photos changent
    shareData.ogVersion = Date.now()
    await redis.set(id, shareData, { ex: 31536000 })

    // Sauvegarder un snapshot initial (uniquement à la première génération)
    const initialExists = await redis.exists(`${id}:initial`)
    if (!initialExists) {
      await redis.set(`${id}:initial`, shareData, { ex: 31536000 })
    }

    if (shareData.emailMaries) {
      await redis.set(`email:${id}`, shareData.emailMaries, { ex: 31536000 })
    }
    if (shareData.emailMaries2) {
      await redis.set(`email2:${id}`, shareData.emailMaries2, { ex: 31536000 })
    }

    if (shareData.slug) {
      const slug = shareData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (slug) {
        const existingSlugOwner = await redis.get<string>(`slug:${slug}`)
        if (existingSlugOwner && existingSlugOwner !== id) {
          // Slug pris par un autre ID — vérifier si c'est le MÊME propriétaire
          const otherData = await redis.get<Record<string, unknown>>(existingSlugOwner)
          if (otherData?.ownerEmail && otherData.ownerEmail === shareData.ownerEmail) {
            // Même propriétaire (ancien ID du même faire-part) → mettre à jour le slug + rediriger l'ancien ID
            await redis.set(`slug:${slug}`, id, { ex: 31536000 })
            // ✅ Poser un pointeur canonique sur l'ancien ID → get-share suivra le lien
            await redis.set(existingSlugOwner, { ...otherData, canonicalId: id }, { ex: 31536000 })
          } else {
            // Propriétaire différent → ajouter un suffixe aléatoire
            const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
            let suffix = ''
            for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
            const newSlug = `${slug}-${suffix}`
            shareData.slug = newSlug
            await redis.set(`slug:${newSlug}`, id, { ex: 31536000 })
          }
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

    return Response.json({ id, slug: shareData.slug || null })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
