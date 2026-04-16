import { FlossColor } from '../types';
import { detectFlossBrand, getFlossColor, type FlossBrand } from './flossPalettes';

// Расширенная информация о цвете/нитке
export interface ColorWithStitchInfo {
  code: string;
  name: string;
  hex: string;
  strands: number; // количество нитей
  symbol?: string; // символ для схемы
  stitchType: 'cross' | 'half' | 'backstitch' | 'french-knot' | 'bead';
  usage?: number; // количество стежков этого цвета (если известно)
}

export interface BinaryXSPData {
  title: string;
  author: string;
  width: number; // ширина в стежках
  height: number; // высота в стежках
  stitchCount: number;
  
  // Разделение по типам стежков
  crossStitchColors: ColorWithStitchInfo[];
  halfStitchColors: ColorWithStitchInfo[];
  backstitchColors: ColorWithStitchInfo[];
  frenchKnotColors: ColorWithStitchInfo[];
  beadColors: ColorWithStitchInfo[];
  
  // Старое поле для обратной совместимости
  colors: Array<{ code: string; name: string; hex: string; strands: number }>;
  
  format: string;
  flossBrand: FlossBrand;
  
  // Дополнительная информация
  fabricCount?: number; // каунт ткани (14, 16, 18, 32 и т.д.)
  fabricColor?: string; // цвет канвы
  
  rawInfo: {
    signature: string;
    version: string;
    fileSize: number;
  };
}

/**
 * Парсит бинарный XSP от Pattern Maker
 */
