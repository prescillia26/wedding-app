import Replicate from "replicate";
import { buildWatercolorPrompt, WATERCOLOR_NEGATIVE, type Ambiance, type Palette } from "@/lib/watercolorPrompt";

const VALID_AMBIANCES: Ambiance[] = ["plage", "chateau", "jardin", "salle", "synagogue", "israel", "universel"];
const VALID_PALETTES: Palette[] = ["lavande", "rose", "sauge", "bleu_nuit"];

export async function POST(req: Request) {
  // Token check
  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const { ambiance, palette, freeText } = await req.json();

    // Validation des entrées
    if (!ambiance || !VALID_AMBIANCES.includes(ambiance)) {
      return Response.json({ error: "Ambiance invalide" }, { status: 400 });
    }
    if (!palette || !VALID_PALETTES.includes(palette)) {
      return Response.json({ error: "Palette invalide" }, { status: 400 });
    }

    // Limiter le texte libre à 200 caractères
    const safeFreeText = freeText ? String(freeText).slice(0, 200) : undefined;

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const prompt = buildWatercolorPrompt(ambiance, palette, safeFreeText);

    const output = await replicate.run("black-forest-labs/flux-dev", {
      input: {
        prompt,
        num_outputs: 4,
        aspect_ratio: "2:3",
        output_format: "png",
        output_quality: 90,
        disable_safety_checker: false,
      },
    });

    // Replicate peut renvoyer des strings (URLs) ou des objets FileOutput
    const urls = (output as unknown[]).map((o) =>
      typeof o === "string" ? o : (typeof (o as { url?: () => string })?.url === "function" ? (o as { url: () => string }).url() : String(o))
    );

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération aquarelle:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
