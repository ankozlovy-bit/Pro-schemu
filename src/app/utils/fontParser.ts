// import * as opentype from 'opentype.js';

export interface FontCharMap {
  [key: string]: string;
}

/**
 * Парсит загруженный файл шрифта и создает таблицу соответствий символов
 */
export async function parseFontFile(fontFile: File): Promise<FontCharMap> {
  try {
    // TODO: Implement with opentype.js when available
    console.warn('Font parsing not implemented yet');
    return {};
  } catch (error) {
    console.error('Error parsing font file:', error);
    throw new Error('Не удалось распарсить файл шрифта');
  }
}

/**
 * Декодирует текст из XSP файла используя загруженный шрифт
 */
export function decodeTextWithFont(
  encodedText: string,
  charMap: FontCharMap
): string {
  let decodedText = '';
  
  for (let i = 0; i < encodedText.length; i++) {
    const char = encodedText[i];
    
    // Если есть маппинг для символа - используем его
    if (charMap[char]) {
      decodedText += charMap[char];
    } else {
      // Иначе оставляем символ как есть
      decodedText += char;
    }
  }
  
  return decodedText;
}

/**
 * Альтернативный метод: создает маппинг на основе анализа шрифта CrossStitch
 * Этот шрифт использует специальную кодировку для символов вышивки
 */
export async function createCrossStitchCharMap(fontFile: File): Promise<FontCharMap> {
  try {
    // TODO: Implement with opentype.js when available
    console.warn('CrossStitch char map creation not implemented yet');
    
    // Возвращаем пустую таблицу пока
    return {};
  } catch (error) {
    console.error('Error creating CrossStitch char map:', error);
    throw new Error('Не удалось создать таблицу символов');
  }
}

/**
 * Экспортирует таблицу символов в JSON для отладки
 */
export function exportCharMapToJSON(charMap: FontCharMap): string {
  return JSON.stringify(charMap, null, 2);
}

/**
 * Анализирует шрифт и возвращает детальную информацию
 */
export async function analyzeFontFile(fontFile: File): Promise<{
  fontFamily: string;
  glyphCount: number;
  charMap: FontCharMap;
  glyphDetails: Array<{
    index: number;
    name: string;
    unicode: number | undefined;
    unicodeChar: string;
  }>;
}> {
  try {
    // TODO: Implement with opentype.js when available
    console.warn('Font analysis not implemented yet');
    
    return {
      fontFamily: fontFile.name,
      glyphCount: 0,
      charMap: {},
      glyphDetails: [],
    };
  } catch (error) {
    console.error('Error analyzing font file:', error);
    throw new Error('Не удалось проанализировать шрифт');
  }
}