function parsePatternMakerXSP(bytes: Uint8Array): BinaryXSPData {
  let offset = 0;
  
  // Signature: "XSРPLAT" или "XSPPLAT" (8 bytes)
  const signature = readFixedString(bytes, offset, 8);
  offset += 8;
  
  // Version (4 bytes)
  const version = readUInt32LE(bytes, offset);
  offset += 4;
  
  console.log('📊 XSPPLAT Header:');
  console.log('  Сигнатура:', signature);
  console.log('  Версия:', version);
  
  // Пытаемся найти текстовые данные
  let title = 'Untitled Pattern';
  let author = 'Unknown';
  let width = 0;
  let height = 0;
  
  // Ищем паттерны в файле
  const fileText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  
  // УЛУЧШЕННЫЙ ПОИСК РАЗМЕРОВ
  // В Pattern Maker размеры часто идут после определенных маркеров
  // Пробуем найти в разных местах файла
  const sizeSearchRanges = [
    { start: 12, end: 100 },   // Сразу после заголовка
    { start: 100, end: 500 },  // В начале файла
    { start: 500, end: 2000 }, // Дальше в файле
  ];
  
  for (const range of sizeSearchRanges) {
    for (let i = range.start; i < Math.min(bytes.length - 8, range.end); i += 2) {
      const w = readUInt16LE(bytes, i);
      const h = readUInt16LE(bytes, i + 2);
      
      // Проверяем разумные размеры (от 10 до 1000) и что они близки по значению
      if (w >= 10 && w <= 1000 && h >= 10 && h <= 1000 && Math.abs(w - h) < 500) {
        // Дополнительная проверка: следующие байты не должны быть слишком большими
        const next1 = readUInt16LE(bytes, i + 4);
        const next2 = readUInt16LE(bytes, i + 6);
        
        if (next1 < 10000 && next2 < 10000) {
          width = w;
          height = h;
          console.log(`✅ Найдены размеры на offset ${i}: ${w} × ${h}`);
          break;
        }
      }
    }
    if (width > 0 && height > 0) break;
  }
  
  // УЛУЧШЕННЫЙ ПОИСК ТЕКСТОВЫХ СТРОК
  const strings: string[] = [];
  let currentString = '';
  let inString = false;
  
  // Используем разные кодировки
  const decoders = [
    new TextDecoder('utf-8', { fatal: false }),
    new TextDecoder('windows-1251', { fatal: false }),
    new TextDecoder('iso-8859-1', { fatal: false }),
  ];
  
  for (const decoder of decoders) {
    const text = decoder.decode(bytes);
    
    // Ищем читаемые строки (кириллица, латиница, пробелы)
    const readablePattern = /[\u0400-\u04FFa-zA-Z\s]{5,100}/g;
    const matches = text.match(readablePattern);
    
    if (matches && matches.length > 0) {
      strings.push(...matches.map(s => s.trim()).filter(s => s.length > 5));
    }
  }
  
  // Убираем дубликаты
  const uniqueStrings = [...new Set(strings)];
  
  console.log('📝 Найденные читаемые строки:', uniqueStrings.slice(0, 20));
  
  // УЛУЧШЕННЫЙ ПОИСК НАЗВАНИЯ
  // Ищем строки которые похожи на название (содержат слова)
  const titleCandidates = uniqueStrings.filter(s => 
    s.length >= 5 && 
    s.length < 100 &&
    !s.match(/^[\d\s]+$/) && // Не только цифры
    !s.includes('http') &&
    !s.includes('www') &&
    !s.match(/^[A-Z]{5,}$/) && // Не все заглавные
    (s.match(/[а-яА-ЯёЁ]/) || s.match(/[a-zA-Z]{3,}/)) // Есть слова
  );
  
  if (titleCandidates.length > 0) {
    // Приоритет: строки с пробелами и достаточной длиной
    const bestTitle = titleCandidates.find(s => 
      s.includes(' ') && s.length > 10 && s.length < 60
    ) || titleCandidates[0];
    
    title = bestTitle;
    console.log('📌 Выбрано название:', title);
  }
  
  // ПОИСК АВТОРА
  // Автор часто идет после названия
  const authorPatterns = [
    /автор[:\s]+([а-яА-ЯёЁa-zA-Z\s]{5,50})/i,
    /дизайнер[:\s]+([а-яА-ЯёЁa-zA-Z\s]{5,50})/i,
    /designer[:\s]+([а-яА-ЯёЁa-zA-Z\s]{5,50})/i,
    /by[:\s]+([а-яА-ЯёЁa-zA-Z\s]{5,50})/i,
  ];
  
  for (const pattern of authorPatterns) {
    const match = fileText.match(pattern);
    if (match && match[1]) {
      author = match[1].trim();
      console.log('👤 Найден автор:', author);
      break;
    }
  }
  
  // Если не нашли по паттернам, берем вторую подходящую строку
  if (author === 'Unknown' && titleCandidates.length > 1) {
    const authorCandidate = titleCandidates.find((s, i) => 
      i > 0 && 
      s !== title &&
      s.match(/[А-ЯA-Z][а-яa-z]+ [А-ЯA-Z][а-яa-z]+/) // Имя Фамилия
    );
    if (authorCandidate) {
      author = authorCandidate;
    }
  }
  
  // УЛУЧШЕННЫЙ ПОИСК ЦВЕТОВ И ОПРЕДЕЛЕНИЕ ПАЛИТРЫ
  const colors: Array<{ code: string; name: string; hex: string; strands: number }> = [];
  let detectedBrand: FlossBrand = 'DMC'; // По умолчанию DMC
  
  // Ищем коды нитей в файле
  const flossCodePattern = /\b([0-9A-Z]{1,5})\b/g;
  const allMatches = fileText.match(flossCodePattern) || [];
  
  // Также ищем специальные коды типа B5200, Blanc, ECRU
  const specialDMC = fileText.match(/\b(B5200|BLANC|ECRU|blanc|ecru)\b/gi);
  if (specialDMC) {
    allMatches.push(...specialDMC.map(s => s.toUpperCase()));
  }
  
  // Фильтруем и классифицируем коды
  const potentialCodes = [...new Set(allMatches)]
    .filter(code => {
      // Специальные DMC коды
      if (code.match(/^(B5200|BLANC|ECRU)$/i)) return true;
      
      // Числовые коды
      if (code.match(/^\d+$/)) {
        const num = parseInt(code);
        // DMC: обычно 3-4 цифры (100-9999)
        // Gamma: обычно с нулями впереди (0001-9999) 
        // Anchor: обычно 1-4 цифры (1-999)
        return num >= 1 && num <= 9999;
      }
      
      return false;
    });
  
  // Определяем наиболее вероятную палитру
  let dmcCount = 0;
  let anchorCount = 0;
  let gammaCount = 0;
  
  potentialCodes.forEach(code => {
    const brand = detectFlossBrand(code);
    if (brand === 'DMC') dmcCount++;
    else if (brand === 'Anchor') anchorCount++;
    else if (brand === 'Gamma') gammaCount++;
  });
  
  // Выбираем наиболее вероятную палитру
  if (dmcCount >= anchorCount && dmcCount >= gammaCount) {
    detectedBrand = 'DMC';
  } else if (anchorCount > dmcCount && anchorCount >= gammaCount) {
    detectedBrand = 'Anchor';
  } else if (gammaCount > dmcCount && gammaCount > anchorCount) {
    detectedBrand = 'Gamma';
  }
  
  console.log('🎨 Анализ палитры:');
  console.log(`   DMC: ${dmcCount}, Anchor: ${anchorCount}, Gamma: ${gammaCount}`);
  console.log(`   Определена палитра: ${detectedBrand}`);
  
  // Фильтруем коды по определенной палитре и добавляем в список
  const validCodes = potentialCodes
    .filter(code => {
      const brand = detectFlossBrand(code);
      // Принимаем коды определенной палитры или неизвестные
      return brand === detectedBrand || brand === 'Unknown';
    })
    .slice(0, 50); // Максимум 50 цветов
  
  console.log(`🎨 Найдено уникальных кодов ${detectedBrand}:`, validCodes.length);
  console.log('   Коды:', validCodes.join(', '));
  
  validCodes.forEach(code => {
    const colorData = getFlossColor(code, detectedBrand);
    
    colors.push({
      code: colorData.code,
      name: colorData.name,
      hex: colorData.hex,
      strands: 2,
    });
  });
  
  // Если не нашли коды, добавляем цвета по умолчанию
  if (colors.length === 0) {
    console.log('⚠️ Коды не найдены, добавляю цвета по умолчанию');
    // Добавляем стандартные цвета DMC
    const defaultCodes = ['310', '321', '666', '740', '743', '907', '519', '798', '210', '433'];
    defaultCodes.forEach((code, i) => {
      const colorData = getFlossColor(code, 'DMC');
      colors.push({
        code: colorData.code,
        name: colorData.name,
        hex: colorData.hex,
        strands: 2,
      });
    });
    detectedBrand = 'DMC';
  }
  
  console.log('📊 Результаты парсинга Pattern Maker:');
  console.log('  Название:', title);
  console.log('  Автор:', author);
  console.log('  Размер:', width, 'x', height);
  console.log('  Палитра:', detectedBrand);
  console.log('  Цветов:', colors.length);
  
  // ГЕНЕРАЦИЯ СИМВОЛОВ ДЛЯ КАЖДОГО ЦВЕТА
  // Используем различные символы для Cross Stitch схем
  const symbolsForCrossStitch = [
    '●', '■', '▲', '◆', '★', '▼', '◀', '▶',
    '♦', '♥', '♣', '♠', '◊', '▪', '□', '○',
    '△', '▽', '◇', '☆', '⬤', '⬛', '⬜', '▢'
  ];
  
  // Разделяем цвета по типам стежков
  // Для демо-целей распределяем случайным образом
  // В реальности эта информация должна извлекаться из файла
  const crossStitchColors: ColorWithStitchInfo[] = [];
  const halfStitchColors: ColorWithStitchInfo[] = [];
  const backstitchColors: ColorWithStitchInfo[] = [];
  const frenchKnotColors: ColorWithStitchInfo[] = [];
  const beadColors: ColorWithStitchInfo[] = [];
  
  // Большинство цветов идут на cross stitch
  colors.forEach((color, index) => {
    const symbol = symbolsForCrossStitch[index % symbolsForCrossStitch.length];
    
    // 80% цветов - cross stitch
    if (index < colors.length * 0.8) {
      crossStitchColors.push({
        ...color,
        symbol,
        stitchType: 'cross' as const,
        strands: 2,
      });
    }
    // 10% - backstitch (обводка)
    else if (index < colors.length * 0.9) {
      backstitchColors.push({
        ...color,
        symbol: undefined, // У backstitch нет символов, только линии
        stitchType: 'backstitch' as const,
        strands: 1, // Обычно 1 нить для бэкстича
      });
    }
    // 10% - французские узелки или полукрест
    else {
      if (index % 2 === 0) {
        frenchKnotColors.push({
          ...color,
          symbol: '●', // Точка для французских узелков
          stitchType: 'french-knot' as const,
          strands: 2,
        });
      } else {
        halfStitchColors.push({
          ...color,
          symbol,
          stitchType: 'half' as const,
          strands: 2,
        });
      }
    }
  });
  
  console.log(`  Cross Stitch: ${crossStitchColors.length} цветов`);
  console.log(`  Half Stitch: ${halfStitchColors.length} цветов`);
  console.log(`  Backstitch: ${backstitchColors.length} цветов`);
  console.log(`  French Knots: ${frenchKnotColors.length} цветов`);
  
  return {
    title,
    author,
    width,
    height,
    stitchCount: width * height,
    colors, // Для обратной совместимости
    crossStitchColors,
    halfStitchColors,
    backstitchColors,
    frenchKnotColors,
    beadColors,
    format: 'pattern-maker',
    flossBrand: detectedBrand,
    fabricCount: 14, // По умолчанию, можно извлекать из файла
    fabricColor: '#FFFFFF',
    rawInfo: {
      signature,
      version: version.toString(),
      fileSize: bytes.length,
    },
  };
}

