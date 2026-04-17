import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'

const RSVP_DIR = '/tmp/rsvp'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const shareId = data.shareId || 'default'
    await mkdir(RSVP_DIR, { recursive: true })
    const file = path.join(RSVP_DIR, `${shareId}.json`)
    let existing: unknown[] = []
    try {
      const content = await readFile(file, 'utf8')
      existing = JSON.parse(content)
    } catch { /* fichier inexistant, on commence à zéro */ }
    existing.push(data)
    await writeFile(file, JSON.stringify(existing, null, 2), 'utf8')
    return Response.json({ ok: true })
  } catch (err) {
    console.error('rsvp error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
