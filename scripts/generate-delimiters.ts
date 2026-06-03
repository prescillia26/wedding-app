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
console.log('Token:', TOKEN ? TOKEN.slice(0, 8) + '...' : 'MISSING');
if (!TOKEN) { console.error('REPLICATE_API_TOKEN manquant dans .env.local'); process.exit(1); }

// Seulement les 7 manquants (les 8 premiers sont déjà sur Cloudinary)
const PROMPTS: { id: string; name: string; category: string; prompt: string }[] = [
  { id: 'd07-magen', name: 'Étoile à 6 branches', category: 'geo', prompt: 'elegant six-pointed star centered with thin flanking lines, deep purple ink on white background, fine line illustration, no text' },
  { id: 'd09-crown', name: 'Couronne ornementale', category: 'geo', prompt: 'small ornamental crown silhouette centered horizontally with thin flanking lines, deep purple ink on white, fine lines, no text' },
  { id: 'd10-circle', name: 'Cercle de feuilles', category: 'geo', prompt: 'small circular wreath of olive leaves centered horizontally with two thin lines on each side, deep purple ink on white, fine illustration, no text' },
  { id: 'd11-doves', name: 'Deux colombes', category: 'jewish', prompt: 'two doves facing each other holding small wisteria flowers in their beaks, watercolor with fine purple ink linework, on plain white background, no text' },
  { id: 'd13-kiddush', name: 'Coupe de Kiddoush', category: 'jewish', prompt: 'ornamental kiddush cup centered with curls on each side, deep purple ink fine line drawing on white, no text' },
  { id: 'd14-candles', name: 'Bougies de Shabbat', category: 'jewish', prompt: 'two Shabbat candles in candlesticks side by side with subtle flame, deep purple ink fine illustration on white, no text' },
  { id: 'd15-hamsa', name: 'Hamsa stylisée', category: 'jewish', prompt: 'elegant Hamsa hand silhouette centered, deep purple ink fine ornamental line drawing on white, no text' },
];

async function generateOne(prompt: string): Promise<string | null> {
  try {
    console.log('  Generating (flux-schnell)...');
    const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: '21:9',
          output_format: 'png',
        },
      }),
    });
    const data = await res.json();
    if (data.error) {
      console.error('  API error:', data.error);
      return null;
    }
    if (!data.output?.[0]) {
      console.error('  No output. Status:', data.status, 'Full response:', JSON.stringify(data).slice(0, 200));
      return null;
    }
    return data.output[0];
  } catch (err) {
    console.error('  Fetch failed:', (err as Error).message);
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
