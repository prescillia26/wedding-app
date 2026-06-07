export type Ambiance = "plage" | "chateau" | "jardin" | "salle" | "synagogue" | "israel" | "universel";
export type Palette = "lavande" | "rose" | "sauge" | "bleu_nuit" | "bleu_ciel" | "rose_clair" | "mauve" | "peche" | "dore" | "bordeaux" | "menthe" | "terracotta" | "sable_dore" | "fuchsia" | "rose_peche" | "bleu_med" | "buttercup" | "orange_sunset" | "bleu_mer";

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
  sable_dore: "sandy gold, warm terracotta, raw linen ecru, sage green, soft beige",
  fuchsia: "vivid fuchsia bougainvillea, turquoise lagoon, olive green, pure white",
  rose_peche: "soft peach pink, warm terracotta orange, deep navy blue, creamy ivory",
  bleu_med: "Mediterranean blue, immaculate white, warm ochre yellow, celadon green",
  buttercup: "soft buttercup yellow, warm gold, honey pastel, cream, gentle ivory",
  orange_sunset: "warm sunset orange, apricot, soft coral, golden cream, ivory",
  bleu_mer: "soft sea blue, powder aqua, seafoam, cream, gentle grey-blue",
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
  'Beach Party': 'a festive beach party celebration with sand and sea',
};

// Détecte le type d'architecture à partir du nom du lieu
function guessArchitectureHints(lieu: string, adresse: string): string {
  const text = `${lieu} ${adresse}`.toLowerCase()

  // Plage / bord de mer
  if (/plage|beach|bord de mer|littoral|côte|cote|marina|port/.test(text))
    return 'beachfront venue, sea view, sandy shore, Mediterranean atmosphere'
  // Hôtel / palace
  if (/hilton|marriott|intercontinental|palace|hôtel|hotel|ritz|sofitel|hyatt|pullman|four seasons|david citadel|king david|carlton|sheraton/.test(text))
    return 'grand luxury hotel building, impressive facade, elegant entrance with columns or arches, manicured gardens'
  // Château / domaine
  if (/château|chateau|domaine|manoir|castle|manor|villa/.test(text))
    return 'French château or country estate, stone walls, ornate gates, romantic gardens, wisteria or climbing roses'
  // Salle / réception
  if (/salle|hall|espace|centre|convention|palais des|pavillon/.test(text))
    return 'elegant reception hall, grand entrance, arched doorways, chandeliers visible through windows'
  // Synagogue / lieu de culte
  if (/synagogue|shul|temple|grande synagogue|beth|beit/.test(text))
    return 'ornate synagogue facade, arched windows, Star of David motif, decorative stone work'
  // Jardin / parc
  if (/jardin|garden|parc|park|terrasse|terrace|orangerie/.test(text))
    return 'beautiful formal garden with fountains, hedges, flowering trees, pergola or gazebo'
  // Restaurant
  if (/restaurant|traiteur|auberge|bistrot|brasserie/.test(text))
    return 'charming restaurant facade, outdoor terrace, wrought iron details, flower boxes'
  // Israël
  if (/israel|israël|tel aviv|jerusalem|jérusalem|haifa|herzliya|eilat|netanya|ashdod|caesarea/.test(text))
    return 'Mediterranean architecture, Jerusalem stone, palm trees, bright sunlight, blue sky'
  // Paris
  if (/paris|seine|montmartre|marais|bastille|opéra/.test(text))
    return 'Haussmannian Parisian architecture, wrought iron balconies, zinc roofs, elegant stone facade'
  // Corse / Murtoli
  if (/corse|corsica|murtoli|bonifacio|ajaccio|porto[-\s]vecchio|calvi/.test(text))
    return 'Corsican maquis landscape, stone walls, Mediterranean vegetation, wild beauty, granite rocks'

  return 'elegant venue facade, beautiful architecture, romantic atmosphere'
}

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
  const archHints = guessArchitectureHints(lieu, adresse || '');

  return [
    `A stunning hand-painted WATERCOLOR illustration of "${location}".`,
    `Architecture: ${archHints}.`,
    `The painting shows the exterior of this venue prepared for ${context}, with elegant floral decorations.`,
    `Capture the essence and character of this place: its entrance, its main building, its surroundings.`,
    `Color palette: ${colors}.`,
    "Style: fine art watercolor, loose brush strokes, soft wet-on-wet washes, fine ink linework for architectural details,",
    "golden hour romantic lighting, the painting fills the entire frame edge to edge.",
    "NO text, NO words, NO letters, NO logo, NO people.",
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
    "A single decorative watercolor element on a PURE FLAT WHITE (#FFFFFF) background.",
    "The element is centered and isolated. The background is COMPLETELY empty white — no texture, no gradient, no shadow, no border, no frame.",
    `Subject: ${subject}.`,
    `Color palette: ${colors}.`,
    "Style: delicate hand-painted watercolor, soft brush strokes, fine ink linework, gentle transparencies.",
    "The illustration must look like it was painted on white paper — edges fade naturally into the white background with no hard edges or rectangular borders.",
    "NOT a poster, NO text, NO words, NO letters, NO logo, NO rectangular frame around the element.",
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
