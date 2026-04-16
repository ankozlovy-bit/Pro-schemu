/**
 * PDF Template Placeholders System
 * 
 * Система плейсхолдеров для генерации профессиональных PDF схем вышивки
 * Поддерживает условные блоки и автоматическую подстановку значений
 */

import { ProjectData, FlossColor, BeadColor } from '../types';

export interface PDFPlaceholders {
  // Основная информация
  '%Title%': string;
  '%count%': string;
  '%dimcm%': string;
  '%stitches%': string;
  '%RNG%': string;
  
  // Крест (основные цвета)
  crossStitch: Array<{
    '%p%': string;   // preview color
    '%s%': string;   // symbol
    '%n%': string;   // DMC number
    '%st%': string;  // strands count
  }>;
  
  // Полукрест
  halfStitch: Array<{
    '%hs%': string;  // symbol
    '%hn%': string;  // DMC number
    '%hst%': string; // strands count
  }>;
  
  // Бэкстич
  backstitch: Array<{
    '%bs%': string;  // symbol
    '%bn%': string;  // DMC number
    '%bst%': string; // strands count
  }>;
  
  // Французские узелки
  frenchKnot: Array<{
    '%fs%': string;  // symbol
    '%fn%': string;  // DMC number
    '%fst%': string; // strands count
  }>;
  
  // Бисер
  beads: Array<{
    '%bds%': string; // symbol
    '%bdn%': string; // bead code/number
    '%bdc%': string; // color preview
  }>;
  
  // Условные флаги
  '%ifhalf%': boolean;
  '%ifbacks%': boolean;
  '%iffrench%': boolean;
  '%ifbeads%': boolean;
}

/**
 * Генерирует объект плейсхолдеров из данных проекта
 */
export function generatePlaceholders(projectData: ProjectData): PDFPlaceholders {
  // Вычисляем размер в сантиметрах
  const widthStitches = projectData.chartWidth || 0;
  const heightStitches = projectData.chartHeight || 0;
  const widthInches = widthStitches / projectData.canvasCount;
  const heightInches = heightStitches / projectData.canvasCount;
  const widthCm = Math.ceil(widthInches * 2.54 + projectData.margins * 2);
  const heightCm = Math.ceil(heightInches * 2.54 + projectData.margins * 2);
  
  return {
    // Основная информация
    '%Title%': projectData.chartTitle || 'Схема вышивки',
    '%count%': projectData.canvasCount.toString(),
    '%dimcm%': `${widthCm} x ${heightCm} см`,
    '%stitches%': `${widthStitches} x ${heightStitches}`,
    '%RNG%': projectData.flossRange || 'DMC',
    
    // Крест - основные цвета
    crossStitch: projectData.crossStitchColors
      .filter(c => c.visible)
      .map(color => ({
        '%p%': color.hex,
        '%s%': color.symbol,
        '%n%': color.dmc,
        '%st%': color.strands.toString(),
      })),
    
    // Полукрест
    halfStitch: projectData.halfStitchColors
      .filter(c => c.visible)
      .map((color, idx) => ({
        '%hs%': color.symbol,
        '%hn%': color.dmc,
        '%hst%': color.strands.toString(),
      })),
    
    // Бэкстич
    backstitch: projectData.backstitchColors
      .filter(c => c.visible)
      .map((color, idx) => ({
        '%bs%': color.symbol,
        '%bn%': color.dmc,
        '%bst%': color.strands.toString(),
      })),
    
    // Французские узелки
    frenchKnot: projectData.frenchKnotColors
      .filter(c => c.visible)
      .map((color, idx) => ({
        '%fs%': color.symbol,
        '%fn%': color.dmc,
        '%fst%': color.strands.toString(),
      })),
    
    // Бисер
    beads: projectData.beadColors
      .filter(b => b.visible)
      .map((bead, idx) => ({
        '%bds%': bead.symbol,
        '%bdn%': bead.code,
        '%bdc%': bead.hex,
      })),
    
    // Условные флаги
    '%ifhalf%': projectData.halfStitchColors.filter(c => c.visible).length > 0,
    '%ifbacks%': projectData.backstitchColors.filter(c => c.visible).length > 0,
    '%iffrench%': projectData.frenchKnotColors.filter(c => c.visible).length > 0,
    '%ifbeads%': projectData.beadColors.filter(b => b.visible).length > 0,
  };
}

/**
 * Применяет плейсхолдеры к тексту шаблона
 * Поддерживает условные блоки @@%if...% ... @@
 */
