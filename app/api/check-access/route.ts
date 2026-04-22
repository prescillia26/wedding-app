import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

interface PromoEntry {
  email: string
  pack: string
  createdAt: string
  usedAt?: string
  usedBy?: string
  // ✅ NOUVEAU : on stocke le accessCode généré à la 1ère utilisation
  // pour pouvoir le redonner à la même personne au retour
  accessCode?: string
}

const ACCESS_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateAccessCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += ACCESS_CHARS[Math.floor(Math.random() * ACCESS_CHARS.length)]
  }
  return code
}

export async function POST(request: Request) {
  try {
    const { code, email } = await request.json() as { code: string; email: string }
    const normalized = code?.toUpperCase().trim()
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalized) return Response.json({ valid: false, reason: 'Code manquant' })
    if (!normalizedEmail) return Response.json({ valid: false, reason: 'Email manquant' })

    const data = await redis.get<PromoEntry>(`promo:${normalized}`)
    if (!data) return Response.json({ valid: false, reason: 'Code promo invalide' })

    // Vérif email correspondant (inchangé)
    if (data.email.toLowerCase() !== normalizedEmail) {
      return Response.json({ valid: false, reason: 'Cet email ne correspond pas à ce code promo' })
    }

    // ✅ CAS 1 : Code déjà utilisé par CETTE personne → on lui redonne son accès
    if (data.usedAt && data.accessCode) {
      // On vérifie que l'accessCode existe toujours dans Redis (sécurité)
      const existingAccess = await redis.get(`access:${data.accessCode}`)
      if (existingAccess) {
        return Response.json({
          valid: true,
          accessCode: data.accessCode,
          pack: data.pack,
          returning: true, // flag pour que le front puisse afficher "Bon retour !"
        })
      }
      // Si l'access a expiré (1 an dépassé), on regénère un nouveau accessCode
    }

    // ✅ CAS 2 : Code utilisé mais pas de accessCode stocké (ancienne version du code)
    //           OU accessCode expiré
    //           → on régénère un access pour cette personne (c'est bien la même)

    // ✅ CAS 3 : Première utilisation
    // Dans tous les cas où on arrive ici, on génère un nouveau accessCode
    const accessCode = generateAccessCode()
    const entry = {
      pack: data.pack || 'premium',
      email: normalizedEmail,
      promo: normalized,
      date: new Date().toISOString(),
    }

    // Stocker l'accessCode valable 1 an
    await redis.set(`access:${accessCode}`, entry, { ex: 60 * 60 * 24 * 365 })

    // ✅ Mettre à jour la promo avec usedAt + accessCode (pour les prochains retours)
    await redis.set(`promo:${normalized}`, {
      ...data,
      usedAt: data.usedAt || new Date().toISOString(), // garde la 1ère date d'usage
      usedBy: normalizedEmail,
      accessCode, // ← essentiel : on mémorise le code pour la prochaine visite
    })

    // ✅ BONUS : index inverse email → accessCode pour recherche future
    await redis.set(`email-access:${normalizedEmail}`, accessCode, { ex: 60 * 60 * 24 * 365 })

    return Response.json({
      valid: true,
      accessCode,
      pack: data.pack,
      returning: !!data.usedAt, // true si elle revient, false si 1ère fois
    })
  } catch (err) {
    console.error('check-promo error:', err)
    return Response.json({ valid: false, reason: 'Erreur serveur' }, { status: 500 })
  }
}