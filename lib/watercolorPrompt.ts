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

export const WATERCOLOR_NEGATIVE = "text, words, letters, logo, watermark, poster, template, frame, border, UI, flat vector, photo, 3d render";