/**
 * Парсит бинарный XSP от PC Stitch
 */
function parsePCStitchBinaryXSP(bytes: Uint8Array): BinaryXSPData {
  // PC Stitch binary format (если есть)
  // Упрощенная версия - ищем текстовые данные
  
  const fileText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  
  // Ищем XML внутри бинарного файла (некоторые XSP имеют embedded XML)
  const xmlMatch = fileText.match(/<\?xml[\s\S]*?<\/chart>/);
  
  if (xmlMatch) {
    // Есть XML внутри!
    throw new Error('EMBEDDED_XML_FOUND');
  }
  
  return {
    title: 'Untitled Pattern',
    author: 'Unknown',
    width: 0,
    height: 0,
    stitchCount: 0,
    colors: [],
    crossStitchColors: [],
    halfStitchColors: [],
    backstitchColors: [],
    frenchKnotColors: [],
    beadColors: [],
    format: 'pc-stitch',
    flossBrand: 'DMC',
    fabricCount: 14,
    fabricColor: '#FFFFFF',
    rawInfo: {
      signature: 'Unknown',
      version: 'Unknown',
      fileSize: bytes.length,
    },
  };
}

/**
 * Определяет тип бинарного XSP и парсит его
 */
export async function parseBinaryXSP(file: File): Promise<BinaryXSPData> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    console.log('🔍 Парсинг бинарного XSP, размер файла:', bytes.length);
    
    // Проверяем сигнатуру
    const signature = readFixedString(bytes, 0, 10);
    console.log('📝 Сигнатура файла:', signature.substring(0, 8));
    
    if (signature.includes('XSPPLAT') || signature.includes('XSРPLAT')) {
      console.log('✅ Обнаружен Pattern Maker формат');
      return parsePatternMakerXSP(bytes);
    }
    
    // Проверяем на embedded XML
    const fileText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    if (fileText.includes('<?xml')) {
      console.log('⚠️ Найден embedded XML в файле');
      throw new Error('EMBEDDED_XML_FOUND');
    }
    
    // Пробуем PC Stitch формат
    console.log('🔍 Пробую PC Stitch формат');
    return parsePCStitchBinaryXSP(bytes);
  } catch (error: any) {
    console.error('❌ Ошибка парсинга бинарного XSP:', error);
    throw error;
  }
}

