/**
 * Script de migration : télécharge tous les assets statiques de Cloudinary
 * et les uploade sur Vercel Blob, puis génère un fichier de mapping URL.
 */
import { put } from '@vercel/blob'
import * as fs from 'fs'
import * as path from 'path'

// Load env
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN!
if (!TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN in .env.local')
  process.exit(1)
}

interface MigrationResult {
  oldUrl: string
  newUrl: string
}

async function migrateUrl(url: string): Promise<MigrationResult | null> {
  try {
    // Download from Cloudinary
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`  SKIP (${res.status}): ${url.slice(-60)}`)
      return null
    }
    const buffer = Buffer.from(await res.arrayBuffer())

    // Determine filename from URL
    const urlPath = new URL(url).pathname
    const parts = urlPath.split('/')
    const filename = parts.slice(-2).join('/') // e.g. "orn1_floral_xyzabc.png"
    const blobPath = `static/${filename}`

    // Upload to Vercel Blob
    const blob = await put(blobPath, buffer, {
      access: 'public',
      token: TOKEN,
    })

    console.log(`  OK: ${url.slice(-50)} → ${blob.url.slice(-60)}`)
    return { oldUrl: url, newUrl: blob.url }
  } catch (e) {
    console.error(`  ERROR: ${url.slice(-60)}: ${e}`)
    return null
  }
}

async function main() {
  // Extract all Cloudinary URLs from source files
  const sourceFiles = [
    'app/faire-part/page.tsx',
    'app/[slug]/page.tsx',
    'lib/visuals.ts',
    'lib/delimiters.ts',
    'app/page.tsx',
  ]

  const root = path.join(__dirname, '..')
  const allUrls = new Set<string>()

  for (const file of sourceFiles) {
    const content = fs.readFileSync(path.join(root, file), 'utf-8')
    const matches = content.match(/https:\/\/res\.cloudinary\.com\/dau96mui2\/[^\s'"`)]+/g)
    if (matches) {
      for (const url of matches) {
        allUrls.add(url)
      }
    }
  }

  console.log(`Found ${allUrls.size} unique Cloudinary URLs to migrate\n`)

  const results: MigrationResult[] = []
  const urls = Array.from(allUrls)

  // Process in batches of 5 to avoid rate limits
  for (let i = 0; i < urls.length; i += 5) {
    const batch = urls.slice(i, i + 5)
    console.log(`Batch ${Math.floor(i / 5) + 1}/${Math.ceil(urls.length / 5)} (${i + 1}-${Math.min(i + 5, urls.length)}/${urls.length})`)

    const batchResults = await Promise.all(batch.map(url => migrateUrl(url)))
    for (const r of batchResults) {
      if (r) results.push(r)
    }

    // Small delay between batches
    if (i + 5 < urls.length) await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\n✅ Migrated ${results.length}/${allUrls.size} assets`)

  // Save mapping file
  const mappingPath = path.join(root, 'scripts', 'url-mapping.json')
  fs.writeFileSync(mappingPath, JSON.stringify(results, null, 2))
  console.log(`Mapping saved to ${mappingPath}`)

  // Apply replacements to source files
  console.log('\nApplying URL replacements to source files...')
  for (const file of sourceFiles) {
    const filePath = path.join(root, file)
    let content = fs.readFileSync(filePath, 'utf-8')
    let count = 0
    for (const { oldUrl, newUrl } of results) {
      const before = content
      content = content.split(oldUrl).join(newUrl)
      if (content !== before) count++
    }
    if (count > 0) {
      fs.writeFileSync(filePath, content)
      console.log(`  ${file}: ${count} URLs replaced`)
    }
  }

  console.log('\n🎉 Migration complete!')
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
