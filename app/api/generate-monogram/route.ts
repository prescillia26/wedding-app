import Replicate from "replicate";

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const { initial1, initial2 } = await req.json();
    const i1 = String(initial1 || 'A').charAt(0).toUpperCase();
    const i2 = String(initial2 || 'B').charAt(0).toUpperCase();

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const prompt = [
      `An elegant interlaced wedding monogram combining the letters "${i1}" and "${i2}",`,
      "drawn in a single thin elegant line, Art Nouveau wedding crest style, ornamental flourishes,",
      "symmetrical design, decorative swirls and botanical vine details,",
      "black ink on plain pure white (#FFFFFF) background, centered composition,",
      "lots of empty white space around the monogram,",
      "vector-like clean lines, NO text besides the two initials, no other elements, no shadow, no color fill.",
      "The two letters should be artistically intertwined as one unified emblem.",
    ].join(" ");

    const output = await replicate.run("black-forest-labs/flux-dev", {
      input: {
        prompt,
        num_outputs: 4,
        aspect_ratio: "1:1",
        output_format: "png",
        output_quality: 95,
        disable_safety_checker: false,
      },
    });

    const urls = (output as unknown[]).map((o) =>
      typeof o === "string" ? o : (typeof (o as { url?: () => string })?.url === "function" ? (o as { url: () => string }).url() : String(o))
    );

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération monogramme:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
