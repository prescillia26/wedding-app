import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'

const RSVP_DIR = '/tmp/rsvp'
const RSVP_FILE = path.join(RSVP_DIR, 'responses.json')

export async function POST(request: Request) {
  try {
    const data = await request.json()
    await mkdir(RSVP_DIR, { recursive: true })
    let existing: unknown[] = []
    try {
      const content = await readFile(RSVP_FILE, 'utf8')
      existing = JSON.parse(content)
    } catch { /* fichier inexistant, on commence à zéro */ }
    existing.push(data)
    await writeFile(RSVP_FILE, JSON.stringify(existing, null, 2), 'utf8')
    return Response.json({ ok: true })
  } catch (err) {
    console.error('rsvp error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
