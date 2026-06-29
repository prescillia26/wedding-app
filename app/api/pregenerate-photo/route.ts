import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, width = 800, height = 1200 } = await request.json()

    if (!photoUrl) {
      return Response.json({ error: 'URL requise' }, { status: 400 })
    }

    let imageBuffer: ArrayBuffer

    // Si l'URL est sur Cloudinary, on peut utiliser le face crop serveur
    if (photoUrl.includes('cloudinary.com') && photoUrl.includes('/upload/')) {
      const transformedUrl = photoUrl.replace(
        '/upload/',
        `/upload/w_${width},h_${height},c_fill,g_auto:faces,q_auto,f_auto/`
      )
      const imgRes = await fetch(transformedUrl)
      if (!imgRes.ok) {
        return Response.json({ error: 'Impossible de transformer la photo' }, { status: 500 })
      }
      imageBuffer = await imgRes.arrayBuffer()
    } else {
      // Pour les URLs non-Cloudinary (Vercel Blob), télécharger tel quel
      const imgRes = await fetch(photoUrl)
      if (!imgRes.ok) {
        return Response.json({ error: 'Impossible de télécharger la photo' }, { status: 500 })
      }
      imageBuffer = await imgRes.arrayBuffer()
    }

    // Re-uploader l'image pré-générée sur Vercel Blob
    const filename = `photos/photo-${Date.now()}.jpg`
    const blob = await put(filename, imageBuffer, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })

    return Response.json({ url: blob.url })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
