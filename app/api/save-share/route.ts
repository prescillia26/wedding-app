import { randomUUID } from 'crypto'
import { redis } from '@/lib/redis'
import { getSession, type User } from '@/lib/auth'

const MAX_BYTES = 900_000

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { fixedId, ...shareData } = data

    const id = fixedId ?? randomUUID()

    // Vérifier la propriété si c'est une mise à jour (fixedId fourni)
    const session = await getSession()
    if (fixedId) {
      const existing = await redis.get<Record<string, unknown>>(fixedId)
      if (existing && existing.ownerEmail) {
        // Si connecté avec le bon email → OK
        // Si pas connecté → on laisse passer (la session a pu expirer mais
        // l'utilisateur a le shareId = il est le propriétaire)
        if (session?.email && session.email !== existing.ownerEmail) {
          return Response.json({ error: 'Accès non autorisé' }, { status: 403 })
        }
        // Conserver le ownerEmail existant
        shareData.ownerEmail = existing.ownerEmail
      }
      if (!existing?.ownerEmail && session?.email) {
        shareData.ownerEmail = session.email
      }
    }

    // Debug: loguer les champs logo pour diagnostiquer le problème
    console.log('[save-share] customLogoUrl:', shareData.customLogoUrl || '(vide)')
    console.log('[save-share] luxeMonogramUrl:', shareData.luxeMonogramUrl || '(vide)')
    console.log('[save-share] fixedId:', fixedId || '(nouveau)')

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

    // ✅ Vérification : relire immédiatement ce qui a été sauvé pour confirmer
    const verification = await redis.get<Record<string, unknown>>(id)
    console.log('[save-share] VERIFICATION après écriture — customLogoUrl:', verification?.customLogoUrl || '(ABSENT!)')
    console.log('[save-share] VERIFICATION — nombre de clés:', verification ? Object.keys(verification).length : 0)

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
            // Même propriétaire (ancien ID du même faire-part) → mettre à jour le slug + syncer l'ancien ID
            console.log('[save-share] Slug réattribué:', slug, existingSlugOwner, '→', id)
            await redis.set(`slug:${slug}`, id, { ex: 31536000 })
            // ✅ Aussi mettre à jour l'ancien ID pour que les liens déjà envoyés affichent les nouvelles données
            await redis.set(existingSlugOwner, shareData, { ex: 31536000 })
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
