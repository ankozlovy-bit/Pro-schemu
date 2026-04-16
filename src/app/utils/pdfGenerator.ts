import { jsPDF } from "jspdf";
import { ProjectData, FlossColor } from "../types";

/**
 * Professional PDF Generator for Embroidery Charts
 * Generates A4 format PDF with cover, specs, floss chart, symbol key, and pattern pages
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

export class StitchPDFGenerator {
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

  /**
   * Generate complete PDF
   */
  async generatePDF(options: PDFGeneratorOptions = {}): Promise<jsPDF> {
    const {
      includeSpecs = true,
      includeFlossChart = true,
      includeSymbolKey = true,
    } = options;

    // Remove the initial blank page
    this.doc.deletePage(1);

    // Generate pages in order
    await this.addCoverPage();

    if (includeSpecs) {
      this.addSpecsPage();
    }

    if (includeFlossChart) {
      this.addFlossChartPage();
    }

    if (includeSymbolKey) {
      this.addSymbolKeyPage();
    }

    // Add pattern pages
    this.addPatternPages();

    return this.doc;
  }

  /**
   * Save PDF to file
   */
  save(filename?: string): void {
    const name = filename || `${this.projectData.chartTitle || "Схема"}_StitchPDF.pdf`;
    this.doc.save(name);
  }

  /**
   * Get PDF as blob
   */
  getBlob(): Blob {
    return this.doc.output("blob");
  }

  /**
   * Get PDF as data URL
   */
  getDataURL(): string {
    return this.doc.output("dataurlstring");
  }

  /**
   * Add new page with background
   */
  private addPage(): void {
    this.doc.addPage();
    this.currentPage++;
    this.addPageBackground();
  }

  /**
   * Add subtle background pattern
   */
  private addPageBackground(): void {
    // Soft gradient background
    this.doc.setFillColor(252, 250, 249); // #FCFAF9
    this.doc.rect(0, 0, A4_WIDTH, A4_HEIGHT, "F");

    // Add subtle corner accents
    this.doc.setFillColor(232, 240, 232); // #E8F0E8
    this.doc.setGState(new this.doc.GState({ opacity: 0.3 }));
    this.doc.circle(A4_WIDTH, 0, 60, "F");
    this.doc.circle(0, A4_HEIGHT, 50, "F");
    this.doc.setGState(new this.doc.GState({ opacity: 1 }));
  }

  /**
   * Add cover page
   */
  private async addCoverPage(): Promise<void> {
    this.addPage();

    const centerX = A4_WIDTH / 2;
    const centerY = A4_HEIGHT / 2;

    // Background color
    const bgColor = this.projectData.coverBackgroundColor || "#E8F0E8";
    const rgb = this.hexToRgb(bgColor);
    this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
    this.doc.rect(0, 0, A4_WIDTH, A4_HEIGHT, "F");

    // Cover image if provided
    if (this.projectData.coverImage) {
      try {
        // Add image with opacity
        this.doc.setGState(new this.doc.GState({ opacity: 0.2 }));
        this.doc.addImage(
          this.projectData.coverImage,
          "JPEG",
          MARGIN,
          MARGIN,
          CONTENT_WIDTH,
          CONTENT_WIDTH * 0.75,
          undefined,
          "FAST"
        );
        this.doc.setGState(new this.doc.GState({ opacity: 1 }));
      } catch (error) {
        console.error("Error adding cover image:", error);
      }
    }

    // Decorative pattern
    this.doc.setDrawColor(45, 45, 45);
    this.doc.setGState(new this.doc.GState({ opacity: 0.05 }));
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * A4_WIDTH;
      const y = Math.random() * A4_HEIGHT;
      this.doc.circle(x, y, 0.5, "F");
    }
    this.doc.setGState(new this.doc.GState({ opacity: 1 }));

    // Title
    this.doc.setTextColor(45, 45, 45);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(32);
    const title = this.projectData.coverTitle || this.projectData.chartTitle || "Схема вышивки";
    this.doc.text(title, centerX, centerY - 20, { align: "center" });

    // Subtitle
    if (this.projectData.coverSubtitle) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(16);
      this.doc.setTextColor(107, 107, 107);
      this.doc.text(this.projectData.coverSubtitle, centerX, centerY, { align: "center" });
    }

    // Separator line
    this.doc.setDrawColor(45, 45, 45);
    this.doc.setGState(new this.doc.GState({ opacity: 0.3 }));
    this.doc.setLineWidth(0.5);
    this.doc.line(centerX - 30, centerY + 15, centerX + 30, centerY + 15);
    this.doc.setGState(new this.doc.GState({ opacity: 1 }));

    // Designer
    const designer = this.projectData.coverDesigner || this.projectData.designerName;
    if (designer) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(14);
      this.doc.setTextColor(107, 107, 107);
      this.doc.text(`Дизайнер: ${designer}`, centerX, centerY + 30, { align: "center" });
    }

    // Footer branding
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(107, 107, 107);
    this.doc.text("StitchPDF", centerX, A4_HEIGHT - 20, { align: "center" });

    // Date
    const date = new Date().toLocaleDateString(
      this.projectData.language === "RU" ? "ru-RU" : "en-US"
    );
    this.doc.setFontSize(9);
    this.doc.text(date, centerX, A4_HEIGHT - 15, { align: "center" });
  }

  /**
   * Add technical specifications page
   */
  private addSpecsPage(): void {
    this.addPage();

    let yPos = MARGIN + 10;

    // Page title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(24);
    this.doc.setTextColor(45, 45, 45);
    this.doc.text("Технический паспорт", MARGIN, yPos);
    yPos += 15;

    // Separator
    this.doc.setDrawColor(232, 240, 232);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 12;

    // Project info
    const specs = [
      {
        label: "Название:",
        value: this.projectData.chartTitle || "—",
      },
      {
        label: "Дизайнер:",
        value: this.projectData.designerName || "—",
      },
      {
        label: "Размер схемы:",
        value: this.projectData.chartWidth && this.projectData.chartHeight
          ? `${this.projectData.chartWidth} × ${this.projectData.chartHeight} стежков`
          : "—",
      },
      {
        label: "Канва:",
        value: `Aida ${this.projectData.canvasCount}`,
      },
      {
        label: "Цвет ткани:",
        value: this.projectData.fabricColor,
      },
      {
        label: "Отступы:",
        value: `${this.projectData.margins} см с каждой стороны`,
      },
      {
        label: "Палитра:",
        value: this.projectData.flossRange || "DMC",
      },
      {
        label: "Количество цветов:",
        value: `${this.projectData.crossStitchColors.length} (крестик)`,
      },
    ];

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);

    specs.forEach((spec) => {
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(45, 45, 45);
      this.doc.text(spec.label, MARGIN + 5, yPos);

      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(107, 107, 107);
      this.doc.text(spec.value, MARGIN + 60, yPos);

      yPos += 10;
    });

    // Fabric calculation section
    yPos += 10;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(18);
    this.doc.setTextColor(45, 45, 45);
    this.doc.text("Расчет ткани", MARGIN, yPos);
    yPos += 12;

    if (this.projectData.chartWidth && this.projectData.chartHeight) {
      const stitchesPerCm = this.projectData.canvasCount / 2.54;
      const designWidthCm = this.projectData.chartWidth / stitchesPerCm;
      const designHeightCm = this.projectData.chartHeight / stitchesPerCm;
      const totalWidthCm = designWidthCm + this.projectData.margins * 2;
      const totalHeightCm = designHeightCm + this.projectData.margins * 2;

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(11);
      this.doc.setTextColor(107, 107, 107);

      const fabricInfo = [
        `Размер вышивки: ${designWidthCm.toFixed(1)} × ${designHeightCm.toFixed(1)} см`,
        `С отступами: ${totalWidthCm.toFixed(1)} × ${totalHeightCm.toFixed(1)} см`,
        `Рекомендуемый размер ткани: ${Math.ceil(totalWidthCm)} × ${Math.ceil(totalHeightCm)} см`,
      ];

      fabricInfo.forEach((info) => {
        this.doc.text(`• ${info}`, MARGIN + 5, yPos);
        yPos += 7;
      });
    }

    // Add page number
    this.addPageNumber();
  }

  /**
   * Add floss chart page
   */
  private addFlossChartPage(): void {
    this.addPage();

    let yPos = MARGIN + 10;

    // Page title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(24);
    this.doc.setTextColor(45, 45, 45);
    this.doc.text("Расход мулине", MARGIN, yPos);
    yPos += 15;

    // Separator
    this.doc.setDrawColor(232, 240, 232);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 12;

    // Table header
    const colWidths = [15, 40, 60, 30, 25];
    const headers = ["Символ", "DMC", "Название", "Использовано", "Нити"];

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    this.doc.setFillColor(232, 240, 232);
    this.doc.rect(MARGIN, yPos - 5, CONTENT_WIDTH, 8, "F");

    let xPos = MARGIN + 2;
    headers.forEach((header, i) => {
      this.doc.text(header, xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += 10;

    // Table rows
    const allColors = [
      ...this.projectData.crossStitchColors,
      ...this.projectData.halfStitchColors,
      ...this.projectData.backstitchColors,
      ...this.projectData.frenchKnotColors,
    ].filter((c) => c.visible);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);

    allColors.forEach((color, index) => {
      // Check if we need a new page
      if (yPos > A4_HEIGHT - 30) {
        this.addPage();
        yPos = MARGIN + 10;
      }

      // Alternating row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(252, 250, 249);
        this.doc.rect(MARGIN, yPos - 5, CONTENT_WIDTH, 8, "F");
      }

      xPos = MARGIN + 2;

      // Color square
      const rgb = this.hexToRgb(color.hex);
      this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
      this.doc.rect(xPos, yPos - 4, 4, 4, "F");
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(xPos, yPos - 4, 4, 4, "S");

      // Symbol
      this.doc.setTextColor(45, 45, 45);
      this.doc.text(color.symbol, xPos + 6, yPos);
      xPos += colWidths[0];

      // DMC code
      this.doc.text(color.dmc, xPos, yPos);
      xPos += colWidths[1];

      // Name
      this.doc.setTextColor(107, 107, 107);
      const name = color.name.length > 25 ? color.name.substring(0, 25) + "..." : color.name;
      this.doc.text(name, xPos, yPos);
      xPos += colWidths[2];

      // Usage
      this.doc.setTextColor(45, 45, 45);
      this.doc.text(color.usage.toString(), xPos, yPos);
      xPos += colWidths[3];

      // Strands
      this.doc.text(color.strands.toString(), xPos, yPos);

      yPos += 8;
    });

    // Total summary
    yPos += 5;
    this.doc.setDrawColor(45, 45, 45);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 8;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(45, 45, 45);
    this.doc.text(`Всего цветов: ${allColors.length}`, MARGIN + 2, yPos);

    this.addPageNumber();
  }

  /**
   * Add symbol key page
   */
  private addSymbolKeyPage(): void {
    this.addPage();

    let yPos = MARGIN + 10;

    // Page title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(24);
    this.doc.setTextColor(45, 45, 45);
    this.doc.text("Ключ символов", MARGIN, yPos);
    yPos += 15;

    // Separator
    this.doc.setDrawColor(232, 240, 232);
    this.doc.setLineWidth(1);
    this.doc.line(MARGIN, yPos, A4_WIDTH - MARGIN, yPos);
    yPos += 15;

    // Grid layout for symbols
    const symbolSize = 12;
    const gridCols = 4;
    const colWidth = CONTENT_WIDTH / gridCols;

    const allColors = this.projectData.crossStitchColors.filter((c) => c.visible);

    let col = 0;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);

    allColors.forEach((color) => {
      if (yPos > A4_HEIGHT - 40) {
        this.addPage();
        yPos = MARGIN + 10;
        col = 0;
      }

      const xPos = MARGIN + col * colWidth;

      // Color square with symbol
      const rgb = this.hexToRgb(color.hex);
      this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
      this.doc.rect(xPos, yPos, symbolSize, symbolSize, "F");
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(xPos, yPos, symbolSize, symbolSize, "S");

      // Symbol
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(10);
      this.doc.text(color.symbol, xPos + symbolSize / 2, yPos + symbolSize / 2 + 2, {
        align: "center",
      });

      // Color info
      this.doc.setTextColor(45, 45, 45);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.text(color.dmc, xPos + symbolSize + 3, yPos + 5);
      this.doc.setTextColor(107, 107, 107);
      const shortName = color.name.length > 15 ? color.name.substring(0, 15) + "..." : color.name;
      this.doc.text(shortName, xPos + symbolSize + 3, yPos + 10);

      col++;
      if (col >= gridCols) {
        col = 0;
        yPos += symbolSize + 8;
      }
    });

    this.addPageNumber();
  }

  /**
   * Add pattern pages (placeholder)
   */
  private addPatternPages(): void {
    // This would contain the actual pattern grid
    // For now, we'll add a placeholder
    this.addPage();

    const centerY = A4_HEIGHT / 2;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(20);
    this.doc.setTextColor(45, 45, 45);
    this.doc.text("Страницы схемы", A4_WIDTH / 2, centerY - 10, { align: "center" });

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(12);
    this.doc.setTextColor(107, 107, 107);
    this.doc.text(
      "Здесь будут размещены страницы схемы вышивки",
      A4_WIDTH / 2,
      centerY + 5,
      { align: "center" }
    );
    this.doc.text(
      "с символьной сеткой и разметкой",
      A4_WIDTH / 2,
      centerY + 12,
      { align: "center" }
    );

    this.addPageNumber();
  }

  /**
   * Add page number footer
   */
  private addPageNumber(): void {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(107, 107, 107);
    this.doc.text(`Страница ${this.currentPage}`, A4_WIDTH / 2, A4_HEIGHT - 10, {
      align: "center",
    });
  }

  /**
   * Convert hex color to RGB
   */
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

/**
 * Quick function to generate and download PDF
 */
export async function generateAndDownloadPDF(
  projectData: ProjectData,
  options?: PDFGeneratorOptions
): Promise<void> {
  const generator = new StitchPDFGenerator(projectData);
  await generator.generatePDF(options);
  generator.save();
}
