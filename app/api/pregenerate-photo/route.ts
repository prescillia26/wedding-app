import { NextRequest } from 'next/server'

const CLOUD_NAME = 'dau96mui2'

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, width = 800, height = 1200 } = await request.json()

    if (!photoUrl || !photoUrl.includes('cloudinary.com')) {
      return Response.json({ error: 'URL Cloudinary requise' }, { status: 400 })
    }

    // Appliquer le face crop côté serveur (une seule transformation)
    const transformedUrl = photoUrl.replace(
      '/upload/',
      `/upload/w_${width},h_${height},c_fill,g_auto:faces,q_auto,f_auto/`
    )

    // Télécharger l'image transformée
    const imgRes = await fetch(transformedUrl)
    if (!imgRes.ok) {
      return Response.json({ error: 'Impossible de transformer la photo' }, { status: 500 })
    }
    const blob = await imgRes.blob()

    // Re-uploader l'image pré-générée (sans transformation)
    const fd = new FormData()
    fd.append('file', blob, 'photo.jpg')
    fd.append('upload_preset', 'wedding_music')

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: fd,
    })
    const uploadData = await uploadRes.json()

    if (!uploadData.secure_url) {
      return Response.json({ error: 'Upload échoué' }, { status: 500 })
    }

    return Response.json({ url: uploadData.secure_url })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