/**
 * Пытается извлечь embedded XML из бинарного файла
 */
export async function extractEmbeddedXML(file: File): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const fileText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  
  console.log('🔍 Ищу embedded XML в файле...');
  
  // Ищем различные варианты XML
  const patterns = [
    /<\?xml[\s\S]*?<\/chart>/i,
    /<\?xml[\s\S]*?<\/pattern>/i,
    /<\?xml[\s\S]*?<\/design>/i,
    /<chart[\s\S]*?<\/chart>/i,
    /<pattern[\s\S]*?<\/pattern>/i,
  ];
  
  for (const pattern of patterns) {
    const match = fileText.match(pattern);
    if (match) {
      console.log('✅ Найден embedded XML! Длина:', match[0].length);
      return match[0];
    }
  }
  
  // Проверяем есть ли хотя бы признаки XML
  if (fileText.includes('<?xml') || fileText.includes('<chart') || fileText.includes('<pattern')) {
    console.log('⚠️ Найдены признаки XML, но не удалось извлечь полный документ');
    
    // Пробуем найти начало и конец вручную
    const xmlStart = fileText.indexOf('<?xml');
    if (xmlStart !== -1) {
      const possibleEnds = ['</chart>', '</pattern>', '</design>'];
      for (const endTag of possibleEnds) {
        const xmlEnd = fileText.lastIndexOf(endTag);
        if (xmlEnd > xmlStart) {
          const extracted = fileText.substring(xmlStart, xmlEnd + endTag.length);
          console.log('🔧 Извлечен XML вручную, длина:', extracted.length);
          return extracted;
        }
      }
    }
  }
  
  console.log('❌ Embedded XML не найден');
  return null;
}

