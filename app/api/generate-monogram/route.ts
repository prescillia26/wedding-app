import Replicate from "replicate";

export const maxDuration = 120;

const MONOGRAM_STYLES: Record<string, string> = {
  'art-nouveau': `drawn in a single thin elegant continuous line, Art Nouveau wedding crest style,
    ornamental serifs and flourishes, symmetrical design, decorative swirls,
    vector-like clean lines, monochrome black ink`,
  'laurel': `surrounded by an elegant circular laurel wreath made of delicate leaves and branches,
    the letters are centered inside the wreath, classical Roman style serif letters,
    thin botanical vine details, monochrome black ink, timeless and refined`,
  'botanical': `framed by a lush circular botanical wreath with roses, peonies, olive branches and small flowers,
    the letters are artistically placed in the center, elegant serif font,
    hand-drawn botanical illustration style, monochrome black ink`,
  'floral-circle': `encircled by a delicate ring of hand-drawn flowers (roses, peonies, cherry blossoms) and leaves,
    the letters are intertwined in the center with gentle calligraphic curves,
    romantic and feminine style, monochrome black ink`,
  'minimal': `in a clean, modern, luxurious serif typeface, the two letters overlapping elegantly,
    no decorations, no wreath, just the pure typographic intertwining,
    ultra-minimal, sophisticated, high-end fashion brand aesthetic, monochrome black ink`,
  'oriental': `surrounded by ornamental geometric patterns inspired by Moroccan zellige tiles,
    the letters in elegant serif style centered inside an arch-shaped frame,
    intricate but refined line work, monochrome black ink`,
}

export async function POST(req: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const { initial1, initial2, style } = await req.json();
    const i1 = String(initial1 || 'A').charAt(0).toUpperCase();
    const i2 = String(initial2 || 'B').charAt(0).toUpperCase();
    const styleKey = MONOGRAM_STYLES[style] ? style : 'art-nouveau';
    const styleDesc = MONOGRAM_STYLES[styleKey];

    const prompt = [
      `An elegant interlaced wedding monogram combining the capital letters "${i1}" and "${i2}",`,
      styleDesc,
      `on plain pure white (#FFFFFF) background, centered composition,`,
      `lots of empty white space around the monogram,`,
      `NO text besides the two initials, no other text labels, no shadow, no color fill, no grey background.`,
      `The two letters should be artistically intertwined as one unified emblem.`,
    ].join(" ");

    // Appel direct à l'API Replicate avec Prefer: wait (synchrone, pas de polling)
    const token = process.env.REPLICATE_API_TOKEN;
    const urls: string[] = [];

    for (let i = 0; i < 4; i++) {
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
            aspect_ratio: '1:1',
            output_format: 'png',
          },
        }),
      });

      const data = await res.json();
      if (data.output?.[0]) {
        urls.push(data.output[0]);
      }
    }

    if (urls.length === 0) {
      return Response.json({ error: "Aucune image générée" }, { status: 500 });
    }

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération monogramme:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
