import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const { logoUrl, color } = await request.json()

    if (!logoUrl || !logoUrl.includes('cloudinary.com')) {
      return Response.json({ error: 'URL Cloudinary requise' }, { status: 400 })
    }

    const hex = (color || '').replace('#', '')

    // Construire l'URL transformée
    // (Cloudinary transformation URLs for reading are kept as-is)
    const transformedUrl = hex
      ? logoUrl.replace('/upload/', `/upload/e_background_removal/e_trim/e_colorize:100,co_rgb:${hex}/`)
      : logoUrl.replace('/upload/', '/upload/e_background_removal/e_trim/')

    // Télécharger l'image transformée
    const imgRes = await fetch(transformedUrl)
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
