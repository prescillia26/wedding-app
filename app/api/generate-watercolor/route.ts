import Replicate from "replicate";
import { buildWatercolorPrompt, buildVenueWatercolorPrompt, type Ambiance, type Palette } from "@/lib/watercolorPrompt";

const VALID_AMBIANCES: Ambiance[] = ["plage", "chateau", "jardin", "salle", "synagogue", "israel", "universel"];
const VALID_PALETTES: Palette[] = ["lavande", "rose", "sauge", "bleu_nuit"];

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    let prompt: string;
    let numOutputs = 4;

    if (body.mode === 'venue') {
      // ── V2 : mode lieu réel ──
      const lieu = String(body.lieu || '').slice(0, 200);
      if (!lieu) return Response.json({ error: "Lieu requis" }, { status: 400 });
      const adresse = String(body.adresse || '').slice(0, 300);
      const ceremonyType = String(body.ceremonyType || '').slice(0, 100);
      const palette: Palette = VALID_PALETTES.includes(body.palette) ? body.palette : 'rose';

      prompt = buildVenueWatercolorPrompt({ lieu, adresse, ceremonyType, palette });
      numOutputs = 2;
    } else {
      // ── V1 : mode ambiance (rétrocompat) ──
      const { ambiance, palette, freeText } = body;
      if (!ambiance || !VALID_AMBIANCES.includes(ambiance)) {
        return Response.json({ error: "Ambiance invalide" }, { status: 400 });
      }
      if (!palette || !VALID_PALETTES.includes(palette)) {
        return Response.json({ error: "Palette invalide" }, { status: 400 });
      }
      prompt = buildWatercolorPrompt(ambiance, palette, freeText ? String(freeText).slice(0, 200) : undefined);
    }

    const output = await replicate.run("black-forest-labs/flux-dev", {
      input: {
        prompt,
        num_outputs: numOutputs,
        aspect_ratio: "2:3",
        output_format: "png",
        output_quality: 90,
        disable_safety_checker: false,
      },
    });

    const urls = (output as unknown[]).map((o) =>
      typeof o === "string" ? o : (typeof (o as { url?: () => string })?.url === "function" ? (o as { url: () => string }).url() : String(o))
    );

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération aquarelle:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
