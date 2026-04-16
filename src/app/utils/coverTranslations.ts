/**
 * Cover Translations System
 * Multilingual support for cover text elements
 * Supports: Russian, English, Spanish, German, French
 */

export type CoverLanguage = 'ru' | 'en' | 'es' | 'de' | 'fr';

export interface CoverTranslations {
  coverLabel: string;
  designerLabel: string;
  stitchesLabel: string;
  colorsLabel: string;
  colorSingular: string;
  colorFew: string;
  colorMany: string;
  paletteLabel: string;
  countLabel: string;
}

export const COVER_TRANSLATIONS: Record<CoverLanguage, CoverTranslations> = {
  ru: {
    coverLabel: "Схема для вышивки крестом",
    designerLabel: "Дизайнер:",
    stitchesLabel: "стежков",
    colorsLabel: "Количество цветов",
    colorSingular: "цвет",
    colorFew: "цвета",
    colorMany: "цветов",
    paletteLabel: "Палитра:",
    countLabel: "Каунт",
  },
  en: {
    coverLabel: "Cross Stitch Pattern",
    designerLabel: "Designer:",
    stitchesLabel: "stitches",
    colorsLabel: "Colors count",
    colorSingular: "color",
    colorFew: "colors",
    colorMany: "colors",
    paletteLabel: "Palette:",
    countLabel: "Count",
  },
  es: {
    coverLabel: "Patrón de Punto de Cruz",
    designerLabel: "Diseñador:",
    stitchesLabel: "puntadas",
    colorsLabel: "Cantidad de colores",
    colorSingular: "color",
    colorFew: "colores",
    colorMany: "colores",
    paletteLabel: "Paleta:",
    countLabel: "Cuenta",
  },
  de: {
    coverLabel: "Kreuzstich-Muster",
    designerLabel: "Designer:",
    stitchesLabel: "Stiche",
    colorsLabel: "Anzahl der Farben",
    colorSingular: "Farbe",
    colorFew: "Farben",
    colorMany: "Farben",
    paletteLabel: "Palette:",
    countLabel: "Zählgröße",
  },
  fr: {
    coverLabel: "Modèle de Point de Croix",
    designerLabel: "Créateur:",
    stitchesLabel: "points",
    colorsLabel: "Nombre de couleurs",
    colorSingular: "couleur",
    colorFew: "couleurs",
    colorMany: "couleurs",
    paletteLabel: "Palette:",
    countLabel: "Compte",
  },
};

/**
 * Get plural form for color count based on language
 */
export function getColorPlural(count: number, language: CoverLanguage): string {
  const t = COVER_TRANSLATIONS[language];
  
  // Russian has complex plural rules
  if (language === 'ru') {
    if (count === 1) return t.colorSingular;
    if (count >= 2 && count <= 4) return t.colorFew;
    return t.colorMany;
  }
  
  // English, Spanish, German, French
  return count === 1 ? t.colorSingular : t.colorMany;
}

/**
 * Get language display name
 */
export const COVER_LANGUAGE_NAMES: Record<CoverLanguage, string> = {
  ru: 'Русский',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
};

/**
 * Get language flag emoji
 */
export const COVER_LANGUAGE_FLAGS: Record<CoverLanguage, string> = {
  ru: '🇷🇺',
  en: '🇬🇧',
  es: '🇪🇸',
  de: '🇩🇪',
  fr: '🇫🇷',
};
