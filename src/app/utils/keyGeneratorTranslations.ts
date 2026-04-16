// Translations for Symbol Key Generator
// Supports multiple languages with automatic formatting

export type SupportedLanguage = 'ru' | 'en' | 'de' | 'fr' | 'es' | 'it';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'ru', name: 'Русский', nativeName: 'Русский' },
  { code: 'en', name: 'Английский', nativeName: 'English' },
  { code: 'de', name: 'Немецкий', nativeName: 'Deutsch' },
  { code: 'fr', name: 'Французский', nativeName: 'Français' },
  { code: 'es', name: 'Испанский', nativeName: 'Español' },
  { code: 'it', name: 'Итальянский', nativeName: 'Italiano' },
];

export interface Translations {
  // Main header
  mainTitle: string;
  designer: string;
  communityLink: string;

  // Pattern info
  fabric: string;
  size: string;
  stitches: string;
  palette: string;
  colors: string;

  // Warning message
  warningMessage: string;

  // Stitch type sections
  crossStitch: string;
  halfCrossStitch: string;
  backstitch: string;
  frenchKnots: string;
  beads: string;

  // Table headers
  color: string;
  symbol: string;
  colorNumber: string;
  threads: string;
  paletteColor: string;

  // Additional terms
  count: string;
  forDesign: string;
  cmOr: string;
}

