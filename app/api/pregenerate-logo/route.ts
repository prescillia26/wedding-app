import { NextRequest } from 'next/server'
import { put } from '@vercel/blob'
import * as sharpModule from 'sharp'
const sharp = (sharpModule as unknown as { default: typeof sharpModule.default }).default ?? sharpModule

// Parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

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

    // Pour les URLs non-Cloudinary (Vercel Blob) — coloriser avec sharp
    const imgRes = await fetch(logoUrl)
    if (!imgRes.ok) {
      return Response.json({ error: 'Impossible de transformer le logo' }, { status: 500 })
    }
    const imageBuffer = await imgRes.arrayBuffer()

    let outputBuffer: Buffer
    if (hex) {
      // Coloriser : teinter tous les pixels non-transparents avec la couleur demandée
      const { r, g, b } = hexToRgb(hex)
      const img = sharp(Buffer.from(imageBuffer)).ensureAlpha()
      const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })

      // Parcourir chaque pixel (RGBA) et remplacer la couleur en préservant l'alpha
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3]
        if (alpha > 0) {
          // Utiliser la luminosité du pixel original pour moduler la couleur cible
          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
          data[i] = Math.round(r * (1 - lum))     // R
          data[i + 1] = Math.round(g * (1 - lum)) // G
          data[i + 2] = Math.round(b * (1 - lum)) // B
          // Alpha reste inchangé
        }
      }

      outputBuffer = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .png()
        .toBuffer()
    } else {
      outputBuffer = Buffer.from(imageBuffer)
    }

    const filename = `logos/logo-${Date.now()}.png`
    const blob = await put(filename, outputBuffer, { access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })

    return Response.json({ url: blob.url })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
