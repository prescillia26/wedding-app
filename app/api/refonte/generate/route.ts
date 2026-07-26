import { NextResponse } from 'next/server'
import { generateStaticHtml, type GenerateInput } from '@/lib/refonte/generate-html'

export async function POST(request: Request) {
  try {
    const body = await request.json() as GenerateInput

    // Validation minimale
    if (!body.marie1Prenom || !body.marie2Prenom) {
      return NextResponse.json({ error: 'Prénoms des mariés requis' }, { status: 400 })
    }
    if (!body.evenements || body.evenements.length === 0) {
      return NextResponse.json({ error: 'Au moins un événement requis' }, { status: 400 })
    }

    const html = generateStaticHtml(body)

    return NextResponse.json({ html })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur interne'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
