export type Ambiance = "plage" | "chateau" | "jardin" | "salle" | "synagogue" | "israel" | "universel";
export type Palette = "lavande" | "rose" | "sauge" | "bleu_nuit" | "bleu_ciel" | "rose_clair" | "mauve" | "peche" | "dore" | "bordeaux" | "menthe" | "terracotta";

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
  bleu_ciel: "sky blue, powder blue, soft white, pale aqua, gentle cloud grey",
  rose_clair: "soft baby pink, pale blush, white, light peach, delicate cream",
  mauve: "mauve, soft purple, lilac, dusty violet, cream, pale rose",
  peche: "soft peach, apricot, warm cream, pale coral, golden honey",
  dore: "warm gold, champagne, ivory, soft amber, cream",
  bordeaux: "deep burgundy, wine red, dark rose, antique gold, cream",
  menthe: "fresh mint, seafoam green, soft teal, ivory, pale sage",
  terracotta: "warm terracotta, burnt sienna, dusty orange, olive, cream",
};

export function buildWatercolorPrompt(ambiance: Ambiance, palette: Palette, freeText?: string): string {
  const scene = SCENES[ambiance];
  const colors = PALETTES[palette] ?? PALETTES.rose;
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
    "A stunning hand-painted WATERCOLOR illustration, fine art wedding invitation style.",
    "NOT a poster, NOT a template, NO text, NO words, NO letters, NO logo, NO icons, no solid color blocks.",
    `Subject: a faithful and recognizable watercolor painting of the REAL venue "${location}".`,
    `The painting MUST accurately depict the actual architecture, facade, distinctive features, and surroundings of "${lieu}" as it really looks in reality.`,
    `If this is a famous or well-known venue, show its iconic and recognizable architectural elements precisely.`,
    `The venue is prepared for ${context}, with subtle elegant wedding decorations that complement but do not hide the architecture.`,
    `Color palette: ${colors}.`,
    "Style: delicate watercolor with fine black ink linework, visible brush strokes, soft washes and transparencies.",
    "Beautiful romantic lighting, the painting fills the entire frame edge to edge. Timeless fine art elegance.",
  ].join(" ");
}

// ── V3 : prompt pour illustrations décoratives (bagues, colombes, champagne…) ──

const DECO_SUBJECTS: Record<string, string> = {
  'colombes': 'two elegant white doves facing each other, carrying a small flower garland between their beaks, wings gently spread',
  'bagues': 'two beautiful wedding rings intertwined, one with a sparkling diamond, resting on a small bed of flowers and leaves',
  'champagne': 'two crystal champagne flutes clinking together in a toast, with delicate bubbles rising, surrounded by small flowers',
  'bouquet': 'an elegant bridal bouquet with roses, peonies, eucalyptus and trailing ribbons, lush and romantic',
  'arche': 'a beautiful wedding arch decorated with cascading flowers, wisteria, roses and greenery, romantic and dreamy',
  'coeurs': 'two intertwined decorative hearts made of delicate flowers and vines, romantic and elegant',
  'gateau': 'an elegant multi-tiered wedding cake decorated with fresh flowers and delicate frosting details',
  'alliance': 'a beautiful open ring box showing two wedding bands on a velvet cushion, surrounded by small petals',
  'calligraphie': 'an elegant decorative flourish with intertwined botanical vines, leaves and small flowers, ornamental style',
  'etoile-david': 'an elegant Star of David made of intertwined olive branches and small flowers, delicate and ornamental',
};

export function buildDecoIllustrationPrompt(decoId: string, palette: Palette): string {
  const subject = DECO_SUBJECTS[decoId] || 'elegant wedding decorative element with flowers';
  const colors = PALETTES[palette] ?? PALETTES.rose;

  return [
    "A single decorative element painted in delicate WATERCOLOR style on a pure WHITE background.",
    "The element is centered, isolated, with NO background scene, NO frame, NO border.",
    "NOT a poster, NO text, NO words, NO letters, NO logo. Just the element itself on white.",
    `Subject: ${subject}.`,
    `Color palette: ${colors}.`,
    "Style: fine art watercolor with soft brush strokes, gentle ink linework, beautiful transparencies and soft color bleeds.",
    "The element should look like a hand-painted watercolor illustration suitable for a luxury wedding invitation.",
    "Clean white background, the watercolor element floats elegantly on the page.",
  ].join(" ");
}

export const DECO_TYPES = Object.keys(DECO_SUBJECTS) as (keyof typeof DECO_SUBJECTS)[];

export const DECO_LABELS: Record<string, { fr: string; en: string }> = {
  'colombes': { fr: 'Colombes', en: 'Doves' },
  'bagues': { fr: 'Bagues', en: 'Rings' },
  'champagne': { fr: 'Champagne', en: 'Champagne' },
  'bouquet': { fr: 'Bouquet', en: 'Bouquet' },
  'arche': { fr: 'Arche florale', en: 'Floral arch' },
  'coeurs': { fr: 'Coeurs', en: 'Hearts' },
  'gateau': { fr: 'Gâteau', en: 'Cake' },
  'alliance': { fr: 'Alliances', en: 'Rings box' },
  'calligraphie': { fr: 'Ornement', en: 'Ornament' },
  'etoile-david': { fr: 'Étoile de David', en: 'Star of David' },
};

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
