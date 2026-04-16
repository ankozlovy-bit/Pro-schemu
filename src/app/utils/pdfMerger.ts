import { PDFDocument } from 'pdf-lib';
import { ProjectData } from '../types';
import { generateThreadCalculatorPDF } from './threadCalculatorPDF';

/**
 * Unified PDF Merger
 * Combines all PDF parts into a single final document
 */

interface MergerOptions {
  includeCover?: boolean;
  includeSpecs?: boolean;
  includeFlossChart?: boolean;
  includeSymbolKey?: boolean;
}

/**
 * Convert base64 data URL to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    console.error('Error converting base64 to Uint8Array:', error);
    throw error;
  }
}

/**
 * Main function to merge all PDFs
 */
export async function generateAndDownloadMergedPDF(
  projectData: ProjectData,
  options: MergerOptions = {}
): Promise<void> {
  try {
    const {
      includeCover = projectData.includeCover !== false,
      includeSpecs = projectData.includeSpecs !== false,
      includeFlossChart = projectData.includeFlossChart !== false,
      includeSymbolKey = projectData.includeSymbolKey !== false,
    } = options;

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    let pageCount = 0;
    
    // 1. Add Cover Page (if enabled and exists)
    if (includeCover && projectData.coverPDF) {
      console.log('Adding cover page from saved PDF...');
      try {
        const coverPdfBytes = base64ToUint8Array(projectData.coverPDF);
        const coverPdf = await PDFDocument.load(coverPdfBytes);
        const coverPages = await mergedPdf.copyPages(coverPdf, coverPdf.getPageIndices());
        coverPages.forEach(page => mergedPdf.addPage(page));
        pageCount += coverPages.length;
        console.log(`Added cover page(s). Total pages: ${pageCount}`);
      } catch (error) {
        console.error('Error adding cover PDF:', error);
      }
    } else if (includeCover) {
      console.log('Warning: Cover is enabled but no coverPDF found in projectData');
    }
    
    // 2. Add Specs/Key Page (if enabled)
    // Note: This would need to be generated separately
    // For now, we'll skip if not implemented
    
    // 3. Add Symbol Key PDF (if uploaded and enabled)
    if (includeSymbolKey && projectData.symbolKeyPDF) {
      console.log('Adding symbol key PDF...');
      try {
        const symbolKeyBytes = base64ToUint8Array(projectData.symbolKeyPDF);
        const symbolKeyPdf = await PDFDocument.load(symbolKeyBytes);
        const symbolKeyPages = await mergedPdf.copyPages(
          symbolKeyPdf,
          symbolKeyPdf.getPageIndices()
        );
        symbolKeyPages.forEach(page => mergedPdf.addPage(page));
        pageCount += symbolKeyPages.length;
        console.log(`Added symbol key PDF. Total pages: ${pageCount}`);
      } catch (error) {
        console.error('Error adding symbol key PDF:', error);
      }
    }
    
    // 4. Add Thread Usage/Calculator PDF (if enabled and has data)
    if (includeFlossChart && projectData.threadUsageData && projectData.threadUsageData.length > 0) {
      console.log('Generating thread calculator PDF...');
      try {
        const threadPdfBytes = await generateThreadCalculatorPDF(projectData);
        const threadPdf = await PDFDocument.load(threadPdfBytes);
        const threadPages = await mergedPdf.copyPages(
          threadPdf,
          threadPdf.getPageIndices()
        );
        threadPages.forEach(page => mergedPdf.addPage(page));
        pageCount += threadPages.length;
        console.log(`Added thread calculator PDF. Total pages: ${pageCount}`);
      } catch (error) {
        console.error('Error adding thread calculator PDF:', error);
      }
    }
    
    // 5. Add Chart PDFs (uploaded pattern files)
    if (projectData.chartPDFs && projectData.chartPDFs.length > 0) {
      console.log(`Adding ${projectData.chartPDFs.length} chart PDF(s)...`);
      for (const chartPdf of projectData.chartPDFs) {
        try {
          const chartBytes = base64ToUint8Array(chartPdf.file);
          const chartDoc = await PDFDocument.load(chartBytes);
          const chartPages = await mergedPdf.copyPages(
            chartDoc,
            chartDoc.getPageIndices()
          );
          chartPages.forEach(page => mergedPdf.addPage(page));
          pageCount += chartPages.length;
          console.log(`Added chart PDF "${chartPdf.name}". Total pages: ${pageCount}`);
        } catch (error) {
          console.error(`Error adding chart PDF "${chartPdf.name}":`, error);
        }
      }
    }
    
    // Check if we have any pages
    if (pageCount === 0) {
      throw new Error('No pages were added to the PDF. Please ensure you have uploaded content.');
    }
    
    // Save the merged PDF
    console.log(`Saving merged PDF with ${pageCount} pages...`);
    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectData.chartTitle || 'Схема'}_StitchPDF.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup with delay to ensure download completes
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('PDF successfully generated and downloaded!');
  } catch (error) {
    console.error('Error generating merged PDF:', error);
    throw error;
  }
}
