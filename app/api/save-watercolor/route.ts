/**
 * Télécharge une image Replicate (URL temporaire ~1h) et la re-uploade
 * sur Cloudinary pour un stockage permanent.
 *
 * Utilise l'upload unsigned Cloudinary (pas besoin de clé API secrète).
 * Nécessite un upload preset "lovit_watercolor" créé dans le dashboard
 * Cloudinary avec mode "unsigned".
 */

const CLOUD_NAME = 'dau96mui2'
const UPLOAD_PRESET = 'lovit_watercolor'

export async function POST(req: Request) {
  if (process.env.ENABLE_AI_WATERCOLOR !== 'true') {
    return new Response('Not found', { status: 404 })
  }

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
    const imgBlob = await imgResponse.blob()

    // Uploader sur Cloudinary via l'API unsigned
    const formData = new FormData()
    formData.append('file', imgBlob, 'watercolor.png')
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', 'watercolors')

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!cloudRes.ok) {
      const err = await cloudRes.text()
      console.error('Cloudinary upload error:', err)
      return Response.json({ error: 'Erreur upload Cloudinary' }, { status: 502 })
    }

    const cloudData = await cloudRes.json() as { secure_url: string }

    return Response.json({ url: cloudData.secure_url })
  } catch (err) {
    console.error('Erreur save-watercolor:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
