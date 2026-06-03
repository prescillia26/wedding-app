import { redis } from '@/lib/redis'

export const maxDuration = 120;

export async function POST(req: Request) {
  // Feature flag
  if (process.env.ENABLE_LUXE_PRO !== 'true') {
    return Response.json({ error: 'Feature not enabled' }, { status: 404 });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return Response.json({ error: 'Configuration serveur manquante' }, { status: 500 });
  }

  try {
    const { initial1, initial2 } = await req.json();
    const i1 = String(initial1 || '').charAt(0).toUpperCase();
    const i2 = String(initial2 || '').charAt(0).toUpperCase();

    if (!/^[A-Z]$/.test(i1) || !/^[A-Z]$/.test(i2)) {
      return Response.json({ error: 'Initiales invalides (une lettre A-Z chacune)' }, { status: 400 });
    }

    // Rate limit : max 20 générations par couple d'initiales par heure
    const rateLimitKey = `monogram-ratelimit:${i1}${i2}`;
    const attempts = await redis.incr(rateLimitKey);
    if (attempts === 1) await redis.expire(rateLimitKey, 3600);
    if (attempts > 20) {
      return Response.json({ error: 'Limite de régénération atteinte. Réessayez dans 1 heure.' }, { status: 429 });
    }

    const prompt = [
      `An elegant interlaced wedding monogram of the capital letters ${i1} and ${i2},`,
      'letters intertwined and overlapping elegantly with ornamental curves and flourishes,',
      'single elegant continuous line drawing,',
      'Art Nouveau wedding crest style,',
      'deep purple color on plain pure white background,',
      'centered with lots of empty white space around,',
      'vector-like clean precise lines, monochrome,',
      'no text labels, no other elements, no shadow, no color variation',
    ].join(' ');

    // Générer 4 images avec Flux Dev (meilleure qualité que Schnell pour les lettres)
    const urls: string[] = [];

    const genPromises = Array.from({ length: 4 }, () =>
      fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait=90',
        },
        body: JSON.stringify({
          input: {
            prompt,
            num_outputs: 1,
            aspect_ratio: '1:1',
            output_format: 'png',
            output_quality: 95,
            num_inference_steps: 28,
            guidance: 3.5,
          },
        }),
        signal: AbortSignal.timeout(90000),
      }).then(r => r.json()).then(d => d.output?.[0] || null).catch(() => null)
    );

    const results = await Promise.allSettled(genPromises);
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) urls.push(r.value);
    }

    if (urls.length === 0) {
      return Response.json({ error: 'La génération a échoué. Réessayez.' }, { status: 500 });
    }

    // Détourage via background-remover pour chaque image
    const transparentUrls: string[] = [];
    for (const imgUrl of urls) {
      try {
        const bgRes = await fetch('https://api.replicate.com/v1/models/851-labs/background-remover/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'wait=60',
          },
          body: JSON.stringify({ input: { image: imgUrl } }),
          signal: AbortSignal.timeout(60000),
        });
        const bgData = await bgRes.json();
        const transparentUrl = bgData.output;
        if (transparentUrl) {
          transparentUrls.push(typeof transparentUrl === 'string' ? transparentUrl : String(transparentUrl));
        } else {
          transparentUrls.push(imgUrl); // Fallback : image originale
        }
      } catch {
        transparentUrls.push(imgUrl); // Fallback
      }
    }

    return Response.json({ monograms: transparentUrls });
  } catch (err) {
    console.error('Erreur génération monogramme:', err);
    return Response.json({ error: 'Erreur lors de la génération' }, { status: 500 });
  }
}
