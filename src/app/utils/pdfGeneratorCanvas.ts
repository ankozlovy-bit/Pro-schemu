import { jsPDF } from "jspdf";
import { ProjectData } from "../types";

/**
 * PDF Generator with Cyrillic support using Canvas rendering
 * Renders text as images to support Russian fonts
 */

const A4_WIDTH = 210; // mm
const A4_HEIGHT = 297; // mm
const MARGIN = 15; // mm
const CONTENT_WIDTH = A4_WIDTH - 2 * MARGIN;

interface PDFGeneratorOptions {
  includeSpecs?: boolean;
  includeFlossChart?: boolean;
  includeSymbolKey?: boolean;
}

interface CanvasImageData {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render text to canvas and return as base64 image with dimensions
 */
function renderTextToCanvas(
  text: string,
  options: {
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    maxWidth?: number;
  } = {}
): CanvasImageData {
  const {
    fontSize = 16,
    fontWeight = "normal",
    fontFamily = "Arial, sans-serif",
    color = "#2D2D2D",
    maxWidth = 800,
  } = options;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Use higher DPI for better quality
  const dpi = 2;
  const scaledFontSize = fontSize * dpi;

  // Set font to measure text
  ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textWidth = Math.min(metrics.width, maxWidth * dpi);
  const textHeight = scaledFontSize * 1.4;

  // Set canvas size with padding (scaled for DPI)
  canvas.width = textWidth + 40 * dpi;
  canvas.height = textHeight + 20 * dpi;

  // Clear and set font again (canvas reset after resize)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Draw text
  ctx.fillText(text, 20 * dpi, 10 * dpi, maxWidth * dpi);

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width / dpi,
    height: canvas.height / dpi,
  };
}

/**
 * Render multi-line text to canvas
 */
function renderMultilineText(
  lines: string[],
  options: {
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    lineHeight?: number;
  } = {}
): CanvasImageData {
  const {
    fontSize = 14,
    fontWeight = "normal",
    fontFamily = "Arial, sans-serif",
    color = "#2D2D2D",
    lineHeight = 1.5,
  } = options;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // Use higher DPI for better quality
  const dpi = 2;
  const scaledFontSize = fontSize * dpi;

  ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;

  // Calculate dimensions
  const maxWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const totalHeight = lines.length * scaledFontSize * lineHeight;

  canvas.width = maxWidth + 40 * dpi;
  canvas.height = totalHeight + 40 * dpi;

  // Render
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";

  lines.forEach((line, index) => {
    ctx.fillText(line, 20 * dpi, 20 * dpi + index * scaledFontSize * lineHeight);
  });

  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width / dpi,
    height: canvas.height / dpi,
  };
}

export class StitchPDFGeneratorCanvas {
  private doc: jsPDF;
  private projectData: ProjectData;
  private currentPage: number = 0;

  constructor(projectData: ProjectData) {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    this.projectData = projectData;
  }

  async generatePDF(options: PDFGeneratorOptions = {}): Promise<jsPDF> {
    const {
      includeSpecs = true,
      includeFlossChart = true,
      includeSymbolKey = true,
    } = options;

    this.doc.deletePage(1);

    await this.addCoverPage();

    if (includeSpecs) {
      await this.addSpecsPage();
    }

    if (includeFlossChart) {
      await this.addFlossChartPage();
    }

    if (includeSymbolKey) {
      await this.addSymbolKeyPage();
    }

    await this.addPatternPages();

    return this.doc;
  }

  save(filename?: string): void {
    const name = filename || `${this.projectData.chartTitle || "Схема"}_StitchPDF.pdf`;
    this.doc.save(name);
  }

  getBlob(): Blob {
    return this.doc.output("blob");
  }

  getDataURL(): string {
    return this.doc.output("dataurlstring");
  }

  private addPage(): void {
    this.doc.addPage();
    this.currentPage++;
    this.addPageBackground();
  }

