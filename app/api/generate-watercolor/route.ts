import Replicate from "replicate";
import { buildWatercolorPrompt, buildVenueWatercolorPrompt, buildDecoIllustrationPrompt, DECO_TYPES, type Ambiance, type Palette } from "@/lib/watercolorPrompt";

const VALID_AMBIANCES: Ambiance[] = ["plage", "chateau", "jardin", "salle", "synagogue", "israel", "universel"];
const VALID_PALETTES: Palette[] = ["lavande", "rose", "sauge", "bleu_nuit", "bleu_ciel", "rose_clair", "mauve", "peche", "dore", "bordeaux", "menthe", "terracotta"];

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    let prompt: string;
    let numOutputs = 4;
    let aspectRatio = "2:3";

    if (body.mode === 'deco') {
      const decoId = String(body.decoId || '');
      if (!DECO_TYPES.includes(decoId)) {
        return Response.json({ error: "Type d'illustration invalide" }, { status: 400 });
      }
      const palette: Palette = VALID_PALETTES.includes(body.palette) ? body.palette : 'rose';
      prompt = buildDecoIllustrationPrompt(decoId, palette);
      numOutputs = 2;
      aspectRatio = "1:1";
    } else if (body.mode === 'venue') {
      const lieu = String(body.lieu || '').slice(0, 200);
      if (!lieu) return Response.json({ error: "Lieu requis" }, { status: 400 });
      const adresse = String(body.adresse || '').slice(0, 300);
      const ceremonyType = String(body.ceremonyType || '').slice(0, 100);
      const palette: Palette = VALID_PALETTES.includes(body.palette) ? body.palette : 'rose';
      prompt = buildVenueWatercolorPrompt({ lieu, adresse, ceremonyType, palette });
      numOutputs = 4;
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
    }

    // flux-schnell : rapide (~2-3s), num_outputs=1 uniquement → paralléliser
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
    const urls = results.flatMap((output) =>
      (output as unknown[]).map((o) =>
        typeof o === "string" ? o : (typeof (o as { url?: () => string })?.url === "function" ? (o as { url: () => string }).url() : String(o))
      )
    );

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération aquarelle:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
