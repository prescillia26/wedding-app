import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, width = 800, height = 1200 } = await request.json()

    if (!photoUrl || !photoUrl.includes('cloudinary.com')) {
      return Response.json({ error: 'URL Cloudinary requise' }, { status: 400 })
    }

    // Appliquer le face crop côté serveur (une seule transformation)
    // (Cloudinary transformation URLs for reading are kept as-is)
    const transformedUrl = photoUrl.replace(
      '/upload/',
      `/upload/w_${width},h_${height},c_fill,g_auto:faces,q_auto,f_auto/`
    )

    // Télécharger l'image transformée
    const imgRes = await fetch(transformedUrl)
    if (!imgRes.ok) {
      return Response.json({ error: 'Impossible de transformer la photo' }, { status: 500 })
    }
    const imageBuffer = await imgRes.arrayBuffer()

    // Re-uploader l'image pré-générée sur Vercel Blob
    const filename = `photos/photo-${Date.now()}.jpg`
    const blob = await put(filename, imageBuffer, { access: 'public' })

    return Response.json({ url: blob.url })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
