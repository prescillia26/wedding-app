import { buildWatercolorPrompt, buildVenueWatercolorPrompt, buildDecoIllustrationPrompt, DECO_TYPES, type Ambiance, type Palette } from "@/lib/watercolorPrompt";

export const maxDuration = 120;

const VALID_AMBIANCES: Ambiance[] = ["plage", "chateau", "jardin", "salle", "synagogue", "israel", "universel"];
const VALID_PALETTES: Palette[] = ["lavande", "rose", "sauge", "bleu_nuit", "bleu_ciel", "rose_clair", "mauve", "peche", "dore", "bordeaux", "menthe", "terracotta"];

async function generateImage(token: string, prompt: string, aspectRatio: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: { prompt, num_outputs: 1, aspect_ratio: aspectRatio, output_format: 'png' },
      }),
      signal: AbortSignal.timeout(45000),
    });
    const data = await res.json();
    return data.output?.[0] || null;
  } catch {
    return null;
  }
}

async function generateImageImg2Img(token: string, prompt: string, imageUrl: string, aspectRatio: string): Promise<string | null> {
  const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=120',
    },
    body: JSON.stringify({
      input: {
        prompt,
        image: imageUrl,
        num_outputs: 1,
        prompt_strength: 0.65,
        aspect_ratio: aspectRatio,
        output_format: 'png',
        output_quality: 90,
      },
    }),
  });
  const data = await res.json();
  return data.output?.[0] || null;
}

export async function POST(req: Request) {
  // Rate limiting : max 10 générations par IP par heure
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const { Redis } = await import('@upstash/redis')
  const rl = new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
  const rlKey = `ratelimit:watercolor:${ip}`
  const rlCount = await rl.get<number>(rlKey) ?? 0
  if (rlCount >= 10) {
    return Response.json({ error: "Trop de générations. Réessayez dans une heure." }, { status: 429 })
  }
  await rl.set(rlKey, rlCount + 1, { ex: 3600 })

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const referenceImage = body.referenceImageUrl as string | undefined;

    let prompt: string;
    let numOutputs = 2;
    let aspectRatio = "2:3";

    if (body.mode === 'deco') {
      const decoId = String(body.decoId || '');
      if (!DECO_TYPES.includes(decoId)) {
        return Response.json({ error: "Type d'illustration invalide" }, { status: 400 });
      }
      const palette: Palette = VALID_PALETTES.includes(body.palette) ? body.palette : 'rose';
      prompt = buildDecoIllustrationPrompt(decoId, palette);
      aspectRatio = "1:1";
    } else if (body.mode === 'venue') {
      const lieu = String(body.lieu || '').slice(0, 200);
      if (!lieu) return Response.json({ error: "Lieu requis" }, { status: 400 });
      const adresse = String(body.adresse || '').slice(0, 300);
      const ceremonyType = String(body.ceremonyType || '').slice(0, 100);
      const palette: Palette = VALID_PALETTES.includes(body.palette) ? body.palette : 'rose';
      prompt = buildVenueWatercolorPrompt({ lieu, adresse, ceremonyType, palette });
      aspectRatio = "3:2";
    } else {
      const { ambiance, palette, freeText } = body;
      if (!ambiance || !VALID_AMBIANCES.includes(ambiance)) {
        return Response.json({ error: "Ambiance invalide" }, { status: 400 });
      }
      if (!palette || !VALID_PALETTES.includes(palette)) {
        return Response.json({ error: "Palette invalide" }, { status: 400 });
      }
      prompt = buildWatercolorPrompt(ambiance, palette, freeText ? String(freeText).slice(0, 200) : undefined);
      numOutputs = 4;
    }

    let urls: string[] = [];

    if (referenceImage && body.mode === 'venue') {
      const img2imgPrompt = prompt + " Transform this photograph into a delicate hand-painted watercolor illustration, keeping the exact same composition, architecture and perspective.";
      const results = await Promise.allSettled(
        Array.from({ length: numOutputs }, () => generateImageImg2Img(token, img2imgPrompt, referenceImage, aspectRatio))
      );
      urls = results.filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled').map(r => r.value).filter((u): u is string => !!u);
    } else {
      const results = await Promise.allSettled(
        Array.from({ length: numOutputs }, () => generateImage(token, prompt, aspectRatio))
      );
      urls = results.filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled').map(r => r.value).filter((u): u is string => !!u);
    }

    // Retry si aucune image
    if (urls.length === 0) {
      const retry = await generateImage(token, prompt, aspectRatio);
      if (retry) urls.push(retry);
    }

    if (urls.length === 0) {
      return Response.json({ error: "La génération a échoué. Réessayez." }, { status: 500 });
    }

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération aquarelle:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
