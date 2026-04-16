import { readFile } from 'fs/promises'
import path from 'path'

const SHARES_DIR = '/tmp/shares'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id || !/^[0-9a-f-]+$/i.test(id)) {
      return Response.json({ error: 'ID invalide' }, { status: 400 })
    }
    const filePath = path.join(SHARES_DIR, `${id}.json`)
    const content = await readFile(filePath, 'utf8')
    return Response.json(JSON.parse(content))
  } catch (err) {
    console.error('get-share error:', err)
    return Response.json({ error: 'Faire-part introuvable' }, { status: 404 })
  }
}
