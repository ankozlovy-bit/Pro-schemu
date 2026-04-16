export interface ProjectData {
  id: string;
  designerName: string;
  chartTitle: string;
  language: 'RU' | 'EN';
  canvasCount: number;
  fabricColor: string;
  margins: number;
  crossStitchColors: FlossColor[];
  halfStitchColors: FlossColor[];
  backstitchColors: FlossColor[];
  frenchKnotColors: FlossColor[];
  beadColors: BeadColor[];
  selectedPages: string[];
  createdAt: Date;
  // Chart dimensions
  chartWidth?: number;
  chartHeight?: number;
  flossRange?: string; // e.g., "DMC"
  colorCount?: number; // Total number of colors in the pattern
  // Cover data
  coverImage?: string; // base64 or URL (background image)
  coverPreviewImage?: string; // base64 or URL (embroidery preview image)
  coverPreviewSize?: number; // Preview image size in % (50-100)
  coverTitle?: string;
  coverSubtitle?: string;
  coverDesigner?: string;
  coverBackgroundColor?: string;
  coverTextColor?: string; // Text color for cover
  coverFabricCount?: number; // Fabric count for size calculation (default: 14)
  threadCount?: number; // Thread count for effective fabric count (1 or 2, default: 2)
  cornerStyle?: 'rounded' | 'sharp'; // Стиль углов обложки: скругленные или прямоугольные
  coverLanguage?: 'ru' | 'en' | 'es' | 'de' | 'fr'; // Язык обложки (русский, английский, ис��анский, немецкий, французский)
  // Cover fonts
  coverTitleFont?: string; // Font for title text (default: Cormorant Garamond)
  coverTitleColor?: string; // Color for title text
  coverOtherFont?: string; // Font for other text (default: Inter)
  coverOtherColor?: string; // Color for other text (designer, dimensions, etc.)
  includeCover?: boolean; // Include cover in final PDF (default: true)
  coverPDF?: string; // base64 data of generated cover PDF
  uploadedCoverFile?: string; // base64 data of uploaded cover file (PDF/JPG/PNG)
  uploadedCoverType?: 'pdf' | 'image'; // Type of uploaded cover
  // Thread usage data
  threadUsageFile?: string; // base64 data of uploaded RTF/TXT file
  threadUsageData?: ThreadUsageRow[];
  showColorNames?: boolean; // Toggle color names column
  threadUsageMessage?: string; // Custom message (e.g., "Приятной вышивки!")
  threadUsageQRCodes?: QRCode[]; // Array of custom QR codes
  qrCodeSize?: number; // QR code size in pixels (default: 80)
  threadUsageFontFamily?: string; // Font family for thread usage table (Georgia, Playfair Display, Inter)
  threadUsageHeaderColor?: string; // Background color for table header (hex color or 'none')
  // Symbol Key data
  symbolKeyPDF?: string; // base64 data of uploaded PDF file with symbol key
  includeSymbolKey?: boolean; // Include symbol key in final PDF
  symbolKeyLanguages?: string[]; // Selected languages for symbol key generator (e.g., ['ru', 'en', 'de'])
  // Chart PDFs (uploaded by user to include in final PDF)
  chartPDFs?: ChartPDF[]; // Array of uploaded chart PDF files
  // PDF generation settings
  includeSpecs?: boolean;
  includeFlossChart?: boolean;
  patternGridSize?: number; // cells per page
  // PDF document order
  pdfDocumentOrder?: string[]; // Array of document IDs in order ['cover', 'symbolKey', 'threadUsage', 'chartPDFs']
  includeThreadUsage?: boolean; // Include thread usage table in final PDF
  includeChartPDFs?: boolean; // Include chart PDFs in final PDF
  // Global settings
  settings?: GlobalSettings;
}

export interface GlobalSettings {
  defaultLanguage?: 'RU' | 'EN';
  language?: 'RU' | 'EN';
  theme?: 'light' | 'dark';
  designerNameRU?: string;
  designerNameEN?: string;
  designerNames?: Record<string, string>; // e.g., { 'ru': 'Наталья', 'en': 'Natalia', 'de': 'Natalja' }
  qrGroupImage?: string; // base64 image
  qrTelegramImage?: string; // base64 image
  savedQRCodes?: SavedQRCode[]; // Library of saved QR codes
}

export interface SavedQRCode {
  id: string;
  name: string;
  image: string; // base64 image
  isPreset?: boolean; // Whether it's a preset template
}

export interface ThreadUsageRow {
  number: number; // № п/п
  colorCode: string; // Номер цвета (DMC)
  colorName?: string; // Наименование цвета
  lengthMeters: number; // Длина (м)
  skeinsPerMeter: number; // Кол-во пасм по 1 м (rounded)
  totalSkeins: number; // Кол-во мотков (rounded)
}

export interface FlossColor {
  id: string;
  symbol: string;
  dmc: string;
  name: string;
  hex: string;
  strands: number;
  visible: boolean;
  usage: number; // number of stitches
}

export interface BeadColor {
  id: string;
  symbol: string;
  code: string;
  name: string;
  hex: string;
  visible: boolean;
  usage: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  date: Date;
}

export interface PDFPage {
  id: string;
  title: string;
  thumbnail: string;
  type: 'cover' | 'specs' | 'key' | 'floss' | 'pattern';
}

export interface QRCode {
  id: string;
  name: string;
  image: string; // base64 image
}

export interface ChartPDF {
  id: string;
  name: string;
  file: string; // base64 file
  size: number; // file size in bytes
}

export interface SavedProject {
  id: string;
  name: string; // Project name (from chartTitle or designerName)
  createdAt: string; // ISO date string
  lastModified: string; // ISO date string
  thumbnail?: string; // base64 thumbnail of cover or preview
  projectData: ProjectData; // Full project data
  currentStep?: number; // Current step in workflow
}

export interface ProjectHistoryData {
  version: string; // Format version for future compatibility
  projects: SavedProject[];
}