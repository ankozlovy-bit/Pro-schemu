import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Download, Plus, X, Maximize2, LibrarySquare, Check, Upload } from "lucide-react";
import { ProjectData, ThreadUsageRow, QRCode as QRCodeType } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import ColorPicker from "./ColorPicker";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

interface ThreadCalculatorProps {
  projectData: ProjectData;
  onThreadUsageFileUpload: (fileData: string, parsedData: ThreadUsageRow[]) => void;
  onShowColorNamesToggle: (value: boolean) => void;
  onMessageChange: (value: string) => void;
  onQRCodesChange: (qrCodes: QRCodeType[]) => void;
  onQRCodeSizeChange: (size: number) => void;
  onFontFamilyChange: (fontFamily: string) => void;
  onHeaderColorChange: (color: string) => void;
}

// Translations for thread usage title
const THREAD_USAGE_TRANSLATIONS = {
  RU: {
    title: "Расход нитей для схемы",
  },
  EN: {
    title: "Thread Consumption for Pattern",
  },
};

// Example data for testing
const EXAMPLE_DATA = `Расход длины нитей (с учетом прибавки 40%)

Номер цвета (DMC)	Нименование цвета	Общая длина (м)
14	Pale Apple Green	0.3
28	Medium Light Eggplant	0.2
29	Eggplant	0.3
742	Light tangerine	0.2
745	Banana yellow	0.3
904	Avocado green	0.7
989	Fennel green	0.4
3078	Pale yellow	0.2
3747	Pale candy blue	0.3
3815	Eucalyptus Green	0.4
3816	Snake green	4.1
3817	Polar tree green	2.4
3823	Ivory	0.5
5200	Bright white	10.5
B5200	Bright white	1.2`;

