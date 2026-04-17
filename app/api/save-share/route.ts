import { randomUUID } from 'crypto'

declare global {
  // eslint-disable-next-line no-var
  var shareStore: Map<string, unknown>
}

globalThis.shareStore = globalThis.shareStore || new Map()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const id = randomUUID()
    globalThis.shareStore.set(id, data)
    return Response.json({ id })
  } catch (err) {
    console.error('save-share error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
