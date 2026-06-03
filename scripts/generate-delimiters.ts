/**
 * Script one-shot : génère 15 délimiteurs via Replicate Flux Dev,
 * les détoure, et affiche les URLs à copier dans lib/delimiters.ts.
 *
 * Usage : npx tsx scripts/generate-delimiters.ts
 *
 * Coût estimé : ~0,45€ (15 × 0,03€)
 * Requiert : REPLICATE_API_TOKEN dans .env.local
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) { console.error('REPLICATE_API_TOKEN manquant dans .env.local'); process.exit(1); }

const PROMPTS: { id: string; name: string; category: string; prompt: string }[] = [
  { id: 'd01-violets', name: 'Bouquet de violettes', category: 'floral', prompt: 'horizontal ornamental divider, two violet flowers with curly leaves and elegant flourishes on each side, single thin elegant line drawing, deep purple ink on plain white background, vector-like clean lines, no text' },
  { id: 'd02-olive', name: "Branche d'olivier", category: 'floral', prompt: 'horizontal olive branch divider, elegant, with leaves and small olives, deep purple ink on plain white background, vector clean lines, no text' },
  { id: 'd03-rose-stem', name: 'Rose unique', category: 'floral', prompt: 'single long-stem rose lying horizontally, elegant fine ink line drawing, deep purple on plain white background, vector clean lines, no text' },
  { id: 'd04-wisteria', name: 'Glycine cascadante', category: 'floral', prompt: 'small cascading wisteria garland horizontal, deep purple ink on plain white background, fine line illustration, no text' },
  { id: 'd05-laurel', name: 'Couronne de laurier', category: 'floral', prompt: 'horizontal small laurel wreath divider, two branches forming a horizontal flourish, deep purple ink on white, fine line, no text' },
  { id: 'd06-diamond', name: 'Diamant Art Nouveau', category: 'geo', prompt: 'elegant horizontal divider with central small diamond shape flanked by two thin lines with tiny curls at the ends, deep purple ink on white, Art Nouveau, no text' },
  { id: 'd07-magen', name: 'Étoile à 6 branches', category: 'geo', prompt: 'elegant six-pointed star centered with thin flanking lines, deep purple ink on white background, fine line illustration, no text' },
  { id: 'd08-heart', name: 'Coeur fleuri', category: 'geo', prompt: 'small floral heart-shaped wreath horizontal divider, deep purple ink on white, fine flowers and leaves, no text' },
  { id: 'd09-crown', name: 'Couronne ornementale', category: 'geo', prompt: 'small ornamental crown silhouette centered horizontally with thin flanking lines, deep purple ink on white, fine lines, no text' },
  { id: 'd10-circle', name: 'Cercle de feuilles', category: 'geo', prompt: 'small circular wreath of olive leaves centered horizontally with two thin lines on each side, deep purple ink on white, fine illustration, no text' },
  { id: 'd11-doves', name: 'Deux colombes', category: 'jewish', prompt: 'two doves facing each other holding small wisteria flowers in their beaks, watercolor with fine purple ink linework, on plain white background, no text' },
  { id: 'd12-rings', name: 'Bagues entrelacées', category: 'jewish', prompt: 'two elegant wedding rings interlocked horizontally with a tiny flower flourish on each side, deep purple ink line drawing on white, no text' },
  { id: 'd13-kiddush', name: 'Coupe de Kiddoush', category: 'jewish', prompt: 'ornamental kiddush cup centered with curls on each side, deep purple ink fine line drawing on white, no text' },
  { id: 'd14-candles', name: 'Bougies de Shabbat', category: 'jewish', prompt: 'two Shabbat candles in candlesticks side by side with subtle flame, deep purple ink fine illustration on white, no text' },
  { id: 'd15-hamsa', name: 'Hamsa stylisée', category: 'jewish', prompt: 'elegant Hamsa hand silhouette centered, deep purple ink fine ornamental line drawing on white, no text' },
];

async function generateOne(prompt: string): Promise<string | null> {
  try {
    console.log('  Generating...');
    const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-dev/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=120',
      },
      body: JSON.stringify({
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: '3:1',
          output_format: 'png',
          output_quality: 95,
          num_inference_steps: 28,
          guidance: 3.5,
        },
      }),
    });
    const data = await res.json();
    return data.output?.[0] || null;
  } catch (err) {
    console.error('  Generation failed:', err);
    return null;
  }
}

async function removeBackground(imageUrl: string): Promise<string | null> {
  try {
    console.log('  Removing background...');
    const res = await fetch('https://api.replicate.com/v1/models/851-labs/background-remover/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait=60',
      },
      body: JSON.stringify({ input: { image: imageUrl } }),
    });
    const data = await res.json();
    return typeof data.output === 'string' ? data.output : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`\n🎨 Génération de ${PROMPTS.length} délimiteurs...\n`);
  const results: { id: string; name: string; category: string; url: string }[] = [];

  for (const item of PROMPTS) {
    console.log(`[${item.id}] ${item.name}`);
    const rawUrl = await generateOne(item.prompt);
    if (!rawUrl) {
      console.log('  ❌ ÉCHEC — skip');
      continue;
    }

    const transparentUrl = await removeBackground(rawUrl);
    const finalUrl = transparentUrl || rawUrl;

    results.push({ id: item.id, name: item.name, category: item.category, url: finalUrl });
    console.log(`  ✅ ${finalUrl.slice(0, 80)}...`);
  }

  console.log('\n\n📋 Copie ce contenu dans lib/delimiters.ts :\n');
  console.log('export const DELIMITERS = [');
  for (const r of results) {
    console.log(`  { id: '${r.id}', name: '${r.name}', url: '${r.url}', category: '${r.category}' },`);
  }
  console.log('];');
  console.log(`\n✅ ${results.length}/${PROMPTS.length} délimiteurs générés.`);
}

main();
