import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'

const SHARES_DIR = '/tmp/shares'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const id = randomUUID()
    await mkdir(SHARES_DIR, { recursive: true })
    await writeFile(path.join(SHARES_DIR, `${id}.json`), JSON.stringify(data), 'utf8')
    return Response.json({ id })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
