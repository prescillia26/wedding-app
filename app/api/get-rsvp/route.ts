import { readFile } from 'fs/promises'
import path from 'path'

const RSVP_DIR = '/tmp/rsvp'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')
    if (!shareId) return Response.json({ error: 'shareId manquant' }, { status: 400 })
    const file = path.join(RSVP_DIR, `${shareId}.json`)
    try {
      const content = await readFile(file, 'utf8')
      return Response.json(JSON.parse(content))
    } catch {
      return Response.json([])
    }
  } catch (err) {
    console.error('get-rsvp error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