const translations: Record<SupportedLanguage, Translations> = {
  ru: {
    mainTitle: 'Ключ для дизайна',
    designer: 'Дизайнер',
    communityLink: 'Ссылка на сообщество',

    fabric: 'Канва',
    size: 'Размер',
    stitches: 'стежков',
    palette: 'Палитра',
    colors: 'Цвета',

    warningMessage: 'Обратите внимание на заштрихованные блоки, они показывают совмещение листов, их не нужно вышивать повторно!',

    crossStitch: 'Крест',
    halfCrossStitch: 'Полукрест',
    backstitch: 'Бэкстич (шов назад иголку)',
    frenchKnots: 'Французский узелок',
    beads: 'Бусины',

    color: 'Цвет',
    symbol: 'Символ',
    colorNumber: '№ цвета',
    threads: 'Нити',
    paletteColor: 'Цвет палитры',

    count: 'каунта',
    forDesign: 'для дизайна',
    cmOr: 'см или',
  },
  en: {
    mainTitle: 'Instructions and Symbol Key',
    designer: 'Designer',
    communityLink: 'Community Link',

    fabric: 'Fabric',
    size: 'Size',
    stitches: 'stitches',
    palette: 'Palette',
    colors: 'Colours',

    warningMessage: 'Attention! The shaded blocks show the alignment of the sheets, they do not need to be stitched repeatedly!',

    crossStitch: 'Cross stitch',
    halfCrossStitch: 'Half Cross Stitches',
    backstitch: 'Backstitch',
    frenchKnots: 'French Knots',
    beads: 'Beads',

    color: 'Color',
    symbol: 'Symbol',
    colorNumber: 'Color №',
    threads: 'Threads',
    paletteColor: 'Palette Color',

    count: 'count',
    forDesign: 'for design',
    cmOr: 'cm or',
  },
  de: {
    mainTitle: 'Anleitung und Symbolschlüssel',
    designer: 'Designer',
    communityLink: 'Community-Link',

    fabric: 'Stoff',
    size: 'Größe',
    stitches: 'Stiche',
    palette: 'Palette',
    colors: 'Farben',

    warningMessage: 'Achtung! Die schattierten Blöcke zeigen die Ausrichtung der Blätter, sie müssen nicht wiederholt gestickt werden!',

    crossStitch: 'Kreuzstich',
    halfCrossStitch: 'Halber Kreuzstich',
    backstitch: 'Rückstich',
    frenchKnots: 'Französische Knoten',
    beads: 'Perlen',

    color: 'Farbe',
    symbol: 'Symbol',
    colorNumber: 'Farbe №',
    threads: 'Fäden',
    paletteColor: 'Palettenfarbe',

    count: 'Zählung',
    forDesign: 'für Design',
    cmOr: 'cm oder',
  },
  fr: {
    mainTitle: 'Instructions et clé des symboles',
    designer: 'Créateur',
    communityLink: 'Lien communautaire',

    fabric: 'Tissu',
    size: 'Taille',
    stitches: 'points',
    palette: 'Palette',
    colors: 'Couleurs',

    warningMessage: 'Attention! Les blocs ombrés montrent l\'alignement des feuilles, ils n\'ont pas besoin d\'être piqués à nouveau!',

    crossStitch: 'Point de croix',
    halfCrossStitch: 'Demi-point de croix',
    backstitch: 'Point arrière',
    frenchKnots: 'Nœuds français',
    beads: 'Béquilles',

    color: 'Couleur',
    symbol: 'Symbole',
    colorNumber: 'Couleur №',
    threads: 'Fils',
    paletteColor: 'Couleur de la palette',

    count: 'compte',
    forDesign: 'pour le design',
    cmOr: 'cm ou',
  },
  es: {
    mainTitle: 'Instrucciones y clave de símbolos',
    designer: 'Diseñador',
    communityLink: 'Enlace comunitario',

    fabric: 'Tela',
    size: 'Tamaño',
    stitches: 'puntadas',
    palette: 'Paleta',
    colors: 'Colores',

    warningMessage: '¡Atención! Los bloques sombreados muestran la alineación de las hojas, ¡no es necesario coserlos repetidamente!',

    crossStitch: 'Punto de cruz',
    halfCrossStitch: 'Medio punto de cruz',
    backstitch: 'Puntada trasera',
    frenchKnots: 'Nudos franceses',
    beads: 'Perlas',

    color: 'Color',
    symbol: 'Símbolo',
    colorNumber: 'Color №',
    threads: 'Hilos',
    paletteColor: 'Color de la paleta',

    count: 'cuenta',
    forDesign: 'para el diseño',
    cmOr: 'cm o',
  },
  it: {
    mainTitle: 'Istruzioni e chiave dei simboli',
    designer: 'Designer',
    communityLink: 'Link alla comunità',

    fabric: 'Tessuto',
    size: 'Dimensione',
    stitches: 'punti',
    palette: 'Tavolozza',
    colors: 'Colori',

    warningMessage: 'Attenzione! I blocchi ombreggiati mostrano l\'allineamento dei fogli, non è necessario cucirli ripetutamente!',

    crossStitch: 'Punto croce',
    halfCrossStitch: 'Mezzo punto croce',
    backstitch: 'Punto indietro',
    frenchKnots: 'Nodi francesi',
    beads: 'Perle',

    color: 'Colore',
    symbol: 'Simbolo',
    colorNumber: 'Colore №',
    threads: 'Fili',
    paletteColor: 'Colore della tavolozza',

    count: 'conteggio',
    forDesign: 'per il design',
    cmOr: 'cm o',
  },
};

/**
 * Get translation for a specific language
 */
export function getTranslation(lang: SupportedLanguage): Translations {
  return translations[lang];
}

/**
 * Get multi-language text separated by "/"
 * Example: getMultiLangText(['ru', 'en', 'de'], 'mainTitle')
 * Returns: "Ключ для дизайна / Instructions and Symbol Key / Anleitung und Symbolschlüssel"
 */
export function getMultiLangText(
  languages: SupportedLanguage[],
  key: keyof Translations
): string {
  if (languages.length === 0) {
    // Default to Russian and English if no languages selected
    languages = ['ru', 'en'];
  }

  return languages
    .map(lang => translations[lang][key])
    .join(' / ');
}

/**
 * Get language name by code
 */
export function getLanguageName(code: SupportedLanguage): string {
  const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeName : code;
}