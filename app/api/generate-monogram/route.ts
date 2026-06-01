export const maxDuration = 120;

const FRAME_STYLES: Record<string, string> = {
  'art-nouveau': `An ornamental Art Nouveau decorative frame, symmetrical design with elegant swirls and flourishes, thin vector-like lines, empty center space for text, monochrome black ink on pure white background, vintage wedding crest border style`,
  'laurel': `A circular laurel wreath made of delicate olive branches and leaves, empty center, classical Roman style, thin botanical vine details, monochrome black ink on pure white background, elegant and timeless`,
  'botanical': `A lush circular botanical wreath frame with roses, peonies, olive branches and small flowers, empty center space, hand-drawn botanical illustration style, monochrome black ink on pure white background`,
  'floral-circle': `A delicate circular ring of hand-drawn flowers (roses, peonies, cherry blossoms) and leaves, empty center space for text, romantic feminine style, monochrome black ink on pure white background`,
  'minimal': `A very thin elegant circular line border with tiny ornamental details at top and bottom, ultra-minimal, almost invisible, sophisticated, monochrome black ink on pure white background, lots of empty space`,
  'oriental': `An ornamental arch-shaped frame with geometric patterns inspired by Moroccan zellige tiles, empty center space, intricate but refined line work, monochrome black ink on pure white background`,
}

async function callReplicate(token: string, prompt: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: { prompt, num_outputs: 1, aspect_ratio: '1:1', output_format: 'png' },
      }),
      signal: AbortSignal.timeout(45000), // 45s max par appel
    });
    const data = await res.json();
    return data.output?.[0] || null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return Response.json({ error: "Configuration serveur manquante" }, { status: 500 });
  }

  try {
    const { style } = await req.json();
    const styleKey = FRAME_STYLES[style] ? style : 'laurel';
    const prompt = FRAME_STYLES[styleKey] + ". NO letters, NO text, NO initials inside the frame. The center must be completely EMPTY white space.";

    // 2 images en parallèle (rapide + fiable)
    const results = await Promise.allSettled([
      callReplicate(token, prompt),
      callReplicate(token, prompt),
    ]);

    const urls = results
      .filter((r): r is PromiseFulfilledResult<string | null> => r.status === 'fulfilled')
      .map(r => r.value)
      .filter((url): url is string => !!url);

    // Si aucune image, retry une fois
    if (urls.length === 0) {
      const retry = await callReplicate(token, prompt);
      if (retry) urls.push(retry);
    }

    if (urls.length === 0) {
      return Response.json({ error: "La génération a échoué. Réessayez." }, { status: 500 });
    }

    return Response.json({ images: urls });
  } catch (err) {
    console.error("Erreur génération cadre monogramme:", err);
    return Response.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
