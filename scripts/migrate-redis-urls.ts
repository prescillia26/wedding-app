/**
 * Migre les URLs Cloudinary uploadées par les clientes (dans Redis)
 * vers Vercel Blob. Ne touche PAS aux données existantes si la migration échoue.
 */
import { put } from '@vercel/blob'
import { Redis } from '@upstash/redis'
import * as path from 'path'

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!
if (!BLOB_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN')
  process.exit(1)
}

// Cache pour éviter de re-uploader le même fichier
const migrated = new Map<string, string>()

async function migrateUrl(url: string): Promise<string> {
  // Déjà migré ?
  if (migrated.has(url)) return migrated.get(url)!

  // Pas une URL Cloudinary user-upload ? On ne touche pas
  if (!url.includes('res.cloudinary.com/dau96mui2')) return url

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`    SKIP (${res.status}): ${url.slice(-50)}`)
      return url // On garde l'ancienne URL si le fichier n'existe plus
    }
    const buffer = Buffer.from(await res.arrayBuffer())

    // Extraire un nom de fichier propre
    const urlPath = new URL(url).pathname
    const segments = urlPath.split('/')
    const filename = segments.slice(-1)[0]
    const folder = url.includes('/video/') ? 'user-videos' : url.includes('/raw/') ? 'user-audio' : 'user-images'
    const blobPath = `${folder}/${Date.now()}-${filename}`

    const blob = await put(blobPath, buffer, {
      access: 'public',
      token: BLOB_TOKEN,
    })

    migrated.set(url, blob.url)
    console.log(`    OK: ...${url.slice(-40)} → ...${blob.url.slice(-50)}`)
    return blob.url
  } catch (e) {
    console.error(`    ERROR: ${url.slice(-50)}: ${e}`)
    return url // On garde l'ancienne URL en cas d'erreur
  }
}

function isCloudinaryUserUrl(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return value.includes('res.cloudinary.com/dau96mui2') &&
    (value.includes('/upload/') || value.includes('/video/upload/') || value.includes('/raw/upload/'))
}

async function migrateObject(obj: Record<string, unknown>): Promise<{ updated: Record<string, unknown>; count: number }> {
  let count = 0
  const result = { ...obj }

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && isCloudinaryUserUrl(value)) {
      const newUrl = await migrateUrl(value)
      if (newUrl !== value) {
        result[key] = newUrl
        count++
      }
    } else if (Array.isArray(value)) {
      const newArr = []
      for (const item of value) {
        if (typeof item === 'string' && isCloudinaryUserUrl(item)) {
          const newUrl = await migrateUrl(item)
          if (newUrl !== item) count++
          newArr.push(newUrl)
        } else if (item && typeof item === 'object') {
          const sub = await migrateObject(item as Record<string, unknown>)
          count += sub.count
          newArr.push(sub.updated)
        } else {
          newArr.push(item)
        }
      }
      result[key] = newArr
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const sub = await migrateObject(value as Record<string, unknown>)
      count += sub.count
      result[key] = sub.updated
    }
  }

  return { updated: result, count }
}

async function main() {
  console.log('Scanning Redis for faire-part data with Cloudinary URLs...\n')

  // Trouver toutes les clés de faire-parts
  let cursor = 0
  const allKeys: string[] = []

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { count: 100 })
    cursor = Number(nextCursor)
    // Filtrer les clés qui sont des faire-parts (pas des slugs, emails, users, etc.)
    for (const key of keys) {
      if (!key.startsWith('slug:') && !key.startsWith('email:') && !key.startsWith('email2:') &&
          !key.startsWith('user:') && !key.startsWith('rsvp:') && !key.endsWith(':initial') &&
          !key.startsWith('views:') && !key.startsWith('promo:') && !key.startsWith('plan:')) {
        allKeys.push(key)
      }
    }
  } while (cursor !== 0)

  console.log(`Found ${allKeys.length} potential faire-part keys\n`)

  let totalMigrated = 0

  for (const key of allKeys) {
    const data = await redis.get<Record<string, unknown>>(key)
    if (!data || typeof data !== 'object') continue

    // Vérifier s'il y a des URLs Cloudinary
    const json = JSON.stringify(data)
    if (!json.includes('res.cloudinary.com/dau96mui2')) continue

    console.log(`\n📋 Key: ${key}`)
    const { updated, count } = await migrateObject(data)

    if (count > 0) {
      // Sauvegarder avec les nouvelles URLs (garder le même TTL)
      await redis.set(key, updated, { ex: 31536000 })
      totalMigrated += count
      console.log(`  ✅ ${count} URLs migrées et sauvegardées`)
    }
  }

  console.log(`\n🎉 Migration terminée ! ${totalMigrated} URLs migrées au total`)
  console.log(`Cache: ${migrated.size} fichiers uniques transférés vers Vercel Blob`)
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
