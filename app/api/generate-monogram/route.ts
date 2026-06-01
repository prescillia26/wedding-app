export const maxDuration = 120;

const FRAME_STYLES: Record<string, string> = {
  'art-nouveau': `An ornamental Art Nouveau decorative frame, symmetrical design with elegant swirls and flourishes, thin vector-like lines, empty center space for text, monochrome black ink on pure white background, vintage wedding crest border style`,
  'laurel': `A circular laurel wreath made of delicate olive branches and leaves, empty center, classical Roman style, thin botanical vine details, monochrome black ink on pure white background, elegant and timeless`,
  'botanical': `A lush circular botanical wreath frame with roses, peonies, olive branches and small flowers, empty center space, hand-drawn botanical illustration style, monochrome black ink on pure white background`,
  'floral-circle': `A delicate circular ring of hand-drawn flowers (roses, peonies, cherry blossoms) and leaves, empty center space for text, romantic feminine style, monochrome black ink on pure white background`,
  'minimal': `A very thin elegant circular line border with tiny ornamental details at top and bottom, ultra-minimal, almost invisible, sophisticated, monochrome black ink on pure white background, lots of empty space`,
  'oriental': `An ornamental arch-shaped frame with geometric patterns inspired by Moroccan zellige tiles, empty center space, intricate but refined line work, monochrome black ink on pure white background`,
}

export async function POST(req: Request) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const { style } = await req.json();
    const styleKey = FRAME_STYLES[style] ? style : 'art-nouveau';
    const prompt = FRAME_STYLES[styleKey] + ". NO letters, NO text, NO initials inside the frame. The center must be completely EMPTY white space.";

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
    console.error("Erreur génération cadre monogramme:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
