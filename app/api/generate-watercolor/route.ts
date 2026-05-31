import Replicate from "replicate";
import { buildWatercolorPrompt, buildVenueWatercolorPrompt, buildDecoIllustrationPrompt, DECO_TYPES, type Ambiance, type Palette } from "@/lib/watercolorPrompt";

export const maxDuration = 120;

const VALID_AMBIANCES: Ambiance[] = ["plage", "chateau", "jardin", "salle", "synagogue", "israel", "universel"];
const VALID_PALETTES: Palette[] = ["lavande", "rose", "sauge", "bleu_nuit", "bleu_ciel", "rose_clair", "mauve", "peche", "dore", "bordeaux", "menthe", "terracotta"];

function extractUrls(output: unknown): string[] {
  return (output as unknown[]).map((o) =>
    typeof o === "string" ? o : (typeof (o as { url?: () => string })?.url === "function" ? (o as { url: () => string }).url() : String(o))
  );
}

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
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

    // ── IMG2IMG : si on a une photo de référence, utiliser flux-dev avec image ──
    if (referenceImage && body.mode === 'venue') {
      const img2imgPrompt = prompt + " Transform this photograph into a delicate hand-painted watercolor illustration, keeping the exact same composition, architecture and perspective.";

      const promises = Array.from({ length: numOutputs }, () =>
        replicate.run("black-forest-labs/flux-dev", {
          input: {
            prompt: img2imgPrompt,
            image: referenceImage,
            num_outputs: 1,
            prompt_strength: 0.65, // 0.65 = garde l'architecture, transforme le style
            aspect_ratio: aspectRatio,
            output_format: "png",
            output_quality: 90,
          },
        })
      );

      const results = await Promise.all(promises);
      const urls = results.flatMap(extractUrls);
      return Response.json({ images: urls, mode: 'img2img' });
    }

    // ── TEXT-TO-IMAGE : génération classique avec flux-schnell ──
    const promises = Array.from({ length: numOutputs }, () =>
      replicate.run("black-forest-labs/flux-schnell", {
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: aspectRatio,
          output_format: "png",
        },
      })
    );

    const results = await Promise.all(promises);
    const urls = results.flatMap(extractUrls);
    return Response.json({ images: urls, mode: 'text2img' });
  } catch (err) {
    console.error("Erreur génération aquarelle:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