export default function ThreadCalculator({
  projectData,
  onThreadUsageFileUpload,
  onShowColorNamesToggle,
  onMessageChange,
  onQRCodesChange,
  onQRCodeSizeChange,
  onFontFamilyChange,
  onHeaderColorChange,
}: ThreadCalculatorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<string>("");
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [qrCodes, setQRCodes] = useState<QRCodeType[]>(projectData.threadUsageQRCodes || []);
  const [showQRLibrary, setShowQRLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showColorNames = projectData.showColorNames ?? true;
  const threadUsageMessage = projectData.threadUsageMessage || "Приятной вышивки!";
  const threadUsageData = projectData.threadUsageData || [];
  const selectedFont = projectData.threadUsageFontFamily || 'Georgia';
  const headerColor = projectData.threadUsageHeaderColor || 'none';
  const [noHeaderFill, setNoHeaderFill] = useState(headerColor === 'none');
  
  // Get saved QR codes from global settings
  const savedQRCodes = projectData.settings?.savedQRCodes || [];

  // Font configurations
  const fontOptions = [
    { value: 'Georgia', label: 'Georgia', style: 'Georgia, serif' },
    { value: 'Playfair Display', label: 'Playfair Display', style: '"Playfair Display", serif' },
    { value: 'Inter', label: 'Inter', style: 'Inter, sans-serif' },
  ];

  // Header color presets for table
  const headerColorPresets = [
    { name: 'Sage Green', value: '#8B9D83' },
    { name: 'Soft Terracotta', value: '#D4A89F' },
    { name: 'Light Sage', value: '#E8F0E8' },
    { name: 'Beige', value: '#E8D5C4' },
    { name: 'Soft Blue', value: '#B5C9D3' },
    { name: 'Light Gray', value: '#E5E7EB' },
    { name: 'Soft Pink', value: '#F4E7E7' },
    { name: 'Cream', value: '#F5F3EE' },
    { name: 'Lavender', value: '#E6E6FA' },
    { name: 'Mint', value: '#D4F1E8' },
    { name: 'Peach', value: '#FFE5CC' },
    { name: 'White', value: '#FFFFFF' },
  ];

  // Get the full font-family CSS value for current selection
  const fontConfig = fontOptions.find(f => f.value === selectedFont);
  const fontFamily = fontConfig ? fontConfig.style : 'Georgia, serif';

  // Sync noHeaderFill state with headerColor changes
  useEffect(() => {
    setNoHeaderFill(headerColor === 'none');
  }, [headerColor]);

  // Handle QR Codes image upload
  const handleQRUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newQRCodes = [...qrCodes];
      newQRCodes[index] = { ...newQRCodes[index], image: base64 };
      setQRCodes(newQRCodes);
      onQRCodesChange(newQRCodes);
    };
    reader.onerror = () => {
      console.error('Error reading QR file');
    };
    reader.readAsDataURL(file);
  }, [qrCodes, onQRCodesChange]);

  // Parse RTF or TXT file
  const parseThreadUsageFile = useCallback((content: string): ThreadUsageRow[] => {
    const rows: ThreadUsageRow[] = [];
    
    // NEW: Function to normalize blended color codes
    const normalizeBlendedColor = (code: string): string => {
      // Handle concatenated numbers like "3103799" → "310+3799"
      if (!code.includes('+') && /^\d{6,}$/.test(code)) {
        // Try to split into two 3-digit parts
        if (code.length === 6 || code.length === 7) {
          const firstPart = code.substring(0, 3);
          const secondPart = code.substring(3);
          const converted = `${firstPart}+${secondPart}`;
          console.log(`  🔗 Detected concatenated blend: "${code}" → "${converted}"`);
          code = converted;
        }
      }
      
      if (!code.includes('+')) return code;
      
      console.log(`  🔍 Normalizing blended color: "${code}"`);
      
      // Split by "+"
      const parts = code.split('+').map(p => p.trim()).filter(p => p);
      
      if (parts.length < 2) return code;
      
      // Normalize each part to be at least 3 digits
      const normalized = parts.map(part => {
        // If part is only 1-2 digits, pad with leading zeros to 3 digits
        if (/^\d{1,2}$/.test(part)) {
          const padded = part.padStart(3, '0');
          console.log(`    📝 Padded "${part}" → "${padded}"`);
          return padded;
        }
        return part;
      });
      
      const result = normalized.join('+');
      console.log(`  ✅ Normalized result: "${result}"`);
      return result;
    };
    
    // Clean RTF formatting if present
    let cleanContent = content;
    if (content.includes('\\rtf') || content.includes('{\\')) {
      console.log("🔧 Detected RTF format, cleaning...");
      // More aggressive RTF cleaning
      cleanContent = content
        // Remove RTF header
        .replace(/\{\\rtf[^}]*\}/gi, '')
        // Remove font table
        .replace(/\{\\fonttbl[^}]*\}/gi, '')
        // Remove color table
        .replace(/\{\\colortbl[^}]*\}/gi, '')
        // Remove stylesheet
        .replace(/\{\\stylesheet[^}]*\}/gi, '')
        // Remove other RTF control groups
        .replace(/\{\\[a-z]+[^}]*\}/gi, '')
        // Remove remaining control words
        .replace(/\\[a-z]+\d*\s?/gi, ' ')
        // Remove escaped characters
        .replace(/\\'[0-9a-f]{2}/gi, '')
        // Remove brackets
        .replace(/[{}]/g, '')
        // Normalize spaces
        .replace(/\s+/g, ' ')
        .trim();
      console.log("✨ Cleaned RTF content:", cleanContent.substring(0, 200));
    }
    
    // Split by lines
    const lines = cleanContent.split(/[\n\r]+/).filter(line => line.trim());
    
    console.log("📋 Total lines:", lines.length);
    
    let rowNumber = 1;
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const trimmedLine = lines[lineIndex].trim();
      
      console.log(`Line ${lineIndex}:`, trimmedLine);
      
      // Skip empty lines and header lines
      if (!trimmedLine || 
          trimmedLine.toLowerCase().includes('нить') || 
          trimmedLine.toLowerCase().includes('thread') ||
          trimmedLine.toLowerCase().includes('номер') ||
          trimmedLine.toLowerCase().includes('наименование') ||
          trimmedLine.toLowerCase().includes('описание') ||
          trimmedLine.toLowerCase().includes('description') ||
          trimmedLine.toLowerCase().includes('всего') ||
          trimmedLine.toLowerCase().includes('total') ||
          trimmedLine.toLowerCase().includes('длина') ||
          trimmedLine.toLowerCase().includes('расход') ||
          trimmedLine.includes('---') ||
          trimmedLine.includes('===')) {
        console.log(`  ⏭️ Skipping header line`);
        continue;
      }

      // Try different parsing strategies
      
      // Strategy 1: Tab-separated values
      let parts = trimmedLine.split('\t').filter(p => p.trim());
      console.log(`  Strategy 1 (tabs):`, parts);
      
      // Strategy 2: Multiple spaces (if tab didn't work well)
      if (parts.length < 2) {
        parts = trimmedLine.split(/\s{2,}/).filter(p => p.trim());
        console.log(`  Strategy 2 (multi-space):`, parts);
      }
      
      // Strategy 3: Single space but try to detect numbers
      if (parts.length < 2) {
        parts = trimmedLine.split(/\s+/).filter(p => p.trim());
        console.log(`  Strategy 3 (single space):`, parts);
      }
      
      if (parts.length >= 2) {
        // Extract color code (first part)
        let colorCode = parts[0].trim();
        
        // NEW: Check if it's a blended color (contains "+") and keep the "+"
        if (colorCode.includes('+')) {
          // Keep the format with "+" for blended colors
          console.log(`  🎨 Detected blended color in first column: "${colorCode}"`);
        } else {
          // If first part has only digits, keep it; otherwise try to extract digits
          if (!/^\d+$/.test(colorCode)) {
            const digitsOnly = colorCode.replace(/[^\d]/g, '');
            if (digitsOnly) {
              colorCode = digitsOnly;
            }
          }
        }
        
        // NORMALIZE: Fix incomplete blended colors (e.g., "3+3799" → "310+3799")
        colorCode = normalizeBlendedColor(colorCode);
        
        let colorName = '';
        let lengthMeters = 0;

        // NEW STRATEGY: Find ALL numbers in the ENTIRE original line, take the LAST one
        const allNumbersInLine: number[] = [];
        const numberRegex = /\d+[.,]?\d*/g;
        let match;
        
        while ((match = numberRegex.exec(trimmedLine)) !== null) {
          const numStr = match[0].replace(',', '.');
          const num = parseFloat(numStr);
          if (!isNaN(num) && num > 0) {
            allNumbersInLine.push(num);
          }
        }
        
        console.log(`  📊 All numbers found in line: [${allNumbersInLine.join(', ')}]`);

        // Extract color name from text parts (everything between color code and numbers)
        const textParts: string[] = [];
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim();
          // Only add text parts (non-numeric)
          if (part.length > 0 && !/^[\d.,\s]+$/.test(part)) {
            textParts.push(part);
          }
        }

        // Color name is all the text parts
        colorName = textParts.join(' ').trim();
        
        // Length is the LAST number found in the entire original line
        if (allNumbersInLine.length > 0) {
          // Take the LAST number from the original line (this should be the "Всего" column)
          lengthMeters = allNumbersInLine[allNumbersInLine.length - 1];
          console.log(`  ✅ Taking LAST number as length: ${lengthMeters}`);
        }

        console.log(`  ✓ Parsed: code=${colorCode}, name="${colorName}", length=${lengthMeters}`);

        if (colorCode && lengthMeters > 0) {
          const skeinsPerMeter = Math.ceil(lengthMeters);
          const totalSkeins = Math.ceil(lengthMeters / 8);

          rows.push({
            number: rowNumber++,
            colorCode,
            colorName: colorName || undefined,
            lengthMeters,
            skeinsPerMeter,
            totalSkeins,
          });
          
          console.log(`  ✅ Added row #${rowNumber - 1}`);
        } else {
          console.log(`  ❌ Skipped: invalid data (code=${colorCode}, length=${lengthMeters})`);
        }
      } else {
        console.log(`  ❌ Skipped: too few parts (${parts.length})`);
      }
    }

    console.log(`\n📊 Total rows parsed: ${rows.length}`);
    
    // Group by color code and sum lengths for duplicate colors
    const groupedMap = new Map<string, ThreadUsageRow>();
    
    rows.forEach((row) => {
      const existing = groupedMap.get(row.colorCode);
      
      if (existing) {
        // Sum the lengths for duplicate color codes
        console.log(`  🔗 Merging duplicate color ${row.colorCode}: ${existing.lengthMeters} + ${row.lengthMeters}`);
        existing.lengthMeters += row.lengthMeters;
        existing.skeinsPerMeter = Math.ceil(existing.lengthMeters);
        existing.totalSkeins = Math.ceil(existing.lengthMeters / 8);
      } else {
        // Add new color
        groupedMap.set(row.colorCode, { ...row });
      }
    });
    
    // Process colors with "+" (blended colors) - split length between component colors
    const blendedColors: string[] = [];
    groupedMap.forEach((row, colorCode) => {
      if (colorCode.includes('+')) {
        blendedColors.push(colorCode);
      }
    });
    
    // Helper function to round up numbers ending in .05
    const roundUpIfNeeded = (value: number): number => {
      // Check if the number ends in .05 (within floating point precision)
      const decimalPart = value - Math.floor(value);
      const isPointZeroFive = Math.abs(decimalPart - 0.05) < 0.001;
      
      if (isPointZeroFive) {
        const rounded = Math.ceil(value * 10) / 10;
        console.log(`    🔄 Rounded ${value.toFixed(2)} → ${rounded.toFixed(1)} (ends in .05)`);
        return rounded;
      }
      return value;
    };
    
    blendedColors.forEach((blendedCode) => {
      const row = groupedMap.get(blendedCode);
      if (!row) return;
      
      // Split by "+"
      const colorParts = blendedCode.split('+').map(c => c.trim()).filter(c => c);
      
      if (colorParts.length >= 2) {
        console.log(`🔀 Splitting blended color "${blendedCode}" (${row.lengthMeters}m) between first 2 colors`);
        
        // ALWAYS divide length by 2 (not by the number of colors)
        let lengthPerColor = row.lengthMeters / 2;
        
        // Round up if ends in .05
        lengthPerColor = roundUpIfNeeded(lengthPerColor);
        
        console.log(`  ➗ Length per component: ${lengthPerColor}m each`);
        
        // Take only the FIRST TWO colors from the list  
        const firstTwoColors = colorParts.slice(0, 2);
        
        // Add half to each of the first two component colors
        firstTwoColors.forEach((colorCode) => {
          const existing = groupedMap.get(colorCode);
          
          if (existing) {
            existing.lengthMeters += lengthPerColor;
            existing.skeinsPerMeter = Math.ceil(existing.lengthMeters);
            existing.totalSkeins = Math.ceil(existing.lengthMeters / 8);
          } else {
            groupedMap.set(colorCode, {
              number: 0,
              colorCode: colorCode,
              colorName: row.colorName,
              lengthMeters: lengthPerColor,
              skeinsPerMeter: Math.ceil(lengthPerColor),
              totalSkeins: Math.ceil(lengthPerColor / 8),
            });
          }
        });
        
        // Remove the blended color entry so it won't appear in the final table
        console.log(`  🗑️ Removing blended color entry "${blendedCode}" from table`);
        groupedMap.delete(blendedCode);
      }
    });
    
    // Convert map to array
    let finalRows = Array.from(groupedMap.values());
    
    // Sort by color code: numbers first (ascending), then letters (ascending)
    finalRows.sort((a, b) => {
      const codeA = a.colorCode;
      const codeB = b.colorCode;
      
      // Check if codes start with a letter
      const aStartsWithLetter = /^[A-Za-z]/.test(codeA);
      const bStartsWithLetter = /^[A-Za-z]/.test(codeB);
      
      // Numbers come before letters
      if (!aStartsWithLetter && bStartsWithLetter) return -1;
      if (aStartsWithLetter && !bStartsWithLetter) return 1;
      
      // Both are numbers or both start with letters - natural sort
      // Extract leading letters and numbers separately for proper sorting
      const extractParts = (code: string) => {
        const match = code.match(/^([A-Za-z]*)(\d+)(.*)$/);
        if (match) {
          return {
            letters: match[1].toUpperCase(),
            number: parseInt(match[2], 10),
            rest: match[3],
          };
        }
        // Fallback: just letters
        return {
          letters: code.toUpperCase(),
          number: 0,
          rest: '',
        };
      };
      
      const partsA = extractParts(codeA);
      const partsB = extractParts(codeB);
      
      // Compare letters first
      if (partsA.letters !== partsB.letters) {
        return partsA.letters.localeCompare(partsB.letters);
      }
      
      // Then compare numbers
      if (partsA.number !== partsB.number) {
        return partsA.number - partsB.number;
      }
      
      // Finally compare the rest
      return partsA.rest.localeCompare(partsB.rest);
    });
    
    console.log(`  🔢 Sorted color codes: ${finalRows.map(r => r.colorCode).join(', ')}`);
    
    // Renumber rows after sorting
    finalRows = finalRows.map((row, index) => ({
      ...row,
      number: index + 1,
    }));
    
    console.log(`✅ Final rows after grouping, splitting, and sorting: ${finalRows.length}`);
    return finalRows;
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const content = await file.text();
        console.log("📄 File content:", content.substring(0, 500)); // Debug: первые 500 символов
        
        // Save preview
        setFilePreview(content);
        
        const parsedData = parseThreadUsageFile(content);
        console.log("✅ Parsed data:", parsedData); // Debug: распарсенные данные
        
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          onThreadUsageFileUpload(base64, parsedData);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("❌ Error parsing thread usage file:", error);
      }
    },
    [parseThreadUsageFile, onThreadUsageFileUpload]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const file = files.find((f) => f.name.endsWith('.txt') || f.name.endsWith('.rtf'));

      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const exportPDF = useCallback(() => {
    // Get translated title
    const translatedTitle = THREAD_USAGE_TRANSLATIONS[projectData.language || 'RU'].title;
    
    // Helper function to convert HEX to RGB
    const hexToRgb = (hex: string): string => {
      if (hex === 'none') return '';
      // Remove # if present
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    // Determine header background style
    const headerBgStyle = headerColor === 'none' 
      ? '' 
      : `background-color: ${hexToRgb(headerColor)};`;
    
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
    const title = `${translatedTitle}<br/>«${projectData.coverTitle || projectData.chartTitle || "Название схемы"}»`;
    
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
            <tr style="${headerBgStyle}">
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
              ">Номер цвета<br/>(${projectData.flossRange || 'DMC'})</th>
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
    const qrSize = projectData.qrCodeSize || 80;
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
        }).then(canvas => {
          // Clean up
          document.body.removeChild(tempContainer);
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Calculate image dimensions to fit A4
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
          
          // If image is taller than A4, scale it down
          if (imgHeight > pdfHeight) {
            const scaledWidth = (pdfHeight * canvas.width) / canvas.height;
            const xOffset = (pdfWidth - scaledWidth) / 2;
            pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, pdfHeight);
          } else {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          }
          
          pdf.save('thread-usage.pdf');
        }).catch(error => {
          // Clean up on error
          if (tempContainer.parentNode) {
            document.body.removeChild(tempContainer);
          }
          console.error('Error generating PDF:', error);
        });
      }, 300); // Give extra time for images to load
    });
  }, [threadUsageData, projectData, showColorNames, threadUsageMessage, qrCodes, fontFamily, headerColor]);

  const exportExcel = useCallback(() => {
    // Get translated title
    const translatedTitle = THREAD_USAGE_TRANSLATIONS[projectData.language || 'RU'].title;
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Title row
    const title = `${translatedTitle} «${projectData.coverTitle || projectData.chartTitle || "Название схемы"}»`;
    
    // Create data array with title
    const dataArray: any[][] = [
      [title], // Title row
      [], // Empty row
    ];
    
    // Header row
    const headers = ['№ п/п', `Номер цвета (${projectData.flossRange || 'DMC'})`];
    if (showColorNames) {
      headers.push('Наименование цвета');
    }
    headers.push('Длина (м)', 'Кол-во пасм по 1 м', 'Кол-во мотков');
    dataArray.push(headers);
    
    // Data rows
    threadUsageData.forEach(row => {
      const rowData: any[] = [
        row.number,
        row.colorCode,
      ];
      if (showColorNames) {
        rowData.push(row.colorName || '-');
      }
      rowData.push(
        parseFloat(row.lengthMeters.toFixed(1)),
        row.skeinsPerMeter,
        row.totalSkeins
      );
      dataArray.push(rowData);
    });
    
    // Empty row
    dataArray.push([]);
    
    // Message row if exists
    if (threadUsageMessage) {
      dataArray.push([threadUsageMessage]);
    }
    
    // Create worksheet from array
    const worksheet = XLSX.utils.aoa_to_sheet(dataArray);
    
    // Set column widths
    const columnCount = headers.length;
    const colWidths = [
      { wch: 8 },  // № п/п
      { wch: 15 }, // Номер цвета
    ];
    if (showColorNames) {
      colWidths.push({ wch: 30 }); // Наименование цвета
    }
    colWidths.push(
      { wch: 12 }, // Длина
      { wch: 18 }, // Кол-во пасм
      { wch: 15 }  // Кол-во мотков
    );
    worksheet['!cols'] = colWidths;
    
    // Merge cells for title
    const titleMerge = { s: { r: 0, c: 0 }, e: { r: 0, c: columnCount - 1 } };
    worksheet['!merges'] = [titleMerge];
    
    // If message exists, merge those cells too
    if (threadUsageMessage) {
      const messageRowIndex = dataArray.length - 1;
      worksheet['!merges'].push({
        s: { r: messageRowIndex, c: 0 },
        e: { r: messageRowIndex, c: columnCount - 1 }
      });
    }
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Расход нитей');
    
    // Write file
    XLSX.writeFile(workbook, 'thread-usage.xlsx');
  }, [threadUsageData, projectData, showColorNames, threadUsageMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F0E8] via-[#FCFAF9] to-[#F4E7E7] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Расход нитей
          </h2>
          <p className="text-[#6B6B6B]">
            Загрузите файл с данными о расходе нитей и настройте отображение таблицы
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Left Panel - Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-[#2D2D2D]/10 rounded-3xl shadow-lg">
              <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Настройки таблицы
              </h3>

              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <Label>Загрузить файл (TXT)</Label>
                  <div className="text-xs text-[#6B6B6B] mt-1 mb-2 space-y-1">
                  </div>
                  <div
                    className={`mt-2 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                      threadUsageData.length > 0
                        ? "border-[#8B9D83] bg-[#E8F0E8] cursor-default"
                        : isDragging
                        ? "border-[#2D2D2D] bg-[#E8F0E8]/50"
                        : "border-[#2D2D2D]/20 hover:border-[#2D2D2D]/40"
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => threadUsageData.length === 0 && fileInputRef.current?.click()}
                  >
                    {threadUsageData.length > 0 ? (
                      <>
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#8B9D83] flex items-center justify-center">
                          <Check className="w-7 h-7 text-white" />
                        </div>
                        <p className="text-lg font-medium text-[#8B9D83] mb-1">
                          Файл успешно загружен
                        </p>
                        <p className="text-sm text-[#6B7B65]">
                          Загружено {threadUsageData.length} цветов
                        </p>
                      </>
                    ) : (
                      <>
                        <FileText className="w-12 h-12 mx-auto mb-3 text-[#2D2D2D]/40" />
                        <p className="text-sm text-[#2D2D2D]/60">
                          Перетащите файл сюда или нажмите для выбора
                        </p>
                        <p className="text-xs text-[#6B6B6B] mt-1">
                          Поддерживается формат TXT
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>

                {/* Show Color Names Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#E8F0E8]/30 rounded-2xl">
                  <div>
                    <Label>Показать наименования цветов</Label>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Включить/выключить столбец с названиями
                    </p>
                  </div>
                  <Switch
                    checked={showColorNames}
                    onCheckedChange={onShowColorNamesToggle}
                  />
                </div>

                {/* Custom Message */}
                <div>
                  <Label htmlFor="thread-message">Сообщение под таблицей</Label>
                  <Input
                    id="thread-message"
                    value={threadUsageMessage}
                    onChange={(e) => onMessageChange(e.target.value)}
                    className="mt-2 bg-[#E8F0E8]/30 border-[#2D2D2D]/20 rounded-2xl"
                    placeholder="Приятной вышивки!"
                  />
                </div>

                {/* Font and Header Color Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Font Selector */}
                  <div>
                    <Label htmlFor="font-selector" className="text-sm mb-2 block">Шрифт таблицы</Label>
                    <select
                      id="font-selector"
                      value={selectedFont}
                      onChange={(e) => onFontFamilyChange(e.target.value)}
                      className="w-full h-11 px-3 bg-[#E8F0E8]/30 border-2 border-[#2D2D2D]/20 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D2D2D]/20 cursor-pointer"
                    >
                      {fontOptions.map(font => (
                        <option 
                          key={font.value} 
                          value={font.value}
                          style={{ fontFamily: font.style }}
                        >
                          {font.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-[#6B6B6B] mt-2">
                      Выберите шрифт для заголовков и текста в таблице
                    </p>
                  </div>

                  {/* Header Color Selector */}
                  <div>
                    <ColorPicker
                      label="Цвет заливки шапки"
                      value={noHeaderFill ? '#8B9D83' : headerColor}
                      onChange={(color) => {
                        if (!noHeaderFill) {
                          onHeaderColorChange(color);
                        }
                      }}
                      presetColors={headerColorPresets}
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="no-header-fill"
                        checked={noHeaderFill}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          setNoHeaderFill(isChecked);
                          onHeaderColorChange(isChecked ? 'none' : '#8B9D83');
                        }}
                      />
                      <Label 
                        htmlFor="no-header-fill" 
                        className="text-xs text-[#6B6B6B] cursor-pointer"
                      >
                        Без заливки
                      </Label>
                    </div>
                  </div>
                </div>


                {threadUsageData.length === 0 && filePreview && (
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs font-medium text-amber-900 mb-2">
                        ⚠️ Файл загружен, но данные не распознаны.
                      </p>
                      <Button
                        onClick={() => setShowFilePreview(!showFilePreview)}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        {showFilePreview ? "Скрыть" : "Показать"} содержимое файла
                      </Button>
                    </div>
                    
                    {showFilePreview && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-64 overflow-auto">
                        <p className="text-xs font-mono whitespace-pre-wrap break-all text-gray-700">
                          {filePreview.substring(0, 1000)}
                          {filePreview.length > 1000 && "..."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* QR Codes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-[#2D2D2D]">QR-коды (опционально)</h4>
                  
                  {qrCodes.map((qrCode, index) => (
                    <div key={qrCode.id} className="p-4 bg-[#E8F0E8]/20 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">QR-код {index + 1}</Label>
                        <Button
                          onClick={() => {
                            const newQRCodes = qrCodes.filter((_, i) => i !== index);
                            setQRCodes(newQRCodes);
                            onQRCodesChange(newQRCodes);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Label htmlFor={`qr-name-${index}`} className="text-xs">Название</Label>
                        <Input
                          id={`qr-name-${index}`}
                          value={qrCode.name}
                          onChange={(e) => {
                            const newQRCodes = [...qrCodes];
                            newQRCodes[index] = { ...newQRCodes[index], name: e.target.value };
                            setQRCodes(newQRCodes);
                            onQRCodesChange(newQRCodes);
                          }}
                          className="mt-1 bg-white border-[#2D2D2D]/20 rounded-xl text-sm"
                          placeholder="Группа ВК, Telegram, и т.д."
                        />
                      </div>

                      <div>
                        <Label htmlFor={`qr-image-${index}`} className="text-xs">Изображение QR-кода</Label>
                        <Input
                          id={`qr-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleQRUpload(e, index)}
                          className="mt-1 bg-white border-[#2D2D2D]/20 rounded-xl text-sm"
                        />
                      </div>

                      {qrCode.image && (
                        <div className="flex items-center gap-2 pt-2">
                          <img
                            src={qrCode.image}
                            alt={qrCode.name || `QR ${index + 1}`}
                            className="w-16 h-16 border border-[#2D2D2D]/10 object-contain bg-white"
                          />
                          <span className="text-xs text-[#6B6B6B]">✓ Загружено</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    onClick={() => {
                      const newQRCode: QRCodeType = {
                        id: `qr-${Date.now()}`,
                        name: qrCodes.length === 0 ? 'Файл Saga' : '',
                        image: '',
                      };
                      const newQRCodes = [...qrCodes, newQRCode];
                      setQRCodes(newQRCodes);
                      onQRCodesChange(newQRCodes);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить QR-код
                  </Button>

                  {/* Button to select from library */}
                  <Button
                    onClick={() => setShowQRLibrary(true)}
                    variant="outline"
                    size="sm"
                    className="w-full border-[#8B9D83]/30 hover:bg-[#E8F0E8]/50 bg-gradient-to-r from-[#E8F0E8]/30 to-[#F4E7E7]/30"
                  >
                    <LibrarySquare className="w-4 h-4 mr-2" />
                    Выбрать из библиотеки
                    {savedQRCodes.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-[#8B9D83] text-white text-xs rounded-full">
                        {savedQRCodes.filter(s => s.image).length}
                      </span>
                    )}
                  </Button>

                  {/* QR Code Size Slider */}
                  {qrCodes.some(qr => qr.image) && (
                    <div className="pt-4 border-t border-[#2D2D2D]/10">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="flex items-center gap-2">
                          <Maximize2 className="w-4 h-4" />
                          Размер QR-кодов
                        </Label>
                        <span className="text-sm text-[#6B6B6B]">{projectData.qrCodeSize || 80}px</span>
                      </div>
                      <Slider
                        value={[projectData.qrCodeSize || 80]}
                        onValueChange={(value) => onQRCodeSizeChange(value[0])}
                        min={60}
                        max={150}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-[#6B6B6B] mt-1">
                        <span>Малый</span>
                        <span>Большой</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Panel - Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/70 backdrop-blur-sm border-[#2D2D2D]/10 rounded-3xl shadow-lg">
              <h3 className="text-lg font-medium mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Предпросмотр таблицы
              </h3>

              {/* A4 Preview Container with scroll */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-inner border border-[#2D2D2D]/10 max-h-[70vh] overflow-y-auto">
                <div id="thread-preview" className="p-4 sm:p-6 md:p-8 w-full max-w-full mx-auto flex flex-col">
                  {/* Title */}
                  <h2 
                    className="text-sm sm:text-base md:text-lg text-center leading-tight mb-3 sm:mb-4" 
                    style={{ fontFamily: fontFamily }}
                  >
                    {THREAD_USAGE_TRANSLATIONS[projectData.language || 'RU'].title}<br />
                    «{projectData.coverTitle || projectData.chartTitle || "Название схемы"}»
                  </h2>

                  {/* Table */}
                  {threadUsageData.length > 0 ? (
                    <div className="overflow-x-auto flex-shrink-0 -mx-2 sm:mx-0">
                      <div className="inline-block min-w-full px-2 sm:px-0">
                        <table className="w-full border-collapse border border-[#2D2D2D]/30 text-[10px] sm:text-xs" style={{ fontFamily: fontFamily }}>
                      <thead>
                        <tr style={{ backgroundColor: headerColor === 'none' ? 'transparent' : headerColor }}>
                          <th className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-[9px] sm:text-[10px] whitespace-nowrap">
                            № п/п
                          </th>
                          <th className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-[9px] sm:text-[10px] whitespace-nowrap">
                            Номер цвета<br />({projectData.flossRange || "DMC"})
                          </th>
                          {showColorNames && (
                            <th className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-[9px] sm:text-[10px] whitespace-nowrap">
                              Наименование цвета
                            </th>
                          )}
                          <th className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-[9px] sm:text-[10px] whitespace-nowrap">
                            Длина (м)
                          </th>
                          <th className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-[9px] sm:text-[10px] whitespace-nowrap">
                            Кол-во пасм<br />по 1 м
                          </th>
                          <th className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-[9px] sm:text-[10px] whitespace-nowrap">
                            Кол-во<br />мотков
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {threadUsageData.map((row) => (
                          <tr key={row.number} className="hover:bg-[#E8F0E8]/20 transition-colors">
                            <td className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-center text-[9px] sm:text-[10px]">
                              {row.number}
                            </td>
                            <td className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-center font-medium text-[9px] sm:text-[10px]">
                              {row.colorCode}
                            </td>
                            {showColorNames && (
                              <td className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-[9px] sm:text-[10px]">
                                {row.colorName || "-"}
                              </td>
                            )}
                            <td className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-center text-[9px] sm:text-[10px]">
                              {row.lengthMeters.toFixed(1)}
                            </td>
                            <td className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-center text-[9px] sm:text-[10px]">
                              {row.skeinsPerMeter}
                            </td>
                            <td className="border border-[#2D2D2D]/30 p-1 sm:p-1.5 text-center text-[9px] sm:text-[10px]">
                              {row.totalSkeins}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-[#6B6B6B]">
                      <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Загрузите файл для отображения таблицы</p>
                    </div>
                  )}

                {/* Message */}
                {threadUsageData.length > 0 && (
                  <div className="text-center pt-2 sm:pt-3 border-t border-[#2D2D2D]/10 mt-3 sm:mt-4 flex-shrink-0">
                    <p 
                      className="text-sm sm:text-base italic" 
                      style={{ fontFamily: fontFamily }}
                    >
                      {threadUsageMessage}
                    </p>
                  </div>
                )}

                {/* QR Codes - Centered in remaining space */}
                {threadUsageData.length > 0 && qrCodes.some(qr => qr.image) && (
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                      {qrCodes.map((qrCode, index) => (
                        qrCode.image && (
                          <div key={qrCode.id} className="text-center">
                            <img
                              src={qrCode.image}
                              alt={qrCode.name || `QR-код ${index + 1}`}
                              style={{
                                width: `${projectData.qrCodeSize || 80}px`,
                                height: `${projectData.qrCodeSize || 80}px`,
                              }}
                              className="border border-[#2D2D2D]/10 object-contain bg-white mx-auto"
                            />
                            <p className="text-[9px] sm:text-[10px] text-[#6B6B6B] mt-1.5">
                              {qrCode.name || `QR-код ${index + 1}`}
                            </p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>

              <p className="text-xs text-center text-[#6B6B6B] mt-2">
                Формат A4 (210 × 297 мм)
              </p>

              {/* Export Buttons */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  onClick={exportPDF}
                  variant="outline"
                  size="sm"
                  className="border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button
                  onClick={exportExcel}
                  variant="outline"
                  size="sm"
                  className="border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Excel
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* QR Library Modal */}
      {showQRLibrary && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-[#2D2D2D]/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQRLibrary(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowQRLibrary(false)}>
            <motion.div
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#E8F0E8] to-[#F4E7E7] p-6 border-b border-[#2D2D2D]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#2D2D2D] flex items-center justify-center">
                      <LibrarySquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-serif text-[#2D2D2D]">Библиотека QR-кодов</h2>
                      <p className="text-sm text-[#6B6B6B]">Выберите QR-коды для добавления</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQRLibrary(false)}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {savedQRCodes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedQRCodes.map((savedQR) => {
                      const isAdded = qrCodes.some(qr => qr.name === savedQR.name && qr.image === savedQR.image);
                      
                      return (
                        <Card
                          key={savedQR.id}
                          className={`p-4 cursor-pointer transition-all border-2 ${
                            isAdded
                              ? 'bg-gradient-to-br from-[#E8F0E8] to-[#F4E7E7] border-[#8B9D83]'
                              : 'bg-white hover:bg-[#E8F0E8]/20 border-[#2D2D2D]/10 hover:border-[#8B9D83]/40'
                          }`}
                          onClick={() => {
                            if (!savedQR.image) {
                              alert('Сначала загрузите изображение для этого QR-кода в Настройках');
                              return;
                            }
                            
                            if (isAdded) {
                              const newQRCodes = qrCodes.filter(qr => !(qr.name === savedQR.name && qr.image === savedQR.image));
                              setQRCodes(newQRCodes);
                              onQRCodesChange(newQRCodes);
                            } else {
                              const newQRCode: QRCodeType = {
                                id: `qr-${Date.now()}-${Math.random()}`,
                                name: savedQR.name,
                                image: savedQR.image,
                              };
                              const newQRCodes = [...qrCodes, newQRCode];
                              setQRCodes(newQRCodes);
                              onQRCodesChange(newQRCodes);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-lg bg-[#E8F0E8]/20 border border-[#2D2D2D]/10 overflow-hidden flex-shrink-0">
                              {savedQR.image && savedQR.image.trim() !== '' ? (
                                <img src={savedQR.image} alt={savedQR.name} className="w-full h-full object-contain p-1" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Upload className="w-5 h-5 text-[#6B6B6B]" />
                                </div>
                              )}
                              {isAdded && (
                                <div className="absolute inset-0 bg-[#8B9D83]/90 flex items-center justify-center">
                                  <Check className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <h3 className="font-medium text-sm text-[#2D2D2D]">{savedQR.name}</h3>
                              {savedQR.isPreset && (
                                <p className="text-xs text-[#6B6B6B] mt-0.5">Предустановленный</p>
                              )}
                              {!savedQR.image && (
                                <p className="text-xs text-amber-600 mt-0.5">Изображение не загружено</p>
                              )}
                            </div>

                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isAdded 
                                ? 'bg-[#8B9D83] border-[#8B9D83]' 
                                : 'bg-white border-[#2D2D2D]/20'
                            }`}>
                              {isAdded && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#6B6B6B]">
                    <LibrarySquare className="w-16 h-16 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Библиотека QR-кодов пуста</p>
                    <p className="text-xs mt-2">Добавьте QR-коды в Настройках</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 p-4 border-t border-[#2D2D2D]/10 bg-[#FCFAF9]">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-[#6B6B6B]">
                    Выбрано: {qrCodes.filter(qr => savedQRCodes.some(s => s.name === qr.name && s.image === qr.image)).length} из {savedQRCodes.filter(s => s.image).length}
                  </p>
                  <Button
                    onClick={() => setShowQRLibrary(false)}
                    className="rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
                  >
                    Готово
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}