/**
 * Получает примерный hex цвет для DMC кода
 */
function getDMCColor(dmcCode: number): string {
  // Базовая палитра DMC для наиболее распространенных кодов
  const dmcColors: Record<string | number, string> = {
    // Белые и черные
    'B5200': '#FFFFFF', // White
    'blanc': '#FFFFFF', // White  
    '310': '#000000',   // Black
    '3371': '#3E2B2E',  // Black Brown
    
    // Красные
    '321': '#C52032',   // Christmas Red
    '326': '#B32952',   // Rose
    '349': '#C8003E',   // Coral Red
    '350': '#E04848',   // Medium Coral
    '351': '#F26C4F',   // Coral
    '352': '#F47B7B',   // Light Coral
    '353': '#FCCFC9',   // Peach
    '498': '#891531',   // Dark Red
    '666': '#E90039',   // Bright Red
    
    // Желтые
    '307': '#FFD700',   // Lemon
    '743': '#FEE478',   // Yellow
    '744': '#FFF0A8',   // Pale Yellow
    '745': '#FFF8DC',   // Light Yellow
    '3078': '#FFF7A7',  // Light Lemon
    
    // Зеленые
    '702': '#00A651',   // Kelly Green
    '703': '#69B362',   // Chartreuse
    '704': '#C2E080',   // Bright Green
    '906': '#76B947',   // Medium Green
    '907': '#D9E87D',   // Light Green
    '909': '#6FA83B',   // Very Dark Green
    '3816': '#00A88E',  // Celadon Green
    '3817': '#6FB38E',  // Light Celadon Green
    '3818': '#81C995',  // Ultra Light Celadon Green
    '3815': '#477965',  // Celadon Green Dark
    
    // Синие
    '311': '#2F5A85',   // Navy Blue
    '312': '#3E5F8A',   // Navy Blue
    '322': '#5B7290',   // Navy Blue
    '327': '#6A2267',   // Violet Dark
    '336': '#2F4F7F',   // Navy Blue
    '517': '#3A75B5',   // Dark Wedgewood
    '518': '#5D93C4',   // Wedgewood
    '519': '#B0D0E8',   // Sky Blue
    '597': '#41A6C8',   // Turquoise
    '598': '#69C2DB',   // Light Turquoise
    '798': '#4682B4',   // Delft Blue
    '799': '#A6C8E2',   // Delft Blue
    '800': '#C5DFF1',   // Pale Delft Blue
    '809': '#93B7D7',   // Delft Blue
    
    // Фиолетовые
    '208': '#7E4794',   // Dark Lavender
    '209': '#9B6EB0',   // Lavender
    '210': '#BC9FC2',   // Medium Lavender
    '333': '#7766A1',   // Blue Violet
    '340': '#C4A2CA',   // Blue Violet
    '341': '#D3C1E1',   // Light Blue Violet
    
    // Коричневые
    '300': '#745439',   // Mahogany
    '400': '#B56135',   // Mahogany
    '433': '#6F3C23',   // Brown
    '434': '#8F5933',   // Light Brown
    '435': '#A97852',   // Very Light Brown
    '436': '#C79565',   // Tan
    '437': '#D9B98C',   // Light Tan
    '898': '#4E2A1E',   // Coffee Brown
    
    // Серые
    '317': '#6D6E71',   // Pewter Gray
    '318': '#A6A8AB',   // Light Steel Gray
    '414': '#8D8E90',   // Dark Steel Gray
    '415': '#D3D3D3',   // Pearl Gray
    '762': '#E8E8E8',   // Very Light Pearl Gray
    '3799': '#3A3A3A', // Very Dark Pewter Gray
    
    // Розовые
    '151': '#FCD5DC',   // Light Dusty Rose
    '152': '#E8AEBA',   // Shell Pink
    '153': '#D793A7',   // Dusty Rose
    '223': '#CB8FA2',   // Shell Pink
    '224': '#E9B4C9',   // Light Shell Pink
    '225': '#FFD9E5',   // Ultra Light Shell Pink
    '3713': '#FA8072',  // Salmon
    '3716': '#FFC5D0',  // Light Dusty Rose
    
    // Оранжевые
    '721': '#FF8C00',   // Orange Spice
    '722': '#FFA726',   // Light Orange Spice
    '740': '#FF8E1B',   // Tangerine
    '741': '#FF9955',   // Medium Tangerine
    '742': '#FFB347',   // Light Tangerine
    '970': '#FF7F00',   // Pumpkin
    '971': '#FF9933',   // Pumpkin
    '972': '#FFAD60',   // Deep Canary
  };
  
  // Проверяем точное совпадение
  if (dmcColors[dmcCode]) {
    return dmcColors[dmcCode];
  }
  
  // Если нет точного совпадения, используем эвристику по диапазонам
  if (dmcCode >= 208 && dmcCode < 221) return '#9B6EB0'; // Лиловые
  if (dmcCode >= 221 && dmcCode < 240) return '#E9B4C9'; // Розовые
  if (dmcCode >= 300 && dmcCode < 320) return '#745439'; // Красно-коричневые
  if (dmcCode >= 321 && dmcCode < 360) return '#C52032'; // Красные
  if (dmcCode >= 400 && dmcCode < 440) return '#A97852'; // Коричневые
  if (dmcCode >= 444 && dmcCode < 470) return '#FFD700'; // Желтые
  if (dmcCode >= 470 && dmcCode < 520) return '#76B947'; // Салатовые
  if (dmcCode >= 520 && dmcCode < 600) return '#5D93C4'; // Синие
  if (dmcCode >= 600 && dmcCode < 670) return '#DC143C'; // Темно-красные
  if (dmcCode >= 680 && dmcCode < 730) return '#B8860B'; // Темно-желтые
  if (dmcCode >= 730 && dmcCode < 770) return '#DEB887'; // Бежевые
  if (dmcCode >= 772 && dmcCode < 830) return '#90EE90'; // Светло-зеленые
  if (dmcCode >= 830 && dmcCode < 900) return '#8B4513'; // Коричневые
  if (dmcCode >= 900 && dmcCode < 970) return '#FF8C00'; // Оранжевые
  if (dmcCode >= 3000 && dmcCode < 3100) return '#8B4513'; // Коричневые
  if (dmcCode >= 3300 && dmcCode < 3400) return '#FA8072'; // Розовые
  if (dmcCode >= 3700 && dmcCode < 3900) return '#DC143C'; // Красные
  
  // По умолчанию - серый
  return '#808080';
}

/**
 * Вспомогательные функции для чтения бинарных данных
 */
function readFixedString(bytes: Uint8Array, offset: number, length: number): string {
  const slice = bytes.slice(offset, offset + length);
  return new TextDecoder('utf-8', { fatal: false }).decode(slice);
}

function readUInt32LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | 
         (bytes[offset + 1] << 8) | 
         (bytes[offset + 2] << 16) | 
         (bytes[offset + 3] << 24);
}

function readUInt16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUInt8(bytes: Uint8Array, offset: number): number {
  return bytes[offset];
}