import { NextRequest } from 'next/server'

const CLOUD_NAME = 'dau96mui2'

export async function POST(request: NextRequest) {
  try {
    const { logoUrl, color } = await request.json()

    if (!logoUrl || !logoUrl.includes('cloudinary.com')) {
      return Response.json({ error: 'URL Cloudinary requise' }, { status: 400 })
    }

    const hex = (color || '').replace('#', '')

    // Construire l'URL transformée
    const transformedUrl = hex
      ? logoUrl.replace('/upload/', `/upload/e_background_removal/e_trim/e_colorize:100,co_rgb:${hex}/`)
      : logoUrl.replace('/upload/', '/upload/e_background_removal/e_trim/')

    // Télécharger l'image transformée
    const imgRes = await fetch(transformedUrl)
    if (!imgRes.ok) {
      return Response.json({ error: 'Impossible de transformer le logo' }, { status: 500 })
    }
    const blob = await imgRes.blob()

    // Re-uploader l'image pré-générée (sans transformation)
    const fd = new FormData()
    fd.append('file', blob, 'logo.png')
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
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
