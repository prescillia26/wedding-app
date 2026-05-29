export type Ambiance = "plage" | "chateau" | "jardin" | "salle" | "synagogue" | "israel" | "universel";
export type Palette = "lavande" | "rose" | "sauge" | "bleu_nuit";

const SCENES: Record<Ambiance, string> = {
  plage: "a Mediterranean beach wedding setup, turquoise calm sea, soft sand, granite rocks",
  chateau: "an elegant French château with romantic gardens",
  jardin: "a Provençal garden with olive trees, lavender and cascading wisteria",
  salle: "an elegant wedding reception hall with refined floral decoration",
  synagogue: "an elegant synagogue interior prepared for a wedding ceremony",
  israel: "a romantic Jerusalem stone landscape at golden hour",
  universel: "an elegant half-circle wedding arch of flowers and foliage on a soft cream background, no specific location",
};

const PALETTES: Record<Palette, string> = {
  lavande: "lavender, lilac and wisteria purple, cream, soft green, gentle turquoise accents",
  rose: "dusty rose, blush pink, cream, soft green",
  sauge: "sage green, eucalyptus, ivory, soft beige",
  bleu_nuit: "deep navy blue, periwinkle, silver, cream",
};

export function buildWatercolorPrompt(ambiance: Ambiance, palette: Palette, freeText?: string): string {
  const scene = SCENES[ambiance];
  const colors = PALETTES[palette];
  const extra = freeText ? `, inspired by: ${freeText}` : "";
  return [
    "A full-page hand-painted WATERCOLOR illustration filling the entire frame, fine art wedding style.",
    "NOT a poster, NOT a template, NO text, NO words, NO logo, NO icons, no solid color blocks.",
    `Scene: ${scene}${extra}.`,
    `Color palette: ${colors}.`,
    "Delicate watercolor with fine black ink linework, visible brush strokes, transparencies,",
    "soft romantic light, the painting fades softly toward the edges. Timeless elegance.",
  ].join(" ");
}

// ── V2 : prompt basé sur le lieu réel ──

const CEREMONY_CONTEXT: Record<string, string> = {
  'Mairie': 'a civil wedding ceremony at a city hall',
  'Cérémonie religieuse / Houppa': 'a Jewish wedding ceremony under a chuppah',
  'Shabbat Hatan': 'a festive Shabbat celebration before a wedding',
  'Henné': 'a traditional henna celebration',
  'Cocktail': 'an elegant cocktail reception',
  'Soirée': 'an elegant evening wedding reception',
  'Boat Party': 'a festive boat party celebration',
};

export function buildVenueWatercolorPrompt(opts: {
  lieu: string
  adresse?: string
  ceremonyType: string
  palette: Palette
}): string {
  const { lieu, adresse, ceremonyType, palette } = opts;
  const colors = PALETTES[palette] ?? PALETTES.rose;
  const context = CEREMONY_CONTEXT[ceremonyType] || 'a wedding celebration';
  const location = adresse ? `${lieu}, ${adresse}` : lieu;

  return [
    "A full-page hand-painted WATERCOLOR illustration filling the entire frame, fine art wedding style.",
    "NOT a poster, NOT a template, NO text, NO words, NO logo, NO icons, no solid color blocks.",
    `Scene: a beautiful watercolor painting of "${location}", showing the real architecture and atmosphere of this venue, prepared for ${context}.`,
    `Color palette: ${colors}.`,
    "Delicate watercolor with fine black ink linework, visible brush strokes, transparencies,",
    "soft romantic light, the painting fades softly toward the edges. Timeless elegance.",
  ].join(" ");
}

export function themeToWatercolorPalette(style: string): Palette {
  const map: Record<string, Palette> = {
    'rose-fleuri': 'rose',
    'ivoire-or': 'rose',
    'bleu-floral': 'bleu_nuit',
    'champetre': 'sauge',
    'blanc-gris': 'lavande',
    'noir-blanc': 'bleu_nuit',
    'chocolat': 'sauge',
    'bordeaux': 'rose',
    'bordeaux-nuit': 'bleu_nuit',
    'fuchsia': 'rose',
    'marine-or': 'bleu_nuit',
    'menthe': 'sauge',
  };
  return map[style] ?? 'rose';
}

export const WATERCOLOR_NEGATIVE = "text, words, letters, logo, watermark, poster, template, frame, border, UI, flat vector, photo, 3d render";
