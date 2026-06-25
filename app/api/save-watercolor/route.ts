/**
 * Télécharge une image Replicate (URL temporaire ~1h) et la re-uploade
 * sur Vercel Blob pour un stockage permanent.
 */

import { put } from '@vercel/blob'

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json()

    if (!imageUrl || typeof imageUrl !== 'string') {
      return Response.json({ error: 'URL image manquante' }, { status: 400 })
    }

    // Vérifier que l'URL vient bien de Replicate
    if (!imageUrl.includes('replicate.delivery') && !imageUrl.includes('pbxt.replicate.delivery')) {
      return Response.json({ error: 'URL non autorisée' }, { status: 400 })
    }

    // Télécharger l'image depuis Replicate
    const imgResponse = await fetch(imageUrl)
    if (!imgResponse.ok) {
      return Response.json({ error: 'Impossible de télécharger l\'image' }, { status: 502 })
    }
    const imageBuffer = await imgResponse.arrayBuffer()

    // Uploader sur Vercel Blob
    const filename = `watercolors/watercolor-${Date.now()}.png`
    const blob = await put(filename, imageBuffer, { access: 'public' })

    return Response.json({ url: blob.url })
  } catch (err) {
    console.error('Erreur save-watercolor:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