  private addPageBackground(): void {
    this.doc.setFillColor(252, 250, 249);
    this.doc.rect(0, 0, A4_WIDTH, A4_HEIGHT, "F");

    this.doc.setFillColor(232, 240, 232);
    this.doc.setGState(new this.doc.GState({ opacity: 0.3 }));
    this.doc.circle(A4_WIDTH, 0, 60, "F");
    this.doc.circle(0, A4_HEIGHT, 50, "F");
    this.doc.setGState(new this.doc.GState({ opacity: 1 }));
  }

  private async addCoverPage(): Promise<void> {
    this.addPage();

    const centerX = A4_WIDTH / 2;
    const centerY = A4_HEIGHT / 2;

    // Background
    const bgColor = this.projectData.coverBackgroundColor || "#E8F0E8";
    const rgb = this.hexToRgb(bgColor);
    this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
    this.doc.rect(0, 0, A4_WIDTH, A4_HEIGHT, "F");

    // Background decorative image (optional, faded)
    if (this.projectData.coverImage) {
      try {
        this.doc.setGState(new this.doc.GState({ opacity: 0.15 }));
        this.doc.addImage(
          this.projectData.coverImage,
          "JPEG",
          0,
          0,
          A4_WIDTH,
          A4_HEIGHT,
          undefined,
          "FAST"
        );
        this.doc.setGState(new this.doc.GState({ opacity: 1 }));
      } catch (error) {
        console.error("Error adding cover background image:", error);
      }
    }

    // Decorative pattern (optimized - fixed pattern)
    this.doc.setDrawColor(45, 45, 45);
    this.doc.setGState(new this.doc.GState({ opacity: 0.05 }));
    // Use fixed grid pattern instead of random for better performance
    for (let x = 20; x < A4_WIDTH; x += 30) {
      for (let y = 20; y < A4_HEIGHT; y += 30) {
        this.doc.circle(x + (Math.sin(y) * 5), y + (Math.cos(x) * 5), 0.5, "F");
      }
    }
    this.doc.setGState(new this.doc.GState({ opacity: 1 }));

    // Calculate preview size - at 100% should be 1cm from edge (190mm max)
    // UI: 120 + (size - 50) * 4.6 pixels -> 120-350px range
    // PDF: 80 + (size - 50) / 50 * 110 -> 80-190mm range
    const coverSize = this.projectData.coverPreviewSize || 70;
    const minSize = 80; // mm at 50%
    const maxSize = 190; // mm at 100% (210mm width - 20mm margin)
    const previewSize = minSize + ((coverSize - 50) / 50) * (maxSize - minSize);
    
    // Calculate image position - vertically centered with elegant layout
    // Leave space at top for header (~50mm) and bottom for info (~30mm)
    const headerSpace = 60; // mm for header section
    const footerSpace = 35; // mm for chart info
    const availableSpace = A4_HEIGHT - headerSpace - footerSpace;
    const imageY = headerSpace + (availableSpace - previewSize) / 2;

    // Render header, title, designer with elegant typography
    const headerText = this.projectData.language === "EN" 
      ? "Cross Stitch Pattern" 
      : "Схема для вышивки крестом";
    const headerImage = renderTextToCanvas(headerText, {
      fontSize: 18,
      fontWeight: "500",
      fontFamily: "Georgia, serif",
      color: "#6B6B6B",
      maxWidth: 700,
    });
    
    const title = this.projectData.coverTitle || this.projectData.chartTitle || "Схема вышивки";
    const titleWithQuotes = `«${title}»`;
    const titleImage = renderTextToCanvas(titleWithQuotes, {
      fontSize: 36,
      fontWeight: "bold",
      fontFamily: "Georgia, serif",
      color: "#2D2D2D",
      maxWidth: 700,
    });

    const designer = this.projectData.coverDesigner || this.projectData.designerName;
    let designerImage: CanvasImageData | null = null;
    if (designer) {
      const designerLabel = this.projectData.language === "EN" ? "Designer:" : "Дизайнер:";
      designerImage = renderTextToCanvas(`${designerLabel} ${designer}`, {
        fontSize: 16,
        fontWeight: "normal",
        fontFamily: "Arial, sans-serif",
        color: "#6B6B6B",
        maxWidth: 600,
      });
    }

    const scale = 0.26;
    const headerHeightMM = headerImage.height * scale;
    const titleHeightMM = titleImage.height * scale;
    const designerHeightMM = designerImage ? designerImage.height * scale : 0;
    
    // Elegant spacing from top (not centered, fixed position)
    const headerY = MARGIN + 20; // 20mm from top
    
    // Draw header with increased spacing
    let yPos = headerY;
    this.doc.addImage(
      headerImage.dataUrl, 
      "PNG", 
      centerX - (headerImage.width * scale) / 2, 
      yPos, 
      headerImage.width * scale, 
      headerHeightMM, 
      undefined, 
      "FAST"
    );
    yPos += headerHeightMM + 6;

    // Draw title
    this.doc.addImage(
      titleImage.dataUrl, 
      "PNG", 
      centerX - (titleImage.width * scale) / 2, 
      yPos, 
      titleImage.width * scale, 
      titleHeightMM, 
      undefined, 
      "FAST"
    );
    yPos += titleHeightMM + 8;

    // Draw designer
    if (designerImage) {
      this.doc.addImage(
        designerImage.dataUrl, 
        "PNG", 
        centerX - (designerImage.width * scale) / 2, 
        yPos, 
        designerImage.width * scale, 
        designerHeightMM, 
        undefined, 
        "FAST"
      );
    }

    // Preview Image - centered on page
    if (this.projectData.coverPreviewImage) {
      try {
        // Load image to get aspect ratio (synchronous - image is already base64)
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            try {
              // Calculate actual image dimensions with aspect ratio
              const aspectRatio = img.naturalWidth && img.naturalHeight 
                ? img.naturalWidth / img.naturalHeight 
                : 1; // fallback to square if dimensions unavailable
              
              const previewWidth = previewSize; // Use calculated width from slider
              const previewHeight = previewSize / aspectRatio; // Maintain aspect ratio
              
              const previewX = centerX - previewWidth / 2;
              
              // White border frame (thicker for elegance)
              this.doc.setFillColor(255, 255, 255);
              this.doc.setGState(new this.doc.GState({ opacity: 0.95 }));
              this.doc.rect(previewX - 4, imageY - 4, previewWidth + 8, previewHeight + 8, "F");
              this.doc.setGState(new this.doc.GState({ opacity: 1 }));
              
              // Preview image with aspect ratio preserved
              this.doc.addImage(
                this.projectData.coverPreviewImage!,
                "JPEG",
                previewX,
                imageY,
                previewWidth,
                previewHeight, // Use calculated height instead of square
                undefined,
                "FAST"
              );
              
              // Elegant border with aspect ratio
              this.doc.setDrawColor(220, 220, 220);
              this.doc.setLineWidth(0.3);
              this.doc.rect(previewX, imageY, previewWidth, previewHeight, "S");
              
              resolve();
            } catch (err) {
              reject(err);
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = this.projectData.coverPreviewImage!;
        });
      } catch (error) {
        console.error("Error adding preview image:", error);
      }
    }

