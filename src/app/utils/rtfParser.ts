/**
 * RTF Parser and Generator for Cross Stitch Symbol Key Files
 * Handles reading RTF files, extracting headers, and generating new RTF with translated headers
 */

export interface RtfHeaders {
  tableHeaders: string[];
  sectionHeaders: string[];
}

export interface HeaderTranslations {
  [originalText: string]: string;
}

/**
 * Reads RTF file and extracts all text content
 */
export async function readRtfFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    // Read as text with UTF-8, RTF files typically handle encoding internally
    reader.readAsText(file);
  });
}

/**
 * Extracts unique headers from RTF content
 * Improved to handle Cyrillic text and special RTF encoding
 */
export function extractHeaders(rtfContent: string): RtfHeaders {
  const tableHeaders: Set<string> = new Set();
  const sectionHeaders: Set<string> = new Set();

  // Decode RTF Unicode sequences to regular text
  const decodedContent = decodeRtfUnicode(rtfContent);

  // Common table headers and text fields in Cross Stitch key files
  const commonTableHeaders = [
    'Цвет', 'Символ', 'цвета', 'Нити',
    'Color', 'Symbol', 'Thread', 'Strands',
    'Couleur', 'Symbole', 'fil', 'Brins',
    'Farbe', 'Symbol', 'Fadennr', 'Fäden'
  ];

  // Additional text fields that should be translatable
  const additionalFields = [
    'ключ', 'для дизайна', 'Дизайнер', 'Наталья Козлова',
    'Канва', 'каунта', 'Размер', 'или', 'см', 'стежков', 'Палитра', 'Крест',
    '!!!Обратите внимание на затененные блоки, они показывают совмещение листов, их не нужно вышивать повторно!!!',
    'Ключ для дизайна', 'ключ для дизайна', 'для Design'
  ];

  // Extract all text content between RTF control sequences
  // Looking for patterns like plain text between curly braces and control words
  const textMatches = decodedContent.matchAll(/([А-Яа-яA-Za-z0-9№\s«»\(\)]+)/g);
  
  for (const match of textMatches) {
    const text = match[1].trim();
    if (text.length > 2 && text.length < 500) {
      // Check if it's a table header
      if (commonTableHeaders.some(h => text.includes(h))) {
        tableHeaders.add(text);
      }
      // Check if it's an additional field
      if (additionalFields.some(f => text.includes(f))) {
        tableHeaders.add(text);
      }
    }
  }

  // Extract section headers (they usually have special markers like @@% or @@)
  const sectionPattern1 = /@@%([^@]+?)(?:%%)?@@/g;
  const sectionPattern2 = /@@([^@%][^@]*?)@@/g;
  
  let match;
  while ((match = sectionPattern1.exec(decodedContent)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 0) {
      sectionHeaders.add(text);
    }
  }
  
  while ((match = sectionPattern2.exec(decodedContent)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 0 && !sectionHeaders.has(text)) {
      sectionHeaders.add(text);
    }
  }

  return {
    tableHeaders: Array.from(tableHeaders).filter(h => h.length > 0),
    sectionHeaders: Array.from(sectionHeaders).filter(h => h.length > 0)
  };
}

/**
 * Decodes RTF Unicode sequences to regular text
 */
function decodeRtfUnicode(rtfContent: string): string {
  // Replace RTF Unicode sequences (\uN?) with actual characters
  return rtfContent.replace(/\\u(-?\d+)\?/g, (_, code) => {
    const charCode = parseInt(code, 10);
    return String.fromCharCode(charCode < 0 ? 65536 + charCode : charCode);
  });
}

/**
 * Replaces headers in RTF content with translations
 */
