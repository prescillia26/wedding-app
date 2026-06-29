import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { logoUrl, color } = await request.json()

    if (!logoUrl) {
      return Response.json({ error: 'URL requise' }, { status: 400 })
    }

    const hex = (color || '').replace('#', '')

    // Si l'URL est sur Cloudinary, on peut utiliser les transformations serveur
    if (logoUrl.includes('cloudinary.com') && logoUrl.includes('/upload/')) {
      const transformedUrl = hex
        ? logoUrl.replace('/upload/', `/upload/e_background_removal/e_trim/e_colorize:100,co_rgb:${hex}/`)
        : logoUrl.replace('/upload/', '/upload/e_background_removal/e_trim/')

      const imgRes = await fetch(transformedUrl)
      if (imgRes.ok) {
        const imageBuffer = await imgRes.arrayBuffer()
        const filename = `logos/logo-${Date.now()}.png`
        const blob = await put(filename, imageBuffer, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })
        return Response.json({ url: blob.url })
      }
    }

    // Pour les URLs non-Cloudinary (Vercel Blob), retourner l'URL telle quelle
    // La colorisation sera gérée côté client via CSS filter
    const imgRes = await fetch(logoUrl)
    if (!imgRes.ok) {
      return Response.json({ error: 'Impossible de transformer le logo' }, { status: 500 })
    }
    const imageBuffer = await imgRes.arrayBuffer()

    // Re-uploader l'image pré-générée sur Vercel Blob
    const filename = `logos/logo-${Date.now()}.png`
    const blob = await put(filename, imageBuffer, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })

    return Response.json({ url: blob.url })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