    // Chart info - centered between image and bottom
    if (this.projectData.coverPreviewImage && this.projectData.chartWidth && this.projectData.chartHeight) {
      // Calculate size in cm
      const fabricCount = this.projectData.coverFabricCount || 14;
      const inchToCm = 2.54;
      const widthCm = Math.round((this.projectData.chartWidth / fabricCount) * inchToCm * 10) / 10;
      const heightCm = Math.round((this.projectData.chartHeight / fabricCount) * inchToCm * 10) / 10;

      // Count unique colors
      const allColors = new Set<string>();
      this.projectData.crossStitchColors?.forEach(c => allColors.add(c.dmc));
      this.projectData.halfStitchColors?.forEach(c => allColors.add(c.dmc));
      this.projectData.backstitchColors?.forEach(c => allColors.add(c.dmc));
      this.projectData.frenchKnotColors?.forEach(c => allColors.add(c.dmc));
      const colorCount = allColors.size;

      const flossRange = this.projectData.flossRange || "DMC";

      // Info lines
      const infoLines = [
        `${this.projectData.chartWidth} × ${this.projectData.chartHeight} ${this.projectData.language === "EN" ? "stitches" : "стежков"}`,
        `${widthCm} × ${heightCm} ${this.projectData.language === "EN" ? "cm" : "см"}`,
      ];

      if (colorCount > 0) {
        const colorLabel = this.projectData.language === "EN" 
          ? `Number of ${flossRange} colors: ${colorCount}` 
          : `Количество цветов ${flossRange}: ${colorCount}`;
        infoLines.push(colorLabel);
      }

      const infoImage = renderMultilineText(infoLines, {
        fontSize: 15,
        fontWeight: "normal",
        fontFamily: "Arial, sans-serif",
        color: "#6B6B6B",
        lineHeight: 1.5,
      });
      
      const infoHeightMM = infoImage.height * scale;
      
      // Calculate bottom space and center info block
      const imageBottom = imageY + previewSize;
      const footerY = A4_HEIGHT - 18; // footer position
      const availableBottomSpace = footerY - imageBottom;
      const infoY = imageBottom + (availableBottomSpace - infoHeightMM) / 2;
      
      this.doc.addImage(
        infoImage.dataUrl, 
        "PNG", 
        centerX - (infoImage.width * scale) / 2, 
        infoY, 
        infoImage.width * scale, 
        infoHeightMM, 
        undefined, 
        "FAST"
      );
    }