export function replaceHeaders(
  rtfContent: string,
  translations: HeaderTranslations
): string {
  let modifiedContent = rtfContent;

  // Sort translations by length (longest first) to avoid partial replacements
  const sortedTranslations = Object.entries(translations).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [original, translated] of sortedTranslations) {
    if (!original || !translated || original === translated) continue;

    // Replace plain text occurrences
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const plainRegex = new RegExp(escapedOriginal, 'g');
    modifiedContent = modifiedContent.replace(plainRegex, translated);

    // Also handle Unicode-encoded text in RTF
    const unicodeOriginal = stringToRtfUnicode(original);
    const unicodeTranslated = stringToRtfUnicode(translated);
    
    // Only replace if the unicode encoding is different
    if (unicodeOriginal !== unicodeTranslated) {
      // Escape special regex characters in unicode version
      const escapedUnicodeOriginal = unicodeOriginal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const unicodeRegex = new RegExp(escapedUnicodeOriginal, 'g');
      modifiedContent = modifiedContent.replace(unicodeRegex, unicodeTranslated);
    }
  }

  return modifiedContent;
}

/**
 * Converts string to RTF Unicode format
 */
function stringToRtfUnicode(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode > 127) {
      result += `\\u${charCode}?`;
    } else {
      result += text[i];
    }
  }
  return result;
}

/**
 * Generates RTF file content with replaced headers
 */
export function generateRtf(
  originalContent: string,
  translations: HeaderTranslations,
  designerNameRU?: string,
  designerNameEN?: string
): string {
  let modifiedTranslations = { ...translations };
  
  // If custom designer names are provided, update the translation map
  if (designerNameRU && designerNameRU !== 'Наталья Козлова') {
    // Replace the default Russian designer name with custom one
    modifiedTranslations['Наталья Козлова'] = designerNameRU;
  }
  
  // For English and other languages, use the English version
  if (designerNameEN && translations['Наталья Козлова']) {
    const translatedValue = translations['Наталья Козлова'];
    if (translatedValue !== 'Наталья Козлова') {
      // User selected a non-Russian language, use English designer name
      modifiedTranslations['Наталья Козлова'] = designerNameEN;
    }
  }
  
  return replaceHeaders(originalContent, modifiedTranslations);
}

/**
 * Downloads RTF file
 */