export function applyPlaceholders(template: string, placeholders: PDFPlaceholders): string {
  let result = template;
  
  // Обрабатываем условные блоки
  result = processConditionalBlock(result, '@@%ifhalf%', '@@', placeholders['%ifhalf%']);
  result = processConditionalBlock(result, '@@%ifbacks%', '@@', placeholders['%ifbacks%']);
  result = processConditionalBlock(result, '@@%iffrench%', '@@', placeholders['%iffrench%']);
  result = processConditionalBlock(result, '@@%ifbeads%', '@@', placeholders['%ifbeads%']);
  
  // Заменяем простые плейсхолдеры
  result = result.replace(/%Title%/g, placeholders['%Title%']);
  result = result.replace(/%count%/g, placeholders['%count%']);
  result = result.replace(/%dimcm%/g, placeholders['%dimcm%']);
  result = result.replace(/%stitches%/g, placeholders['%stitches%']);
  result = result.replace(/%RNG%/g, placeholders['%RNG%']);
  
  return result;
}

/**
 * Обрабатывает условный блок
 */
function processConditionalBlock(
  text: string, 
  startMarker: string, 
  endMarker: string, 
  condition: boolean
): string {
  const regex = new RegExp(`${escapeRegex(startMarker)}([\\s\\S]*?)${escapeRegex(endMarker)}`, 'g');
  
  if (condition) {
    // Если условие истинно - оставляем содержимое без маркеров
    return text.replace(regex, '$1');
  } else {
    // Если ложно - удаляем весь блок
    return text.replace(regex, '');
  }
}

/**
 * Экранирует специальные символы для RegExp
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Генерирует HTML таблицу для ключа схемы (Крест)
 */
export function generateCrossStitchTable(placeholders: PDFPlaceholders): string {
  if (placeholders.crossStitch.length === 0) return '';
  
  let html = `
    <div class="floss-table">
      <h3>Крест</h3>
      <table>
        <thead>
          <tr>
            <th>Цвет</th>
            <th>Символ</th>
            <th>DMC</th>
            <th>Нити</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  placeholders.crossStitch.forEach(color => {
    html += `
      <tr>
        <td><div class="color-preview" style="background-color: ${color['%p%']}"></div></td>
        <td class="symbol">${color['%s%']}</td>
        <td>${color['%n%']}</td>
        <td>${color['%st%']}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  return html;
}

/**
 * Генерирует HTML таблицу для полукреста (с условным блоком)
 */
export function generateHalfStitchTable(placeholders: PDFPlaceholders): string {
  if (!placeholders['%ifhalf%'] || placeholders.halfStitch.length === 0) return '';
  
  let html = `
    <div class="floss-table">
      <h3>Полукрест</h3>
      <table>
        <thead>
          <tr>
            <th>Символ</th>
            <th>DMC</th>
            <th>Нити</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  placeholders.halfStitch.forEach(color => {
    html += `
      <tr>
        <td class="symbol">${color['%hs%']}</td>
        <td>${color['%hn%']}</td>
        <td>${color['%hst%']}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  return html;
}

/**
 * Генерирует HTML таблицу для бэкстича (с условным блоком)
 */
export function generateBackstitchTable(placeholders: PDFPlaceholders): string {
  if (!placeholders['%ifbacks%'] || placeholders.backstitch.length === 0) return '';
  
  let html = `
    <div class="floss-table">
      <h3>Бэкстич</h3>
      <table>
        <thead>
          <tr>
            <th>Символ</th>
            <th>DMC</th>
            <th>Нити</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  placeholders.backstitch.forEach(color => {
    html += `
      <tr>
        <td class="symbol">${color['%bs%']}</td>
        <td>${color['%bn%']}</td>
        <td>${color['%bst%']}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  return html;
}

/**
 * Генерирует HTML таблицу для бисера (с условным блоком)
 */
export function generateBeadsTable(placeholders: PDFPlaceholders): string {
  if (!placeholders['%ifbeads%'] || placeholders.beads.length === 0) return '';
  
  let html = `
    <div class="floss-table">
      <h3>Бисер</h3>
      <table>
        <thead>
          <tr>
            <th>Цвет</th>
            <th>Символ</th>
            <th>Номер</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  placeholders.beads.forEach(bead => {
    html += `
      <tr>
        <td><div class="color-preview" style="background-color: ${bead['%bdc%']}"></div></td>
        <td class="symbol">${bead['%bds%']}</td>
        <td>${bead['%bdn%']}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  return html;
}

/**
 * Генерирует полный ключ схемы (все таблицы)
 */
export function generateCompleteKey(placeholders: PDFPlaceholders): string {
  return `
    ${generateCrossStitchTable(placeholders)}
    ${generateHalfStitchTable(placeholders)}
    ${generateBackstitchTable(placeholders)}
    ${generateBeadsTable(placeholders)}
  `;
}
