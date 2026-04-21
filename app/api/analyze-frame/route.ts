import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { frameLabel, contentLines, evenementsCount } = await request.json()

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Tu es un expert en design de faire-part de mariage. Analyse ce faire-part et suggère des valeurs de padding optimales pour que le texte soit bien centré dans le cadre floral, lisible et esthétique.

Cadre utilisé : ${frameLabel}
Nombre de lignes de texte : ${contentLines}
Nombre d'événements : ${evenementsCount}

Réponds UNIQUEMENT avec un JSON valide, sans texte autour :
{"paddingV": <nombre entre 5 et 40>, "paddingH": <nombre entre 5 et 35>}

Règles :
- paddingV = espace haut/bas en % (plus de texte = moins de padding)
- paddingH = espace gauche/droite en %
- Pour un cadre couronne (fleurs en haut/bas) : paddingV entre 20-35
- Pour un cadre complet (fleurs tout autour) : paddingV entre 15-25, paddingH entre 12-20
- Moins de contenu = plus de padding pour centrer visuellement`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const result = JSON.parse(text.trim())

    if (
      typeof result.paddingV !== 'number' ||
      typeof result.paddingH !== 'number' ||
      result.paddingV < 5 || result.paddingV > 40 ||
      result.paddingH < 5 || result.paddingH > 35
    ) {
      return NextResponse.json({ paddingV: 18, paddingH: 15 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analyze frame error:', error)
    return NextResponse.json({ paddingV: 18, paddingH: 15 })
  }
}