export function downloadRtf(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/rtf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Default translations for common languages
 */
export const defaultTranslations: Record<string, HeaderTranslations> = {
  russian: {
    'Цвет': 'Цвет',
    'Символ': 'Символ',
    '№ цвета': '№ цвета',
    'Нити': 'Нити',
    'Полукрест': 'Полукрест',
    'Бэкстич (шов «назад иголку»)': 'Бэкстич (шов «назад иголку»)',
    'Французкий узелок': 'Французкий узелок',
    'ключ': 'ключ',
    'для дизайна': 'для дизайна',
    'Дизайнер': 'Дизайнер',
    'Наталья Козлова': 'Наталья Козлова',
    'Канва': 'Канва',
    'каунта': 'каунта',
    'Размер': 'Размер',
    'или': 'или',
    'см': 'см',
    'стежков': 'стежков',
    'Палитра': 'Палитра',
    '!!!Обратите внимание на затененные блоки, они показывают совмещение листов, их не нужно вышивать повторно!!!': '!!!Обратите внимание на затененные блоки, они п��казывают совмещение листов, их не нужно вышивать повторно!!!',
    'Крест': 'Крест'
  },
  english: {
    'Цвет': 'Color',
    'Символ': 'Symbol',
    '№ цвета': 'Thread #',
    'Нити': 'Strands',
    'Полукрест': 'Half Cross',
    'Бэкстич (шов «назад иголку»)': 'Backstitch',
    'Французкий узелок': 'French Knot',
    'ключ': 'key',
    'для дизайна': 'for design',
    'Дизайнер': 'Designer',
    'Наталья Козлова': 'Natalia Kozlova',
    'Канва': 'Fabric',
    'каунта': 'count',
    'Размер': 'Size',
    'или': 'or',
    'см': 'cm',
    'стежков': 'stitches',
    'Палитра': 'Palette',
    '!!!Обратите внимание на затененные блоки, они показывают совмещение листов, их не нужно вышивать повторно!!!': '!!!Pay attention to the shaded blocks, they show the overlap of sheets, they do not need to be stitched again!!!',
    'Крест': 'Cross Stitch'
  },
  german: {
    'Цвет': 'Farbe',
    'Символ': 'Symbol',
    '№ цвета': 'Fadennr.',
    'Нити': 'Fäden',
    'Полукрест': 'Halbkreuz',
    'Бэкстич (шов «назад иголку»)': 'Rückstich',
    'Французкий узелок': 'Französischer Knoten',
    'ключ': 'Legende',
    'для дизайна': 'für Design',
    'Дизайнер': 'Designer',
    'Наталья Козлова': 'Natalia Kozlova',
    'Канва': 'Stoff',
    'каунта': 'Fadenzahl',
    'Размер': 'Größe',
    'или': 'oder',
    'см': 'cm',
    'стежков': 'Stiche',
    'Палитра': 'Palette',
    '!!!Обратите внимание на затененные блоки, они показывают совмещение листов, их не нужно вышивать повторно!!!': '!!!Beachten Sie die schattierten Blöcke, sie zeigen die Überlappung der Blätter, sie müssen nicht erneut gestickt werden!!!',
    'Крест': 'Kreuzstich'
  },
  french: {
    'Цвет': 'Couleur',
    'Символ': 'Symbole',
    '№ цвета': 'N° de fil',
    'Нити': 'Brins',
    'Полукрест': 'Demi-point',
    'Бэкстич (шов «назад иголку»)': 'Point arrière',
    'Французкий узелок': 'Point de nœud',
    'ключ': 'clé',
    'для дизайна': 'pour le design',
    'Дизайнер': 'Concepteur',
    'Наталья Козлова': 'Natalia Kozlova',
    'Канва': 'Toile',
    'каунта': 'compte',
    'Размер': 'Taille',
    'или': 'ou',
    'см': 'cm',
    'стежков': 'points',
    'Палитра': 'Palette',
    '!!!Обратите внимание на затененные блоки, они показывают совмещение листов, их не нужно вышивать повторно!!!': '!!!Faites attention aux blocs ombrés, ils montrent le chevauchement des feuilles, ils ne doivent pas être brodés à nouveau!!!',
    'Крест': 'Point de croix'
  },
  spanish: {
    'Цвет': 'Color',
    'Символ': 'Símbolo',
    '№ цвета': 'N° de hilo',
    'Нити': 'Hebras',
    'Полукрест': 'Medio punto',
    'Бэкстич (шов «назад иголку»)': 'Pespunte',
    'Французкий узелок': 'Nudo francés',
    'ключ': 'clave',
    'для дизайна': 'para el diseño',
    'Дизайнер': 'Diseñador',
    'Наталья Козлова': 'Natalia Kozlova',
    'Канва': 'Tela',
    'каунта': 'cuenta',
    'Размер': 'Tamaño',
    'или': 'o',
    'см': 'cm',
    'стежков': 'puntadas',
    'Палитра': 'Paleta',
    '!!!Обратите внимание на затененные блоки, они показывают совмещение листов, их не нужно вышивать повторно!!!': '!!!Preste atención a los bloques sombreados, muestran la superposición de hojas, no es necesario bordarlos nuevamente!!!',
    'Крест': 'Punto de cruz'
  },
  italian: {
    'Цвет': 'Colore',
    'Символ': 'Simbolo',
    '№ цвета': 'N° filo',
    'Нити': 'Fili',
    'Полукрест': 'Mezzo punto',
    'Бэкстич (шов «назад иголку»)': 'Punto indietro',
    'Французкий узелок': 'Nodo francese',
    'ключ': 'chiave',
    'для дизайна': 'per il design',
    'Дизайнер': 'Designer',
    'Наталья Козлова': 'Natalia Kozlova',
    'Канва': 'Tela',
    'каунта': 'conta',
    'Размер': 'Dimensione',
    'или': 'o',
    'см': 'cm',
    'стежков': 'punti',
    'Палитра': 'Tavolozza',
    '!!!Обратите внимание на затененные блоки, они показывают совмещение листов, их не нужно вышивать повторно!!!': '!!!Presta attenzione ai blocchi ombreggiati, mostrano la sovrapposizione dei fogli, non devono essere ricamati di nuovo!!!',
    'Крест': 'Punto croce'
  }
};