import { jsPDF } from 'jspdf';
import { ProjectData, ThreadUsageRow } from '../types';

/**
 * Generate Thread Calculator PDF
 * Creates a professional table with thread usage calculations
 */

const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm
const MARGIN = 15; // mm

/**
 * Render text to canvas and return as image data URL
 */
function renderTextToCanvas(
  text: string,
  fontSize: number,
  fontFamily: string,
  color: string = '#2D2D2D'
): { dataUrl: string; width: number; height: number } {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    const dpi = 2;
    const scaledFontSize = fontSize * dpi;
    
    ctx.font = `${scaledFontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = scaledFontSize * 1.4;
    
    canvas.width = textWidth + 20 * dpi;
    canvas.height = textHeight + 10 * dpi;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${scaledFontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.fillText(text, 10 * dpi, 5 * dpi);
    
    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width / dpi,
      height: canvas.height / dpi,
    };
  } catch (error) {
    console.error('Error rendering text to canvas:', error);
    // Return a minimal canvas on error
    return {
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      width: 1,
      height: 1,
    };
  }
}

/**
 * Generate Thread Calculator PDF
 */
export async function generateThreadCalculatorPDF(
  projectData: ProjectData
): Promise<Uint8Array> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const fontFamily = projectData.threadUsageFontFamily || 'Georgia';
  const showColorNames = projectData.showColorNames !== false;
  const headerColor = projectData.threadUsageHeaderColor || '#8B9D83';
  
  // Helper function to convert HEX to RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 139, g: 157, b: 131 }; // Default sage green
  };
  
  // Background
  pdf.setFillColor(252, 250, 249);
  pdf.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');
  
  let yPos = MARGIN;
  
  // Title
  const titleData = renderTextToCanvas(
    projectData.chartTitle || 'Расчёт нитей',
    20,
    fontFamily
  );
  pdf.addImage(
    titleData.dataUrl,
    'PNG',
    MARGIN,
    yPos,
    Math.min(titleData.width * 0.264583, A4_WIDTH - 2 * MARGIN),
    titleData.height * 0.264583
  );
  yPos += titleData.height * 0.264583 + 10;
  
  // Table Header
  const headers = showColorNames
    ? ['№', 'Код', 'Название', 'Длина (м)', 'Пасм по 1м', 'Мотков']
    : ['№', 'Код', 'Длина (м)', 'Пасм по 1м', 'Мотков'];
  
  const colWidths = showColorNames
    ? [15, 25, 50, 25, 30, 25]
    : [20, 30, 35, 40, 35];
  
  const startX = MARGIN;
  let xPos = startX;
  
  // Draw header background
  if (headerColor !== 'none') {
    const bgColor = hexToRgb(headerColor);
    pdf.setFillColor(bgColor.r, bgColor.g, bgColor.b);
    pdf.rect(startX, yPos, colWidths.reduce((a, b) => a + b, 0), 10, 'F');
  }
  
  // Draw header borders
  pdf.setDrawColor(45, 45, 45);
  pdf.setLineWidth(0.3);
  
  // Horizontal lines
  pdf.line(startX, yPos, startX + colWidths.reduce((a, b) => a + b, 0), yPos);
  pdf.line(startX, yPos + 10, startX + colWidths.reduce((a, b) => a + b, 0), yPos + 10);
  
  // Vertical lines
  let currentX = startX;
  for (let i = 0; i <= colWidths.length; i++) {
    pdf.line(currentX, yPos, currentX, yPos + 10);
    if (i < colWidths.length) {
      currentX += colWidths[i];
    }
  }
  
  // Header text
  pdf.setFontSize(10);
  pdf.setTextColor(45, 45, 45);
  xPos = startX;
  
  headers.forEach((header, i) => {
    const headerData = renderTextToCanvas(header, 10, fontFamily);
    pdf.addImage(
      headerData.dataUrl,
      'PNG',
      xPos + 2,
      yPos + 2,
      Math.min(headerData.width * 0.264583, colWidths[i] - 4),
      headerData.height * 0.264583
    );
    xPos += colWidths[i];
  });
  
  yPos += 10;
  
  // Table rows
  const rows = projectData.threadUsageData || [];
  const rowHeight = 8;
  
  rows.forEach((row: ThreadUsageRow, index: number) => {
    // Check if we need a new page
    if (yPos + rowHeight > A4_HEIGHT - MARGIN) {
      pdf.addPage();
      pdf.setFillColor(252, 250, 249);
      pdf.rect(0, 0, A4_WIDTH, A4_HEIGHT, 'F');
      yPos = MARGIN;
    }
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(startX, yPos, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
    }
    
    // Draw cell borders
    let currentX = startX;
    for (let i = 0; i <= colWidths.length; i++) {
      pdf.line(currentX, yPos, currentX, yPos + rowHeight);
      if (i < colWidths.length) {
        currentX += colWidths[i];
      }
    }
    pdf.line(startX, yPos + rowHeight, startX + colWidths.reduce((a, b) => a + b, 0), yPos + rowHeight);
    
    // Cell data
    const cellData = showColorNames
      ? [
          String(row.number),
          row.colorCode,
          row.colorName || '',
          row.lengthMeters.toFixed(1),
          String(row.skeinsPerMeter),
          String(row.totalSkeins),
        ]
      : [
          String(row.number),
          row.colorCode,
          row.lengthMeters.toFixed(1),
          String(row.skeinsPerMeter),
          String(row.totalSkeins),
        ];
    
    xPos = startX;
    cellData.forEach((data, i) => {
      const cellTextData = renderTextToCanvas(data, 9, fontFamily);
      pdf.addImage(
        cellTextData.dataUrl,
        'PNG',
        xPos + 2,
        yPos + 1,
        Math.min(cellTextData.width * 0.264583, colWidths[i] - 4),
        cellTextData.height * 0.264583
      );
      xPos += colWidths[i];
    });
    
    yPos += rowHeight;
  });
  
  // Bottom border
  pdf.line(startX, yPos, startX + colWidths.reduce((a, b) => a + b, 0), yPos);
  
  yPos += 15;
  
  // Custom message
  if (projectData.threadUsageMessage) {
    const messageData = renderTextToCanvas(
      projectData.threadUsageMessage,
      16,
      fontFamily
    );
    pdf.addImage(
      messageData.dataUrl,
      'PNG',
      (A4_WIDTH - messageData.width * 0.264583) / 2,
      yPos,
      messageData.width * 0.264583,
      messageData.height * 0.264583
    );
    yPos += messageData.height * 0.264583 + 10;
  }
  
  // QR Codes
  if (projectData.threadUsageQRCodes && projectData.threadUsageQRCodes.length > 0) {
    const qrSize = (projectData.qrCodeSize || 80) * 0.264583; // Convert px to mm
    const qrGap = 15;
    const totalWidth = projectData.threadUsageQRCodes.length * qrSize + (projectData.threadUsageQRCodes.length - 1) * qrGap;
    let qrX = (A4_WIDTH - totalWidth) / 2;
    
    projectData.threadUsageQRCodes.forEach(qr => {
      // QR Code image
      pdf.addImage(qr.image, 'PNG', qrX, yPos, qrSize, qrSize);
      
      // QR Code name below
      const qrNameData = renderTextToCanvas(qr.name, 10, fontFamily);
      pdf.addImage(
        qrNameData.dataUrl,
        'PNG',
        qrX + (qrSize - qrNameData.width * 0.264583) / 2,
        yPos + qrSize + 2,
        qrNameData.width * 0.264583,
        qrNameData.height * 0.264583
      );
      
      qrX += qrSize + qrGap;
    });
  }
  
  // Global QR codes from settings
  if (projectData.settings) {
    yPos += 60;
    const globalQRs = [];
    if (projectData.settings.qrGroupImage) {
      globalQRs.push({ name: 'Группа', image: projectData.settings.qrGroupImage });
    }
    if (projectData.settings.qrTelegramImage) {
      globalQRs.push({ name: 'Telegram', image: projectData.settings.qrTelegramImage });
    }
    
    if (globalQRs.length > 0) {
      const qrSize = 25; // mm
      const qrGap = 15;
      const totalWidth = globalQRs.length * qrSize + (globalQRs.length - 1) * qrGap;
      let qrX = (A4_WIDTH - totalWidth) / 2;
      
      globalQRs.forEach(qr => {
        pdf.addImage(qr.image, 'PNG', qrX, yPos, qrSize, qrSize);
        
        const qrNameData = renderTextToCanvas(qr.name, 8, fontFamily);
        pdf.addImage(
          qrNameData.dataUrl,
          'PNG',
          qrX + (qrSize - qrNameData.width * 0.264583) / 2,
          yPos + qrSize + 2,
          qrNameData.width * 0.264583,
          qrNameData.height * 0.264583
        );
        
        qrX += qrSize + qrGap;
      });
    }
  }
  
  // Convert to Uint8Array
  const pdfBytes = pdf.output('arraybuffer');
  return new Uint8Array(pdfBytes);
}