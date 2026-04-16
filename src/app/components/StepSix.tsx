import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, Download, FileText, Image, List, Calculator, GripVertical } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ProjectData } from "../types";
import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SuccessModal from './SuccessModal';

interface StepSixProps {
  projectData: ProjectData;
  updateProjectData: (updates: Partial<ProjectData>) => void;
  onBack: () => void;
}

interface DocumentItem {
  id: string;
  type: 'cover' | 'symbolKey' | 'threadUsage' | 'chartPDFs';
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

interface DraggableDocumentProps {
  item: DocumentItem;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

const ItemType = 'DOCUMENT';

function DraggableDocument({ item, index, moveItem }: DraggableDocumentProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(draggedItem: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: () => {
      return { id: item.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="transition-opacity"
    >
      <label className="flex items-start gap-3 p-4 bg-[#E8F0E8]/30 rounded-2xl cursor-pointer hover:bg-[#E8F0E8]/50 transition-colors">
        <Checkbox
          checked={item.checked}
          onCheckedChange={item.onToggle}
          className="mt-0.5"
          onClick={(e) => e.stopPropagation()}
        />
        <div 
          ref={drag}
          className="cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5"
        >
          <GripVertical className="w-5 h-5 text-[#6B6B6B]" />
        </div>
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {item.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-xs text-[#6B6B6B] mt-1">{item.description}</p>
          </div>
          <div className="flex-shrink-0 w-8 h-8 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-sm font-medium">
            {index + 1}
          </div>
        </div>
      </label>
    </div>
  );
}

export default function StepSix({
  projectData,
  updateProjectData,
  onBack,
}: StepSixProps) {
  console.log('📦 StepSix rendering with projectData:', projectData);
  console.log('📊 ProjectData keys:', Object.keys(projectData));
  console.log('📄 Chart PDFs:', projectData.chartPDFs);
  console.log('🧵 Thread usage data:', projectData.threadUsageData);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize document order - without onToggle handlers
  const getInitialDocuments = (): Omit<DocumentItem, 'onToggle'>[] => {
    const docs: Omit<DocumentItem, 'onToggle'>[] = [];

    // Always add cover
    docs.push({
      id: 'cover',
      type: 'cover',
      icon: <Image className="w-5 h-5 text-[#2D2D2D]/60" />,
      title: 'Обложка',
      description: 'Дизайнерская обложка с превью схемы',
      checked: projectData.includeCover !== false,
    });

    // Always add symbol key
    docs.push({
      id: 'symbolKey',
      type: 'symbolKey',
      icon: <List className="w-5 h-5 text-[#2D2D2D]/60" />,
      title: 'Ключ схемы',
      description: 'Таблица символов с расшифровкой',
      checked: projectData.includeSymbolKey !== false,
    });

    // Add thread usage if exists
    if (projectData.threadUsageData && projectData.threadUsageData.length > 0) {
      docs.push({
        id: 'threadUsage',
        type: 'threadUsage',
        icon: <Calculator className="w-5 h-5 text-[#2D2D2D]/60" />,
        title: 'Расход нитей',
        description: `Таблица расхода мулине (${projectData.threadUsageData.length} цветов)`,
        checked: projectData.includeThreadUsage !== false,
      });
    }

    // Add chart PDFs if exist
    if (projectData.chartPDFs && projectData.chartPDFs.length > 0) {
      docs.push({
        id: 'chartPDFs',
        type: 'chartPDFs',
        icon: <FileText className="w-5 h-5 text-[#2D2D2D]/60" />,
        title: 'Схемы',
        description: `${projectData.chartPDFs.length} PDF файл(ов)`,
        checked: projectData.includeChartPDFs !== false,
      });
    }

    // Sort by saved order if exists
    if (projectData.pdfDocumentOrder && projectData.pdfDocumentOrder.length > 0) {
      const orderMap = new Map(projectData.pdfDocumentOrder.map((id, index) => [id, index]));
      docs.sort((a, b) => {
        const aOrder = orderMap.get(a.id) ?? 999;
        const bOrder = orderMap.get(b.id) ?? 999;
        return aOrder - bOrder;
      });
    }

    return docs;
  };

  const [documents, setDocuments] = useState<Omit<DocumentItem, 'onToggle'>[]>(getInitialDocuments);

  // Create toggle handler
  const handleToggle = useCallback((id: string, checked: boolean) => {
    // Update local state
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, checked } : doc
    ));

    // Update global state based on document type
    if (id === 'cover') {
      updateProjectData({ includeCover: checked });
    } else if (id === 'symbolKey') {
      updateProjectData({ includeSymbolKey: checked });
    } else if (id === 'threadUsage') {
      updateProjectData({ includeThreadUsage: checked });
    } else if (id === 'chartPDFs') {
      updateProjectData({ includeChartPDFs: checked });
    }
  }, [updateProjectData]);

  // Create documents with handlers for rendering
  const documentsWithHandlers: DocumentItem[] = documents.map(doc => ({
    ...doc,
    onToggle: (checked: boolean) => handleToggle(doc.id, checked),
  }));

  const moveItem = useCallback((dragIndex: number, hoverIndex: number) => {
    setDocuments((prevDocs) => {
      const newDocs = [...prevDocs];
      const [removed] = newDocs.splice(dragIndex, 1);
      newDocs.splice(hoverIndex, 0, removed);

      // Save new order
      const newOrder = newDocs.map(doc => doc.id);
      updateProjectData({ pdfDocumentOrder: newOrder });

      return newDocs;
    });
  }, [updateProjectData]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      console.log('📄 Starting PDF generation...');
      
      // Get checked documents in order
      const checkedDocs = documentsWithHandlers.filter(doc => doc.checked);
      
      if (checkedDocs.length === 0) {
        alert('Пожалуйста, выберите хотя бы один документ для включения в PDF');
        setIsGenerating(false);
        return;
      }
      
      // Create main PDF document
      const mergedPdf = await PDFDocument.create();
      
      // Process each document in order
      for (const doc of checkedDocs) {
        console.log(`📝 Processing: ${doc.title}`);
        
        try {
          if (doc.type === 'cover') {
            // Add cover page - use coverPDF or uploadedCoverFile
            await addCoverPage(mergedPdf, projectData);
          } else if (doc.type === 'symbolKey') {
            // Add symbol key page - use uploaded symbolKeyPDF
            await addSymbolKeyPage(mergedPdf, projectData);
          } else if (doc.type === 'threadUsage' && projectData.threadUsageData) {
            // Add thread usage page
            await addThreadUsagePage(mergedPdf, projectData);
          } else if (doc.type === 'chartPDFs' && projectData.chartPDFs) {
            // Add chart PDF pages
            await addChartPages(mergedPdf, projectData.chartPDFs);
          }
        } catch (error) {
          console.error(`Error adding ${doc.title}:`, error);
          // Continue with other documents even if one fails
        }
      }
      
      // Save and download
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectData.chartTitle || 'схема'}-полный.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('✅ PDF generated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error("❌ Error generating PDF:", error);
      alert(`Ошибка при генерации PDF: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to add cover page
  const addCoverPage = async (pdfDoc: PDFDocument, data: ProjectData) => {
    try {
      console.log('🎨 === Starting cover page addition ===');
      console.log('Available cover data:');
      console.log('- uploadedCoverFile:', data.uploadedCoverFile ? `EXISTS (${data.uploadedCoverFile.substring(0, 50)}...)` : 'NOT SET');
      console.log('- uploadedCoverType:', data.uploadedCoverType || 'NOT SET');
      console.log('- coverPDF:', data.coverPDF ? `EXISTS (${data.coverPDF.substring(0, 50)}...)` : 'NOT SET');
      
      // PRIORITY: Use uploadedCoverFile's PDF if user uploaded custom cover
      // Otherwise, use coverPDF from editor
      let coverSource: string | undefined;
      
      if (data.uploadedCoverFile) {
        // User uploaded a custom cover - ALWAYS prefer coverPDF (which contains the converted version)
        console.log('✅ User uploaded custom cover detected');
        coverSource = data.coverPDF;
        console.log('Using coverPDF (converted from upload):', coverSource ? 'EXISTS' : 'MISSING');
      } else if (data.coverPDF) {
        // No uploaded file, use editor-generated cover
        console.log('✅ Editor-generated cover detected');
        coverSource = data.coverPDF;
        console.log('Using coverPDF (from editor):', coverSource ? 'EXISTS' : 'MISSING');
      } else {
        // No cover yet - this is normal during the workflow
        console.log('ℹ️ Cover not created yet - skipping cover page');
        return;
      }
      
      if (!coverSource) {
        console.log('ℹ️ Cover source is empty - skipping cover page');
        return;
      }
      
      // Validate that coverSource is a string
      if (typeof coverSource !== 'string') {
        console.error('❌ Cover source is not a string, type:', typeof coverSource);
        throw new Error('Invalid cover source - not a string');
      }
      
      console.log('📸 Processing cover page...');
      console.log('Cover source length:', coverSource.length);
      console.log('Cover source preview:', coverSource.substring(0, 100) + '...');
      
      // Remove data URL prefix if present
      let base64Data = coverSource;
      
      // Detect and remove data URL prefix - use indexOf for reliability
      if (coverSource.startsWith('data:')) {
        const base64Index = coverSource.indexOf('base64,');
        if (base64Index !== -1) {
          base64Data = coverSource.substring(base64Index + 7); // 7 = length of "base64,"
          console.log('✅ Extracted base64 from data URL');
          console.log('✅ Extracted data length:', base64Data.length);
        } else {
          console.error('❌ Found data: prefix but no base64, marker');
          throw new Error('Invalid data URL format - missing base64 marker');
        }
      } else {
        console.log('⚠️ No data URL prefix found, assuming raw base64');
      }
      
      // Clean up base64 string - remove any whitespace, newlines, and other non-base64 chars
      base64Data = base64Data.trim().replace(/[\s\n\r]+/g, '');
      
      // Convert base64url to standard base64 if needed (replace - with + and _ with /)
      base64Data = base64Data.replace(/-/g, '+').replace(/_/g, '/');
      
      // Validate base64 characters (A-Z, a-z, 0-9, +, /, =)
      const base64Regex = /^[A-Za-z0-9+/]+=*$/;
      if (!base64Regex.test(base64Data)) {
        console.error('❌ Base64 string contains invalid characters');
        console.log('First 200 chars:', base64Data.substring(0, 200));
        console.log('Last 50 chars:', base64Data.substring(base64Data.length - 50));
        
        // Find first invalid character position
        for (let i = 0; i < Math.min(base64Data.length, 500); i++) {
          const char = base64Data[i];
          if (!/[A-Za-z0-9+/=]/.test(char)) {
            console.error(`❌ Invalid character at position ${i}: "${char}" (code: ${char.charCodeAt(0)})`);
            break;
          }
        }
        
        throw new Error('Invalid base64 data - contains invalid characters');
      }
      
      // Basic validation - check if it looks like base64
      if (!base64Data || base64Data.length < 100) {
        console.error('❌ Base64 data too short or empty, length:', base64Data.length);
        throw new Error('Invalid base64 data - too short');
      }
      
      console.log('✅ Base64 data length:', base64Data.length);
      console.log('✅ Base64 validation passed');
      
      // Convert to bytes with error handling
      let bytes: Uint8Array;
      try {
        const binaryString = atob(base64Data);
        bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        console.log('✅ Successfully decoded base64, bytes length:', bytes.length);
      } catch (decodeError) {
        console.error('❌ Failed to decode base64:', decodeError);
        console.error('Base64 sample (first 100 chars):', base64Data.substring(0, 100));
        throw new Error('Failed to decode cover image/PDF');
      }
      
      // Check if it's a PDF or image by inspecting first few bytes
      const isPDF = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
      const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47; // PNG signature
      const isJPG = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF; // JPEG signature
      
      console.log('📋 File type detection - PDF:', isPDF, 'PNG:', isPNG, 'JPG:', isJPG);
      console.log('First 8 bytes:', Array.from(bytes.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
      
      if (isPDF) {
        // It's a PDF, load and copy pages
        console.log('📄 Loading as PDF...');
        const coverPdf = await PDFDocument.load(bytes);
        const pageCount = coverPdf.getPageCount();
        console.log('PDF has', pageCount, 'page(s)');
        
        const pages = await pdfDoc.copyPages(coverPdf, coverPdf.getPageIndices());
        pages.forEach(page => pdfDoc.addPage(page));
        console.log('✅ Cover PDF added successfully, pages:', pages.length);
      } else if (isPNG || isJPG) {
        // It's an image, embed it
        console.log('🖼️ Loading as image...');
        let image;
        if (isPNG) {
          image = await pdfDoc.embedPng(bytes);
          console.log('✅ PNG image embedded');
        } else {
          image = await pdfDoc.embedJpg(bytes);
          console.log('✅ JPG image embedded');
        }
        
        // Create page with A4 dimensions
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
        const { width, height } = page.getSize();
        
        // Scale image to fit page
        const imageAspect = image.width / image.height;
        const pageAspect = width / height;
        
        let drawWidth, drawHeight, x, y;
        
        if (imageAspect > pageAspect) {
          // Image is wider
          drawWidth = width;
          drawHeight = width / imageAspect;
          x = 0;
          y = (height - drawHeight) / 2;
        } else {
          // Image is taller
          drawHeight = height;
          drawWidth = height * imageAspect;
          x = (width - drawWidth) / 2;
          y = 0;
        }
        
        page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
        console.log('✅ Cover image added to page');
      } else {
        console.error('❌ Unknown file format');
        console.error('First 16 bytes:', Array.from(bytes.slice(0, 16)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
        throw new Error('Unsupported cover file format');
      }
      
      console.log('🎉 === Cover page added successfully ===');
    } catch (error) {
      console.error('💥 Error adding cover:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      // Don't throw - continue without cover
      console.warn('⚠️ Skipping cover page due to error');
    }
  };

  // Helper function to add symbol key page
  const addSymbolKeyPage = async (pdfDoc: PDFDocument, data: ProjectData) => {
    try {
      // Use uploaded symbolKeyPDF if exists
      if (data.symbolKeyPDF) {
        console.log('Adding uploaded symbol key PDF...');
        
        // Remove data URL prefix if present and validate
        let base64Data = data.symbolKeyPDF.replace(/^data:[^;]+;base64,/, '');
        
        // Clean up base64 string - remove any whitespace
        base64Data = base64Data.trim().replace(/\s/g, '');
        
        // Validate base64 string
        if (!base64Data || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
          console.error('Invalid base64 data for symbol key');
          throw new Error('Invalid base64 encoding for symbol key');
        }
        
        // Convert to bytes with error handling
        let bytes: Uint8Array;
        try {
          const binaryString = atob(base64Data);
          bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }
        } catch (decodeError) {
          console.error('Failed to decode symbol key base64:', decodeError);
          throw new Error('Failed to decode symbol key PDF');
        }
        
        // Load PDF and copy pages
        const symbolKeyPdf = await PDFDocument.load(bytes);
        const pages = await pdfDoc.copyPages(symbolKeyPdf, symbolKeyPdf.getPageIndices());
        pages.forEach(page => pdfDoc.addPage(page));
        
        console.log('✅ Uploaded symbol key PDF added');
        return;
      }
      
      // If no uploaded PDF, generate from data (fallback)
      console.log('No uploaded symbol key PDF, generating from data...');
      // We'll create this page using jsPDF first, then import it
      const tempPdf = new jsPDF('p', 'mm', 'a4');
      
      // Title
      tempPdf.setFont('helvetica', 'bold');
      tempPdf.setFontSize(18);
      tempPdf.text(`Ключ схемы «${data.chartTitle || 'Схема'}»`, 105, 20, { align: 'center' });
      
      // Add table header
      tempPdf.setFontSize(10);
      tempPdf.setFont('helvetica', 'bold');
      let y = 35;
      const colX = [20, 45, 70, 140];
      
      tempPdf.text('№', colX[0], y);
      tempPdf.text('Символ', colX[1], y);
      tempPdf.text(`DMC`, colX[2], y);
      tempPdf.text('Название', colX[3], y);
      
      // Add line
      tempPdf.line(15, y + 2, 195, y + 2);
      
      // Add colors
      tempPdf.setFont('helvetica', 'normal');
      y += 8;
      
      const colors = data.crossStitchColors || [];
      colors.forEach((color, index) => {
        if (y > 280) {
          tempPdf.addPage();
          y = 20;
        }
        
        tempPdf.text(String(index + 1), colX[0], y);
        tempPdf.text(color.symbol || '', colX[1], y);
        tempPdf.text(color.dmc || '', colX[2], y);
        tempPdf.text(color.name || '', colX[3], y, { maxWidth: 50 });
        
        y += 6;
      });
      
      // Convert jsPDF to arrayBuffer
      const pdfArrayBuffer = tempPdf.output('arraybuffer');
      
      // Load into PDFDocument
      const tempPdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = await pdfDoc.copyPages(tempPdfDoc, tempPdfDoc.getPageIndices());
      pages.forEach(page => pdfDoc.addPage(page));
      
      console.log('✅ Symbol key page generated and added');
    } catch (error) {
      console.error('Error adding symbol key:', error);
      // Don't throw - continue without symbol key
      console.warn('Skipping symbol key page due to error');
    }
  };

  // Helper function to add thread usage page
  const addThreadUsagePage = async (pdfDoc: PDFDocument, data: ProjectData) => {
    return new Promise<void>((resolve, reject) => {
      try {
        console.log('📊 Generating thread usage page using html2canvas...');
        
        const showColorNames = data.showColorNames ?? true;
        const threadUsageMessage = data.threadUsageMessage || 'Приятной вышивки!';
        const threadUsageData = data.threadUsageData || [];
        const fontFamily = data.threadUsageFontFamily || 'Georgia, serif';
        const qrCodes = data.threadUsageQRCodes || [];
        const headerColor = data.threadUsageHeaderColor || '#8B9D83';
        
        // Helper to convert hex to RGB string
        const hexToRgbString = (hex: string): string => {
          if (hex === 'none') return 'transparent';
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          if (!result) return 'rgb(232, 240, 232)';
          return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
        };
        
        // Get translated title
        const translatedTitle = 'Расход нитей для схемы';
        
        // Create a clean temporary element specifically for PDF export
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '210mm'; // A4 width
        tempContainer.style.height = '297mm'; // A4 height
        tempContainer.style.padding = '20mm';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.fontFamily = fontFamily;
        tempContainer.style.color = 'rgb(45, 45, 45)';
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.display = 'flex';
        tempContainer.style.flexDirection = 'column';
        
        // Build the content
        const title = `${translatedTitle}<br/>«${data.coverTitle || data.chartTitle || "Название схемы"}»`;
        
        let tableHTML = `
          <div style="flex-shrink: 0; max-width: 170mm; margin: 0 auto;">
            <h2 style="
              font-family: ${fontFamily};
              font-size: 20px;
              text-align: center;
              margin: 0 0 25px 0;
              line-height: 1.4;
              color: rgb(45, 45, 45);
              font-weight: normal;
            ">${title}</h2>
            
            <table style="
              width: 100%;
              border-collapse: collapse;
              font-family: ${fontFamily};
              font-size: 15px;
              color: rgb(45, 45, 45);
            ">
              <thead>
                <tr style="background-color: ${hexToRgbString(headerColor)};">
                  <th style="
                    border: 1px solid rgb(45, 45, 45);
                    padding: 12px 8px;
                    text-align: center;
                    vertical-align: middle;
                    font-weight: bold;
                    font-size: 13px;
                    line-height: 1.4;
                    font-family: ${fontFamily};
                  ">№ п/п</th>
                  <th style="
                    border: 1px solid rgb(45, 45, 45);
                    padding: 12px 8px;
                    text-align: center;
                    vertical-align: middle;
                    font-weight: bold;
                    font-size: 13px;
                    line-height: 1.4;
                    font-family: ${fontFamily};
                  ">Номер цвета<br/>(${data.flossRange || 'DMC'})</th>
        `;
        
        if (showColorNames) {
          tableHTML += `
                  <th style="
                    border: 1px solid rgb(45, 45, 45);
                    padding: 12px 8px;
                    text-align: center;
                    vertical-align: middle;
                    font-weight: bold;
                    font-size: 13px;
                    line-height: 1.4;
                    font-family: ${fontFamily};
                  ">Наименование цвета</th>
          `;
        }
        
        tableHTML += `
                  <th style="
                    border: 1px solid rgb(45, 45, 45);
                    padding: 12px 8px;
                    text-align: center;
                    vertical-align: middle;
                    font-weight: bold;
                    font-size: 13px;
                    line-height: 1.4;
                    font-family: ${fontFamily};
                  ">Длина (м)</th>
                  <th style="
                    border: 1px solid rgb(45, 45, 45);
                    padding: 12px 8px;
                    text-align: center;
                    vertical-align: middle;
                    font-weight: bold;
                    font-size: 13px;
                    line-height: 1.4;
                    font-family: ${fontFamily};
                  ">Кол-во пасм<br/>по 1 м</th>
                  <th style="
                    border: 1px solid rgb(45, 45, 45);
                    padding: 12px 8px;
                    text-align: center;
                    vertical-align: middle;
                    font-weight: bold;
                    font-size: 13px;
                    line-height: 1.4;
                    font-family: ${fontFamily};
                  ">Кол-во<br/>мотков</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        // Add data rows
        threadUsageData.forEach((row) => {
          tableHTML += `<tr>`;
          tableHTML += `
            <td style="
              border: 1px solid rgb(45, 45, 45);
              padding: 12px 8px;
              text-align: center;
              vertical-align: middle;
              font-size: 15px;
              line-height: 1;
            ">${row.number}</td>
            <td style="
              border: 1px solid rgb(45, 45, 45);
              padding: 12px 8px;
              text-align: center;
              vertical-align: middle;
              font-weight: bold;
              font-size: 15px;
              line-height: 1;
            ">${row.colorCode}</td>
          `;
          
          if (showColorNames) {
            tableHTML += `
              <td style="
                border: 1px solid rgb(45, 45, 45);
                padding: 12px 12px;
                text-align: left;
                vertical-align: middle;
                font-size: 15px;
                line-height: 1.2;
              ">${row.colorName || '-'}</td>
            `;
          }
          
          tableHTML += `
            <td style="
              border: 1px solid rgb(45, 45, 45);
              padding: 12px 8px;
              text-align: center;
              vertical-align: middle;
              font-size: 15px;
              line-height: 1;
            ">${row.lengthMeters.toFixed(1)}</td>
            <td style="
              border: 1px solid rgb(45, 45, 45);
              padding: 12px 8px;
              text-align: center;
              vertical-align: middle;
              font-size: 15px;
              line-height: 1;
            ">${row.skeinsPerMeter}</td>
            <td style="
              border: 1px solid rgb(45, 45, 45);
              padding: 12px 8px;
              text-align: center;
              vertical-align: middle;
              font-size: 15px;
              line-height: 1;
            ">${row.totalSkeins}</td>
          </tr>`;
        });
        
        tableHTML += `
              </tbody>
            </table>
            
            <p style="
              text-align: center;
              font-style: italic;
              margin: 20px 0 0 0;
              font-size: 16px;
              font-family: ${fontFamily};
              color: rgb(45, 45, 45);
              border-top: 1px solid rgba(45, 45, 45, 0.1);
              padding-top: 15px;
            ">${threadUsageMessage}</p>
          </div>
        `;
        
        // Add QR codes with flex centering if any
        const qrCodesWithImages = qrCodes.filter(qr => qr.image);
        const qrSize = data.qrCodeSize || 80;
        // Scale up QR size for PDF to match preview appearance (compensate for html2canvas rendering)
        const pdfQrSize = Math.round(qrSize * 1.6);
        
        if (qrCodesWithImages.length > 0) {
          tableHTML += `
            <div style="
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 0;
              max-width: 170mm;
              margin: 0 auto;
            ">
              <div style="
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 15px;
              ">
          `;
          
          qrCodesWithImages.forEach((qrCode, index) => {
            tableHTML += `
              <div style="text-align: center;">
                <img 
                  src="${qrCode.image}" 
                  alt="${qrCode.name || `QR-код ${index + 1}`}"
                  style="
                    width: ${pdfQrSize}px;
                    height: ${pdfQrSize}px;
                    border: 1px solid rgba(45, 45, 45, 0.1);
                    object-fit: contain;
                    background: white;
                  "
                />
                <p style="
                  font-size: 15px;
                  color: rgb(107, 107, 107);
                  margin: 8px 0 0 0;
                  font-family: ${fontFamily};
                ">${qrCode.name || `QR-код ${index + 1}`}</p>
              </div>
            `;
          });
          
          tableHTML += `
              </div>
            </div>
          `;
        }
        
        tempContainer.innerHTML = tableHTML;
        document.body.appendChild(tempContainer);
        
        // Wait for fonts and images to load
        document.fonts.ready.then(() => {
          setTimeout(() => {
            html2canvas(tempContainer, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false,
              backgroundColor: '#ffffff',
              width: tempContainer.offsetWidth,
              height: tempContainer.offsetHeight,
            }).then(async (canvas) => {
              // Clean up
              document.body.removeChild(tempContainer);
              
              const imgData = canvas.toDataURL('image/png');
              
              // Remove data URL prefix
              const base64Data = imgData.replace(/^data:image\/png;base64,/, '');
              
              // Convert to bytes
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let j = 0; j < binaryString.length; j++) {
                bytes[j] = binaryString.charCodeAt(j);
              }
              
              // Embed PNG image
              const pngImage = await pdfDoc.embedPng(bytes);
              
              // Create A4 page
              const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
              const { width: pageWidth, height: pageHeight } = page.getSize();
              
              // Calculate image dimensions to fit A4
              const imgAspect = canvas.width / canvas.height;
              const pageAspect = pageWidth / pageHeight;
              
              let imgWidth, imgHeight, x, y;
              
              if (imgAspect > pageAspect) {
                // Image is wider
                imgWidth = pageWidth;
                imgHeight = pageWidth / imgAspect;
                x = 0;
                y = (pageHeight - imgHeight) / 2;
              } else {
                // Image is taller - fit to height
                imgHeight = pageHeight;
                imgWidth = pageHeight * imgAspect;
                x = (pageWidth - imgWidth) / 2;
                y = 0;
              }
              
              page.drawImage(pngImage, { x, y, width: imgWidth, height: imgHeight });
              
              console.log('✅ Thread usage page added via html2canvas');
              resolve();
            }).catch(error => {
              // Clean up on error
              if (tempContainer.parentNode) {
                document.body.removeChild(tempContainer);
              }
              console.error('Error with html2canvas:', error);
              reject(error);
            });
          }, 300); // Give extra time for images to load
        });
      } catch (error) {
        console.error('Error adding thread usage:', error);
        reject(error);
      }
    });
  };

  // Helper function to add chart PDF pages
  const addChartPages = async (pdfDoc: PDFDocument, chartPDFs: any[]) => {
    try {
      for (let i = 0; i < chartPDFs.length; i++) {
        const chartPdfObj = chartPDFs[i];
        const pdfBase64 = typeof chartPdfObj === 'string' ? chartPdfObj : chartPdfObj.file;
        const chartName = typeof chartPdfObj === 'object' ? chartPdfObj.name : `Chart ${i + 1}`;
        
        // Remove data URL prefix if present and validate
        let base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        
        // Clean up base64 string - remove any whitespace
        base64Data = base64Data.trim().replace(/\s/g, '');
        
        // Validate base64 string
        if (!base64Data || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
          console.error(`Invalid base64 data for chart PDF "${chartName}"`);
          console.warn(`Skipping chart PDF "${chartName}" due to invalid encoding`);
          continue;
        }
        
        // Convert base64 to ArrayBuffer with error handling
        let bytes: Uint8Array;
        try {
          const binaryString = atob(base64Data);
          bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }
        } catch (decodeError) {
          console.error(`Failed to decode chart PDF "${chartName}":`, decodeError);
          console.warn(`Skipping chart PDF "${chartName}" due to decode error`);
          continue;
        }
        
        // Load PDF
        const chartPdf = await PDFDocument.load(bytes);
        
        // Copy all pages
        const pages = await pdfDoc.copyPages(chartPdf, chartPdf.getPageIndices());
        pages.forEach(page => pdfDoc.addPage(page));
        
        console.log(`✅ Chart PDF "${chartName}" added (${pages.length} pages)`);
      }
    } catch (error) {
      console.error('Error adding chart PDFs:', error);
      // Don't throw - continue with what we have
      console.warn('Some chart PDFs may have been skipped due to errors');
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-[#2A2A2A] mb-2">
            Финальный PDF
          </h2>
          <p className="text-[#6B6B6B]">
            Создайте финальный документ
          </p>
        </div>

        {/* PDF Content Summary */}
        <div className="mt-6">
          <Card className="p-6 bg-white/70 backdrop-blur-sm border-[#2D2D2D]/10 rounded-3xl shadow-lg">
            <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
              Содержание PDF
            </h3>

            <p className="text-sm text-[#6B6B6B] mb-4">
              Выберите документы и измените порядок перетаскиванием
            </p>

            <DndProvider backend={HTML5Backend}>
              <div className="space-y-3">
                {documentsWithHandlers.map((doc, index) => (
                  <DraggableDocument
                    key={doc.id}
                    item={doc}
                    index={index}
                    moveItem={moveItem}
                  />
                ))}
              </div>
            </DndProvider>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-[#E8F0E8]/50 border border-[#8B9D83]/30 rounded-2xl">
              <div className="flex items-start gap-3">
                <GripVertical className="w-5 h-5 text-[#8B9D83] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#2D2D2D]">
                  <p className="font-medium mb-1">Как изменить порядок:</p>
                  <p className="text-xs text-[#6B6B6B]">
                    Зажмите иконку с линиями слева и перетащите документ вверх или вниз. Цифры справа показывают порядок добавления в итоговый PDF.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>

          <Button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white disabled:opacity-50"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? "Генерация PDF..." : "Скачать PDF"}
          </Button>
        </div>
      </div>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}