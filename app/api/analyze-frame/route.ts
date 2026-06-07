import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    // Rate limiting : max 10 analyses par IP par heure
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { Redis } = await import('@upstash/redis')
    const rl = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
    const rlKey = `ratelimit:analyze:${ip}`
    const rlCount = await rl.get<number>(rlKey) ?? 0
    if (rlCount >= 10) {
      return NextResponse.json({ error: "Trop de requêtes. Réessayez plus tard." }, { status: 429 })
    }
    await rl.set(rlKey, rlCount + 1, { ex: 3600 })

    const { imageBase64, frameLabel, currentSettings } = await request.json()

    if (!imageBase64) {
      return NextResponse.json({ framePaddingV: 20, framePaddingH: 16, textBg: 0.5, frameOpacity: 1 })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `Tu es expert en design de faire-part de mariage.
Analyse cette image d'un faire-part et propose des ajustements pour améliorer le rendu visuel.
Cadre floral utilisé : ${frameLabel ?? 'inconnu'}
Paramètres actuels : paddingV=${currentSettings?.framePaddingV ?? 20}%, paddingH=${currentSettings?.framePaddingH ?? 16}%, fondBlanc=${Math.round((currentSettings?.textBg ?? 0.5) * 100)}%, opacitéCadre=${Math.round((currentSettings?.frameOpacity ?? 1) * 100)}%

Réponds UNIQUEMENT avec un JSON valide, sans texte autour :
{"framePaddingV": <5-40>, "framePaddingH": <5-35>, "textBg": <0-0.95>, "frameOpacity": <0.1-1>}

Critères d'analyse :
- Si le texte est chevauchant les fleurs du cadre → augmenter paddingV et/ou paddingH
- Si le texte est illisible sur le cadre → augmenter textBg (fond blanc)
- Si le cadre est trop présent et cache le texte → réduire frameOpacity
- Si il y a trop d'espace vide autour du texte → réduire les paddings
- Conserve les valeurs proches des actuelles si le rendu est déjà correct`,
            },
          ],
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (!jsonMatch) {
      return NextResponse.json(currentSettings ?? { framePaddingV: 20, framePaddingH: 16, textBg: 0.5, frameOpacity: 1 })
    }

    const result = JSON.parse(jsonMatch[0])

    const safe = {
      framePaddingV: typeof result.framePaddingV === 'number' ? Math.min(40, Math.max(5, result.framePaddingV)) : (currentSettings?.framePaddingV ?? 20),
      framePaddingH: typeof result.framePaddingH === 'number' ? Math.min(35, Math.max(5, result.framePaddingH)) : (currentSettings?.framePaddingH ?? 16),
      textBg: typeof result.textBg === 'number' ? Math.min(0.95, Math.max(0, result.textBg)) : (currentSettings?.textBg ?? 0.5),
      frameOpacity: typeof result.frameOpacity === 'number' ? Math.min(1, Math.max(0.1, result.frameOpacity)) : (currentSettings?.frameOpacity ?? 1),
    }

    return NextResponse.json(safe)
  } catch (error) {
    return NextResponse.json({ framePaddingV: 20, framePaddingH: 16, textBg: 0.5, frameOpacity: 1 })
  }
}
