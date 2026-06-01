import { buildWatercolorPrompt, buildVenueWatercolorPrompt, buildDecoIllustrationPrompt, DECO_TYPES, type Ambiance, type Palette } from "@/lib/watercolorPrompt";

export const maxDuration = 120;

const VALID_AMBIANCES: Ambiance[] = ["plage", "chateau", "jardin", "salle", "synagogue", "israel", "universel"];
const VALID_PALETTES: Palette[] = ["lavande", "rose", "sauge", "bleu_nuit", "bleu_ciel", "rose_clair", "mauve", "peche", "dore", "bordeaux", "menthe", "terracotta"];

async function generateImage(token: string, prompt: string, aspectRatio: string): Promise<string | null> {
  const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt,
        num_outputs: 1,
        aspect_ratio: aspectRatio,
        output_format: 'png',
      },
    }),
  });
  const data = await res.json();
  return data.output?.[0] || null;
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

    const urls: string[] = [];

    if (referenceImage && body.mode === 'venue') {
      // img2img avec flux-dev
      const img2imgPrompt = prompt + " Transform this photograph into a delicate hand-painted watercolor illustration, keeping the exact same composition, architecture and perspective.";
      for (let i = 0; i < numOutputs; i++) {
        const url = await generateImageImg2Img(token, img2imgPrompt, referenceImage, aspectRatio);
        if (url) urls.push(url);
      }
    } else {
      // text2img avec flux-schnell
      for (let i = 0; i < numOutputs; i++) {
        const url = await generateImage(token, prompt, aspectRatio);
        if (url) urls.push(url);
      }
    }

    if (urls.length === 0) {
      return Response.json({ error: "Aucune image générée" }, { status: 500 });
    }

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération aquarelle:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
