import { StylePreset } from '../types/style-preset';

// Windows-1251 character mapping for Cyrillic
const WIN1251_MAP: { [key: string]: number } = {
  'А': 192, 'Б': 193, 'В': 194, 'Г': 195, 'Д': 196, 'Е': 197, 'Ж': 198, 'З': 199,
  'И': 200, 'Й': 201, 'К': 202, 'Л': 203, 'М': 204, 'Н': 205, 'О': 206, 'П': 207,
  'Р': 208, 'С': 209, 'Т': 210, 'У': 211, 'Ф': 212, 'Х': 213, 'Ц': 214, 'Ч': 215,
  'Ш': 216, 'Щ': 217, 'Ъ': 218, 'Ы': 219, 'Ь': 220, 'Э': 221, 'Ю': 222, 'Я': 223,
  'а': 224, 'б': 225, 'в': 226, 'г': 227, 'д': 228, 'е': 229, 'ж': 230, 'з': 231,
  'и': 232, 'й': 233, 'к': 234, 'л': 235, 'м': 236, 'н': 237, 'о': 238, 'п': 239,
  'р': 240, 'с': 241, 'т': 242, 'у': 243, 'ф': 244, 'х': 245, 'ц': 246, 'ч': 247,
  'ш': 248, 'щ': 249, 'ъ': 250, 'ы': 251, 'ь': 252, 'э': 253, 'ю': 254, 'я': 255,
  'Ё': 168, 'ё': 184, '№': 185
};

// Convert string to RTF with Windows-1251 encoding using hex escapes
const toRTFWin1251 = (str: string): string => {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);
    
    // ASCII printable characters (32-126) except special RTF chars
    if (code >= 32 && code <= 126 && char !== '\\' && char !== '{' && char !== '}') {
      result += char;
    }
    // Special RTF characters need escaping
    else if (char === '\\' || char === '{' || char === '}') {
      result += '\\' + char;
    }
    // Cyrillic characters - use Windows-1251 hex escape
    else if (WIN1251_MAP[char]) {
      result += `\\'${WIN1251_MAP[char].toString(16)}`;
    }
    // Other characters - try direct output or use space as fallback
    else if (code < 128) {
      result += char;
    }
    else {
      result += ' '; // Fallback for unsupported characters
    }
  }
  return result;
};

// RTF color table - convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

