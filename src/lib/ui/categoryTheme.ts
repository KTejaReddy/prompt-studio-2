/**
 * Category → color-family theming (shared by cards, tiles, detail pages).
 * Each category belongs to a color WORLD: a light surface tint, a soft hover
 * tint, a strong accent and a deep readable text tone. This is structural —
 * the surface color identifies the category, not a decorative border.
 */

export interface ColorFamily {
  surface: string;
  soft: string;
  accent: string;
  deep: string;
}

export const FAMILIES: Record<string, ColorFamily> = {
  cyan: { surface: "#EBFAFC", soft: "#D2F3F8", accent: "#22B8CD", deep: "#0B7285" },
  coral: { surface: "#FFF0EA", soft: "#FFE3DA", accent: "#FF6B5F", deep: "#C93A2F" },
  pink: { surface: "#FFF2F7", soft: "#FFDFEC", accent: "#F45197", deep: "#C2276F" },
  orange: { surface: "#FFF6F1", soft: "#FFE8D6", accent: "#FF8A3D", deep: "#B85E14" },
  gold: { surface: "#FFF8DF", soft: "#FFEDB8", accent: "#F0B93E", deep: "#8A6410" },
  mint: { surface: "#F2FBF7", soft: "#D9F4E8", accent: "#6FD8B5", deep: "#1F7D5F" },
  turquoise: { surface: "#EAF8F6", soft: "#CFEFEB", accent: "#31C7B5", deep: "#0C7A6E" },
  sky: { surface: "#EEF9FC", soft: "#D8F0F9", accent: "#54B8E8", deep: "#1B6FA8" },
  lavender: { surface: "#F4F1FF", soft: "#E5DEFE", accent: "#A98BFF", deep: "#6444C8" },
  violet: { surface: "#F3EFFE", soft: "#E3DAFD", accent: "#8F6DEB", deep: "#5F3DC4" },
  peach: { surface: "#FFF6F1", soft: "#FFE6D4", accent: "#FFB48C", deep: "#B05E2A" },
};

/** Product-area color identities (§4 of the design brief). */
const CATEGORY_FAMILY: Record<string, keyof typeof FAMILIES> = {
  coding: "turquoise",
  writing: "coral",
  research: "lavender",
  education: "gold",
  business: "orange",
  marketing: "pink",
  productivity: "mint",
  design: "violet",
  "data-analysis": "sky",
  career: "peach",
  finance: "turquoise",
  legal: "violet",
  "content-creation": "pink",
  presentations: "orange",
  "customer-support": "sky",
  management: "orange",
  entrepreneurship: "coral",
  "personal-development": "gold",
  "image-generation": "peach",
  video: "pink",
  "social-media": "coral",
  automation: "violet",
};

export function familyForCategory(categoryId: string): ColorFamily {
  return FAMILIES[CATEGORY_FAMILY[categoryId] ?? "orange"];
}

/** Featured-card surface rotation — cyan-led cool families. */
export const FEATURED_ROTATION: ColorFamily[] = [
  FAMILIES.cyan,
  FAMILIES.turquoise,
  FAMILIES.sky,
  FAMILIES.mint,
  FAMILIES.lavender,
];