    // Footer - StitchPDF badge
    const footerImage = renderTextToCanvas("StitchPDF", {
      fontSize: 12,
      fontWeight: "normal",
      fontFamily: "Arial, sans-serif",
      color: "#6B6B6B",
    });
    
    const footerScale = 0.26;
    const footerWidthMM = footerImage.width * footerScale;
    const footerHeightMM = footerImage.height * footerScale;
    this.doc.addImage(
      footerImage.dataUrl, 
      "PNG", 
      centerX - footerWidthMM / 2, 
      A4_HEIGHT - 18, 
      footerWidthMM, 
      footerHeightMM, 
      undefined, 
      "FAST"
    );
  }

  private async addSpecsPage(): Promise<void> {
    this.addPage();

    let yPos = MARGIN + 10;

    // Page title
    const titleImage = renderTextToCanvas("Технический паспорт", {
      fontSize: 36,
      fontWeight: "bold",
      fontFamily: "Georgia, serif",
      color: "#2D2D2D",
    });
    
    const titleScale = 0.26;
    const titleWidthMM = titleImage.width * titleScale;
    const titleHeightMM = titleImage.height * titleScale;
    this.doc.addImage(titleImage.dataUrl, "PNG", MARGIN, yPos, titleWidthMM, titleHeightMM, undefined, "FAST");
    yPos += titleHeightMM + 5;

    // Separator
    this.doc.setDrawColor(232, 240, 232);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 15;

    // Specs
    const specs = [
      `Название: ${this.projectData.chartTitle || "—"}`,
      `Дизайнер: ${this.projectData.designerName || "—"}`,
      this.projectData.chartWidth && this.projectData.chartHeight
        ? `Размер схемы: ${this.projectData.chartWidth} × ${this.projectData.chartHeight} стежков`
        : "Размер схемы: —",
      `Канва: Aida ${this.projectData.canvasCount}`,
      `Цвет ткани: ${this.projectData.fabricColor}`,
      `Отступы: ${this.projectData.margins} см с каждой стороны`,
      `Палитра: ${this.projectData.flossRange || "DMC"}`,
      `Количество цветов: ${this.projectData.crossStitchColors.length} (крестик)`,
    ];

    const specsImage = renderMultilineText(specs, {
      fontSize: 16,
      fontWeight: "normal",
      fontFamily: "Arial, sans-serif",
      color: "#2D2D2D",
      lineHeight: 1.8,
    });

    const specsScale = 0.26;
    const specsWidthMM = specsImage.width * specsScale;
    const specsHeightMM = specsImage.height * specsScale;
    this.doc.addImage(specsImage.dataUrl, "PNG", MARGIN + 5, yPos, specsWidthMM, specsHeightMM, undefined, "FAST");
    yPos += specsHeightMM + 10;

    // Fabric calculation
    const fabricTitleImage = renderTextToCanvas("Расчет ткани", {
      fontSize: 28,
      fontWeight: "bold",
      fontFamily: "Georgia, serif",
      color: "#2D2D2D",
    });
    
    const fabricTitleScale = 0.26;
    const fabricTitleWidthMM = fabricTitleImage.width * fabricTitleScale;
    const fabricTitleHeightMM = fabricTitleImage.height * fabricTitleScale;
    this.doc.addImage(fabricTitleImage.dataUrl, "PNG", MARGIN, yPos, fabricTitleWidthMM, fabricTitleHeightMM, undefined, "FAST");
    yPos += fabricTitleHeightMM + 5;

    if (this.projectData.chartWidth && this.projectData.chartHeight) {
      const stitchesPerCm = this.projectData.canvasCount / 2.54;
      const designWidthCm = this.projectData.chartWidth / stitchesPerCm;
      const designHeightCm = this.projectData.chartHeight / stitchesPerCm;
      const totalWidthCm = designWidthCm + this.projectData.margins * 2;
      const totalHeightCm = designHeightCm + this.projectData.margins * 2;

      const fabricInfo = [
        `Размер вышивки: ${designWidthCm.toFixed(1)} × ${designHeightCm.toFixed(1)} см`,
        `С отступами: ${totalWidthCm.toFixed(1)} × ${totalHeightCm.toFixed(1)} см`,
        `Рекомендуемый размер ткани: ${Math.ceil(totalWidthCm)} × ${Math.ceil(totalHeightCm)} см`,
      ];

      const fabricImage = renderMultilineText(fabricInfo, {
        fontSize: 14,
        fontWeight: "normal",
        fontFamily: "Arial, sans-serif",
        color: "#6B6B6B",
        lineHeight: 1.6,
      });

      const fabricScale = 0.26;
      const fabricWidthMM = fabricImage.width * fabricScale;
      const fabricHeightMM = fabricImage.height * fabricScale;
      this.doc.addImage(fabricImage.dataUrl, "PNG", MARGIN + 5, yPos, fabricWidthMM, fabricHeightMM, undefined, "FAST");
    }

    this.addPageNumber();
  }

  private async addFlossChartPage(): Promise<void> {
    this.addPage();

    let yPos = MARGIN + 10;

    // Page title
    const titleImage = renderTextToCanvas("Расход мулине", {
      fontSize: 36,
      fontWeight: "bold",
      fontFamily: "Georgia, serif",
      color: "#2D2D2D",
    });
    
    const titleScale = 0.26;
    const titleWidthMM = titleImage.width * titleScale;
    const titleHeightMM = titleImage.height * titleScale;
    this.doc.addImage(titleImage.dataUrl, "PNG", MARGIN, yPos, titleWidthMM, titleHeightMM, undefined, "FAST");
    yPos += titleHeightMM + 5;

    // Separator
    this.doc.setDrawColor(232, 240, 232);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 10;

    // Table header background
    this.doc.setFillColor(232, 240, 232);
    this.doc.rect(MARGIN, yPos - 2, CONTENT_WIDTH, 8, "F");

    // Table header
    const headerImage = renderTextToCanvas("Символ   DMC         Название                    Использовано   Нити", {
      fontSize: 12,
      fontWeight: "bold",
      fontFamily: "Arial, sans-serif",
      color: "#2D2D2D",
    });
    
    const headerScale = 0.26;
    const headerWidthMM = headerImage.width * headerScale;
    const headerHeightMM = headerImage.height * headerScale;
    this.doc.addImage(headerImage.dataUrl, "PNG", MARGIN + 2, yPos, headerWidthMM, headerHeightMM, undefined, "FAST");
    yPos += 10;

    // Table rows
    const allColors = [
      ...this.projectData.crossStitchColors,
      ...this.projectData.halfStitchColors,
      ...this.projectData.backstitchColors,
      ...this.projectData.frenchKnotColors,
    ].filter((c) => c.visible);

    allColors.forEach((color, index) => {
      if (yPos > A4_HEIGHT - 30) {
        this.addPage();
        yPos = MARGIN + 10;
      }

      // Row background
      if (index % 2 === 0) {
        this.doc.setFillColor(252, 250, 249);
        this.doc.rect(MARGIN, yPos - 3, CONTENT_WIDTH, 8, "F");
      }

      // Color square
      const rgb = this.hexToRgb(color.hex);
      this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
      this.doc.rect(MARGIN + 2, yPos - 2, 4, 4, "F");
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(MARGIN + 2, yPos - 2, 4, 4, "S");

      // Row text
      const name = color.name.length > 20 ? color.name.substring(0, 20) + "..." : color.name;
      const rowText = `${color.symbol}      ${color.dmc}         ${name}                    ${color.usage}           ${color.strands}`;
      
      const rowImage = renderTextToCanvas(rowText, {
        fontSize: 11,
        fontWeight: "normal",
        fontFamily: "Arial, sans-serif",
        color: "#2D2D2D",
      });
      
      const rowScale = 0.26;
      const rowWidthMM = rowImage.width * rowScale;
      const rowHeightMM = rowImage.height * rowScale;
      this.doc.addImage(rowImage.dataUrl, "PNG", MARGIN + 8, yPos - 1, rowWidthMM, rowHeightMM, undefined, "FAST");

      yPos += rowHeightMM + 2;
    });

    // Total
    yPos += 5;
    this.doc.setDrawColor(45, 45, 45);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 8;

    const totalImage = renderTextToCanvas(`Всего цветов: ${allColors.length}`, {
      fontSize: 16,
      fontWeight: "bold",
      fontFamily: "Arial, sans-serif",
      color: "#2D2D2D",
    });
    
    const totalScale = 0.26;
    const totalWidthMM = totalImage.width * totalScale;
    const totalHeightMM = totalImage.height * totalScale;
    this.doc.addImage(totalImage.dataUrl, "PNG", MARGIN + 2, yPos, totalWidthMM, totalHeightMM, undefined, "FAST");

    this.addPageNumber();
  }

  private async addSymbolKeyPage(): Promise<void> {
    this.addPage();

    let yPos = MARGIN + 10;

    // Page title
    const titleImage = renderTextToCanvas("Ключ символов", {
      fontSize: 36,
      fontWeight: "bold",
      fontFamily: "Georgia, serif",
      color: "#2D2D2D",
    });
    
    const titleScale = 0.26;
    const titleWidthMM = titleImage.width * titleScale;
    const titleHeightMM = titleImage.height * titleScale;
    this.doc.addImage(titleImage.dataUrl, "PNG", MARGIN, yPos, titleWidthMM, titleHeightMM, undefined, "FAST");
    yPos += titleHeightMM + 5;

    // Separator
    this.doc.setDrawColor(232, 240, 232);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 10;

    // Grid
    const symbolSize = 12;
    const gridCols = 4;
    const colWidth = CONTENT_WIDTH / gridCols;

    const allColors = this.projectData.crossStitchColors.filter((c) => c.visible);

    let col = 0;

    for (const color of allColors) {
      if (yPos > A4_HEIGHT - 40) {
        this.addPage();
        yPos = MARGIN + 10;
        col = 0;
      }

      const xPos = MARGIN + col * colWidth;

      // Color square
      const rgb = this.hexToRgb(color.hex);
      this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
      this.doc.rect(xPos, yPos, symbolSize, symbolSize, "F");
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(xPos, yPos, symbolSize, symbolSize, "S");

      // Symbol
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(14);
      this.doc.text(color.symbol, xPos + symbolSize / 2, yPos + symbolSize / 2 + 2, {
        align: "center",
      });

      // Color info
      const shortName = color.name.length > 12 ? color.name.substring(0, 12) + "..." : color.name;
      const infoText = `${color.dmc}\n${shortName}`;
      
      const infoImage = renderMultilineText([color.dmc, shortName], {
        fontSize: 9,
        fontWeight: "normal",
        fontFamily: "Arial, sans-serif",
        color: "#2D2D2D",
        lineHeight: 1.2,
      });
      
      const infoScale = 0.26;
      const infoWidthMM = infoImage.width * infoScale;
      const infoHeightMM = infoImage.height * infoScale;
      this.doc.addImage(infoImage.dataUrl, "PNG", xPos + symbolSize + 3, yPos + 2, infoWidthMM, infoHeightMM, undefined, "FAST");

      col++;
      if (col >= gridCols) {
        col = 0;
        yPos += symbolSize + 8;
      }
    }

    this.addPageNumber();
  }

  private async addPatternPages(): Promise<void> {
    this.addPage();

    const centerY = A4_HEIGHT / 2;

    const titleImage = renderTextToCanvas("Страницы схемы", {
      fontSize: 32,
      fontWeight: "bold",
      fontFamily: "Georgia, serif",
      color: "#2D2D2D",
    });
    
    const titleScale = 0.26;
    const titleWidthMM = titleImage.width * titleScale;
    const titleHeightMM = titleImage.height * titleScale;
    this.doc.addImage(
      titleImage.dataUrl, 
      "PNG", 
      A4_WIDTH / 2 - titleWidthMM / 2, 
      centerY - 15, 
      titleWidthMM, 
      titleHeightMM, 
      undefined, 
      "FAST"
    );

    const subtitleImage = renderMultilineText(
      ["Здесь будут размещены страницы схемы вышивки", "с символьной сеткой и разметкой"],
      {
        fontSize: 14,
        fontWeight: "normal",
        fontFamily: "Arial, sans-serif",
        color: "#6B6B6B",
        lineHeight: 1.5,
      }
    );
    
    const subtitleScale = 0.26;
    const subtitleWidthMM = subtitleImage.width * subtitleScale;
    const subtitleHeightMM = subtitleImage.height * subtitleScale;
    this.doc.addImage(
      subtitleImage.dataUrl, 
      "PNG", 
      A4_WIDTH / 2 - subtitleWidthMM / 2, 
      centerY + 5, 
      subtitleWidthMM, 
      subtitleHeightMM, 
      undefined, 
      "FAST"
    );

    this.addPageNumber();
  }

  private addPageNumber(): void {
    const pageNumImage = renderTextToCanvas(`Страница ${this.currentPage}`, {
      fontSize: 12,
      fontWeight: "normal",
      fontFamily: "Arial, sans-serif",
      color: "#6B6B6B",
    });
    
    const pageNumScale = 0.26;
    const pageNumWidthMM = pageNumImage.width * pageNumScale;
    const pageNumHeightMM = pageNumImage.height * pageNumScale;
    this.doc.addImage(
      pageNumImage.dataUrl, 
      "PNG", 
      A4_WIDTH / 2 - pageNumWidthMM / 2, 
      A4_HEIGHT - 12, 
      pageNumWidthMM, 
      pageNumHeightMM, 
      undefined, 
      "FAST"
    );
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }
}

export async function generateAndDownloadPDFCanvas(
  projectData: ProjectData,
  options?: PDFGeneratorOptions
): Promise<void> {
  const generator = new StitchPDFGeneratorCanvas(projectData);
  await generator.generatePDF(options);
  generator.save();
}