export const generateRTFTemplate = (
  designerName: string,
  style: StylePreset,
  translations: Record<string, string>
) => {
  const fontRgb = hexToRgb(style.fontColor);
  const borderRgb = hexToRgb(style.borderColor);
  const accentRgb = hexToRgb(style.accentColor);
  const headerBgRgb = style.headerBgColor ? hexToRgb(style.headerBgColor) : null;
  
  // Build color table (index 1 = font color, 2 = border color, 3 = accent color, 4 = header bg color)
  const colorTable = `{\\colortbl;\\red${fontRgb.r}\\green${fontRgb.g}\\blue${fontRgb.b};\\red${borderRgb.r}\\green${borderRgb.g}\\blue${borderRgb.b};\\red${accentRgb.r}\\green${accentRgb.g}\\blue${accentRgb.b};${headerBgRgb ? `\\red${headerBgRgb.r}\\green${headerBgRgb.g}\\blue${headerBgRgb.b};` : ''}}`;
  
  // Border style (if borders are disabled, use invisible borders)
  const borderStyle = style.borderColor && style.borderColor !== '' ? '\\brdrw15\\brdrs\\brdrcf2' : '\\brdrw0\\brdrnone';
  
  // Header cell background (if enabled) - minimal approach for compatibility
  const headerBg = headerBgRgb ? '\\clcbpat4' : '';
  
  // Cell borders definition
  const cellBorders = `\\clbrdrt${borderStyle}\\clbrdrl${borderStyle}\\clbrdrb${borderStyle}\\clbrdrr${borderStyle}`;
  
  // Generate Cross Stitch table rows (51 rows)
  const generateCrossStitchRows = () => {
    let rows = '';
    for (let i = 1; i <= 51; i++) {
      const oddNum = 2 * i - 1;
      const evenNum = 2 * i;
      
      rows += `{\\trowd\\trgaph108\\trleft-108
${cellBorders}\\cellx1134
${cellBorders}\\cellx2268
${cellBorders}\\cellx3402
${cellBorders}\\cellx4536
${cellBorders}\\cellx5670
${cellBorders}\\cellx6804
${cellBorders}\\cellx7938
${cellBorders}\\cellx9072
\\pard\\intbl @@%p${oddNum}%@@\\cell %s${oddNum}%\\cell %n${oddNum}%\\cell %st${oddNum}%@@\\cell @@%p${evenNum}%@@\\cell %s${evenNum}%\\cell %n${evenNum}%\\cell %st${evenNum}%@@\\cell\\row}
`;
    }
    return rows;
  };

  // Generate Half Cross table rows (10 rows)
  const generateHalfCrossRows = () => {
    let rows = '';
    for (let i = 1; i <= 10; i++) {
      const oddNum = 2 * i - 1;
      const evenNum = 2 * i;
      
      rows += `{\\trowd\\trgaph108\\trleft-108
${cellBorders}\\cellx1134
${cellBorders}\\cellx2268
${cellBorders}\\cellx3402
${cellBorders}\\cellx4536
${cellBorders}\\cellx5670
${cellBorders}\\cellx6804
${cellBorders}\\cellx7938
${cellBorders}\\cellx9072
\\pard\\intbl @@%ph${oddNum}%@@\\cell %hs${oddNum}%\\cell %hn${oddNum}%\\cell %hst${oddNum}%@@\\cell @@%ph${evenNum}%@@\\cell %hs${evenNum}%\\cell %hn${evenNum}%\\cell %hst${evenNum}%@@\\cell\\row}
`;
    }
    return rows;
  };

  // Generate Backstitch table rows (5 rows)
  const generateBackstitchRows = () => {
    let rows = '';
    for (let i = 1; i <= 5; i++) {
      const oddNum = 2 * i - 1;
      const evenNum = 2 * i;
      
      rows += `{\\trowd\\trgaph108\\trleft-108
${cellBorders}\\cellx1512
${cellBorders}\\cellx3024
${cellBorders}\\cellx4536
${cellBorders}\\cellx6048
${cellBorders}\\cellx7560
${cellBorders}\\cellx9072
\\pard\\intbl @@%bs${oddNum}%@@\\cell %bn${oddNum}%\\cell %bst${oddNum}%@@\\cell @@%bs${evenNum}%@@\\cell %bn${evenNum}%\\cell %bst${evenNum}%@@\\cell\\row}
`;
    }
    return rows;
  };

  // Generate French Knot table rows (8 rows)
  const generateFrenchKnotRows = () => {
    let rows = '';
    for (let i = 1; i <= 8; i++) {
      rows += `{\\trowd\\trgaph108\\trleft-108
${cellBorders}\\cellx3024
${cellBorders}\\cellx6048
${cellBorders}\\cellx9072
\\pard\\intbl @@%fs${i}%@@\\cell %fn${i}%\\cell %fst${i}%@@\\cell\\row}
`;
    }
    return rows;
  };

  // Generate Beads table rows (4 rows)
  const generateBeadsRows = () => {
    let rows = '';
    for (let i = 1; i <= 4; i++) {
      rows += `{\\trowd\\trgaph108\\trleft-108
${cellBorders}\\cellx3024
${cellBorders}\\cellx9072
\\pard\\intbl @@%bds${i}%@@\\cell @@%BDRNG${i}%, %bdn${i}%, %bdna${i}%@@\\cell\\row}
`;
    }
    return rows;
  };

  // Header row for Cross Stitch with accent color and background
  const headerCellBorders = `\\clbrdrt${borderStyle}\\clbrdrl${borderStyle}\\clbrdrb${borderStyle}\\clbrdrr${borderStyle}${headerBg}`;

  // Build RTF content
  const rtfHeader = `{\\rtf1\\ansi\\ansicpg1251\\deff0\\uc1 {\\fonttbl {\\f0\\fcharset204 ${style.fontName};}}`;
  const rtfPageSetup = `${colorTable}\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1134\\margb1134\\f0\\fs${style.fontSize}\\cf1`;
  
  const rtfTitle = `{\\b @@${toRTFWin1251(translations.key)}@@ ${toRTFWin1251(translations.forDesign)} "%Title%"@@}\\par`;
  const rtfDesigner = `${toRTFWin1251(translations.designer)}: ${toRTFWin1251(designerName)}\\par\\par`;
  const rtfCanvas = `{\\b ${toRTFWin1251(translations.canvas)}:} %count% ${toRTFWin1251(translations.count)}\\par`;
  const rtfSize = `{\\b ${toRTFWin1251(translations.size)}:} %dimcm%count%% ${toRTFWin1251(translations.cmOr)} %stitches% ${toRTFWin1251(translations.stitches)}\\par`;
  const rtfPalette = `{\\b ${toRTFWin1251(translations.palette)}:} %RNG%\\par\\par`;
  const rtfWarning = `{\\i ${toRTFWin1251(translations.warning)}}\\par\\par`;
  
  // Cross Stitch Table
  const rtfCrossTitle = `{\\b ${toRTFWin1251(translations.cross)}}\\par`;
  const rtfCrossHeader = `{\\trowd\\trgaph108\\trleft-108
${headerCellBorders}\\cellx1134
${headerCellBorders}\\cellx2268
${headerCellBorders}\\cellx3402
${headerCellBorders}\\cellx4536
${headerCellBorders}\\cellx5670
${headerCellBorders}\\cellx6804
${headerCellBorders}\\cellx7938
${headerCellBorders}\\cellx9072
\\pard\\intbl {\\b\\cf3 ${toRTFWin1251(translations.color)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.colorNumber)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.threads)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.color)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.colorNumber)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.threads)}}\\cell\\row}`;
  
  // Half Cross Table
  const rtfHalfTitle = `@@%ifhalf%{\\b ${toRTFWin1251(translations.halfCross)}}@@\\par`;
  const rtfHalfHeader = `{\\trowd\\trgaph108\\trleft-108
${headerCellBorders}\\cellx1134
${headerCellBorders}\\cellx2268
${headerCellBorders}\\cellx3402
${headerCellBorders}\\cellx4536
${headerCellBorders}\\cellx5670
${headerCellBorders}\\cellx6804
${headerCellBorders}\\cellx7938
${headerCellBorders}\\cellx9072
\\pard\\intbl {\\b\\cf3 ${toRTFWin1251(translations.color)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.colorNumber)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.threads)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.color)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.colorNumber)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.threads)}}\\cell\\row}`;
  
  // Backstitch Table
  const rtfBackTitle = `@@%ifbacks%{\\b ${toRTFWin1251(translations.backstitch)}}@@\\par`;
  const rtfBackHeader = `{\\trowd\\trgaph108\\trleft-108
${headerCellBorders}\\cellx1512
${headerCellBorders}\\cellx3024
${headerCellBorders}\\cellx4536
${headerCellBorders}\\cellx6048
${headerCellBorders}\\cellx7560
${headerCellBorders}\\cellx9072
\\pard\\intbl {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.colorNumber)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.threads)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.colorNumber)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.threads)}}\\cell\\row}`;
  
  // French Knots Table
  const rtfKnotsTitle = `@@%ifknots%{\\b ${toRTFWin1251(translations.frenchKnot)}}@@\\par`;
  const rtfKnotsHeader = `{\\trowd\\trgaph108\\trleft-108
${headerCellBorders}\\cellx3024
${headerCellBorders}\\cellx6048
${headerCellBorders}\\cellx9072
\\pard\\intbl {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.colorNumber)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.threads)}}\\cell\\row}`;
  
  // Beads Table
  const rtfBeadsTitle = `@@%ifbeads%{\\b ${toRTFWin1251(translations.beads)}}@@\\par`;
  const rtfBeadsHeader = `{\\trowd\\trgaph108\\trleft-108
${headerCellBorders}\\cellx3024
${headerCellBorders}\\cellx9072
\\pard\\intbl {\\b\\cf3 ${toRTFWin1251(translations.symbol)}}\\cell {\\b\\cf3 ${toRTFWin1251(translations.paletteColor)}}\\cell\\row}`;

  // Assemble all parts
  return rtfHeader + 
    rtfPageSetup + 
    rtfTitle + 
    rtfDesigner + 
    rtfCanvas + 
    rtfSize + 
    rtfPalette + 
    rtfWarning + 
    rtfCrossTitle + 
    rtfCrossHeader + 
    generateCrossStitchRows() + 
    '\\pard\\par\\par' +
    rtfHalfTitle + 
    rtfHalfHeader + 
    generateHalfCrossRows() + 
    '\\pard\\par\\par' +
    rtfBackTitle + 
    rtfBackHeader + 
    generateBackstitchRows() + 
    '\\pard\\par\\par' +
    rtfKnotsTitle + 
    rtfKnotsHeader + 
    generateFrenchKnotRows() + 
    '\\pard\\par\\par' +
    rtfBeadsTitle + 
    rtfBeadsHeader + 
    generateBeadsRows() + 
    '\\pard\\par}';
};