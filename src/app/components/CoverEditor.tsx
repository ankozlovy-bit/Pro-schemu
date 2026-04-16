import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Upload, Image as ImageIcon, Palette, Type, Wand2, Maximize2, RotateCcw } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { ProjectData } from "../types";
import ColorPicker from "./ColorPicker";
import { 
  COVER_TRANSLATIONS, 
  getColorPlural, 
  COVER_LANGUAGE_NAMES, 
  COVER_LANGUAGE_FLAGS,
  type CoverLanguage 
} from "../utils/coverTranslations";

interface CoverEditorProps {
  title: string;
  subtitle: string;
  designer: string;
  backgroundColor: string;
  textColor: string;
  coverImage?: string;
  coverPreviewImage?: string;
  coverPreviewSize?: number;
  projectData: ProjectData;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onDesignerChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onImageUpload: (imageData: string) => void;
  onPreviewImageUpload: (imageData: string) => void;
  onPreviewSizeChange: (value: number) => void;
  onUndo: () => void;
  onCoverColorChange?: (titleColor: string, otherColor: string) => void;
  onCornerStyleChange?: (style: 'rounded' | 'sharp') => void;
  onCoverLanguageChange?: (language: CoverLanguage) => void;
}

// ELEGANT COVER TYPOGRAPHY - Professionally designed
const COVER_FONTS = {
  title: 'Georgia, "Times New Roman", serif',
  titleSize: '36px',
  titleWeight: '500',
  other: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  otherSize: '15px',
  otherWeight: '400',
  labelSize: '11px',
  labelWeight: '300',
  labelSpacing: '0.2em',
};

export default function CoverEditor({
  title,
  subtitle,
  designer,
  backgroundColor,
  textColor,
  coverImage,
  coverPreviewImage,
  coverPreviewSize = 70,
  projectData,
  onTitleChange,
  onSubtitleChange,
  onDesignerChange,
  onBackgroundColorChange,
  onTextColorChange,
  onImageUpload,
  onPreviewImageUpload,
  onPreviewSizeChange,
  onUndo,
  onCoverColorChange,
  onCornerStyleChange,
  onCoverLanguageChange,
}: CoverEditorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewDragging, setIsPreviewDragging] = useState(false);
  const [localPreviewSize, setLocalPreviewSize] = useState(coverPreviewSize);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewFileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number>();
  
  // Refs for direct DOM manipulation (elegant typography)
  const coverLabelRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const designerRef = useRef<HTMLParagraphElement>(null);
  
  // Local state for color settings only (fonts are fixed)
  const [localTitleColor, setLocalTitleColor] = useState(projectData.coverTitleColor || textColor);
  const [localOtherColor, setLocalOtherColor] = useState(projectData.coverOtherColor || textColor);

  // Get current language translations
  const coverLanguage = (projectData.coverLanguage || 'ru') as CoverLanguage;
  const t = COVER_TRANSLATIONS[coverLanguage];
  
  // Get corner style from projectData
  const cornerStyle = projectData.cornerStyle || 'rounded';
  const borderRadius = cornerStyle === 'sharp' ? '0' : '1.5rem'; // 24px rounded or 0 for sharp

  // Sync local state with projectData changes
  useEffect(() => {
    setLocalTitleColor(projectData.coverTitleColor || textColor);
    setLocalOtherColor(projectData.coverOtherColor || textColor);
  }, [projectData.coverTitleColor, projectData.coverOtherColor, textColor]);

  // For preview rendering - use projectData values directly for reliability
  const previewTitleColor = projectData.coverTitleColor || localTitleColor || textColor;
  const previewOtherColor = projectData.coverOtherColor || localOtherColor || textColor;

  // Debug logging
  useEffect(() => {
    console.log('🎨 CoverEditor Font Debug:', {
      'projectData.coverTitleColor': projectData.coverTitleColor,
      'projectData.coverOtherColor': projectData.coverOtherColor,
      'previewTitleColor': previewTitleColor,
      'previewOtherColor': previewOtherColor,
    });
  }, [projectData.coverTitleColor, projectData.coverOtherColor, previewTitleColor, previewOtherColor]);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalPreviewSize(coverPreviewSize);
  }, [coverPreviewSize]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Apply fonts directly to DOM elements to override CSS
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.fontFamily = COVER_FONTS.title;
      titleRef.current.style.fontSize = COVER_FONTS.titleSize;
      titleRef.current.style.fontWeight = COVER_FONTS.titleWeight;
      titleRef.current.style.color = previewTitleColor;
      console.log('🔧 Direct DOM update - Title:', titleRef.current.style.fontFamily);
    }
    if (coverLabelRef.current) {
      coverLabelRef.current.style.fontFamily = COVER_FONTS.other;
      coverLabelRef.current.style.fontSize = COVER_FONTS.labelSize;
      coverLabelRef.current.style.fontWeight = COVER_FONTS.labelWeight;
      coverLabelRef.current.style.letterSpacing = COVER_FONTS.labelSpacing;
      coverLabelRef.current.style.color = previewOtherColor;
    }
    if (designerRef.current) {
      designerRef.current.style.fontFamily = COVER_FONTS.other;
      designerRef.current.style.fontSize = COVER_FONTS.otherSize;
      designerRef.current.style.fontWeight = COVER_FONTS.otherWeight;
      designerRef.current.style.color = previewOtherColor;
    }
  }, [previewTitleColor, previewOtherColor]);

  const chartInfo = useMemo(() => {
    const stitchesWidth = projectData.chartWidth || 0;
    const stitchesHeight = projectData.chartHeight || 0;
    const fabricCount = projectData.coverFabricCount || 14;
    const threadCount = projectData.threadCount || 2;
    const effectiveCount = fabricCount / threadCount;
    const widthCm = ((stitchesWidth / effectiveCount) * 2.54).toFixed(1);
    const heightCm = ((stitchesHeight / effectiveCount) * 2.54).toFixed(1);
    // Use colorCount from projectData, fallback to crossStitchColors length
    const colorCount = projectData.colorCount || projectData.crossStitchColors?.length || 0;
    const flossRange = projectData.flossRange || "DMC";

    return {
      stitchesWidth,
      stitchesHeight,
      widthCm,
      heightCm,
      colorCount,
      flossRange,
      fabricCount,
      effectiveCount,
    };
  }, [projectData]);

  // Calculate dynamic font size based on title length
  const getTitleClasses = useMemo(() => {
    const titleLength = (title || "Название схемы").length;
    
    if (titleLength <= 20) {
      return "text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight";
    } else if (titleLength <= 35) {
      return "text-xl sm:text-2xl lg:text-3xl tracking-tight leading-tight";
    } else if (titleLength <= 50) {
      return "text-lg sm:text-xl lg:text-2xl tracking-tight leading-tight";
    } else {
      return "text-base sm:text-lg lg:text-xl tracking-tight leading-tight";
    }
  }, [title]);

  // Calculate dynamic font size for subtitle
  const getSubtitleClasses = useMemo(() => {
    if (!subtitle) return "text-sm sm:text-base mt-2";
    
    const subtitleLength = subtitle.length;
    
    if (subtitleLength <= 30) {
      return "text-sm sm:text-base mt-2";
    } else if (subtitleLength <= 50) {
      return "text-xs sm:text-sm mt-2";
    } else {
      return "text-xs mt-2";
    }
  }, [subtitle]);

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
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            onImageUpload(reader.result);
          }
        };
        reader.readAsDataURL(imageFile);
      }
    },
    [onImageUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            onImageUpload(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const handlePreviewDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewDragging(true);
  }, []);

  const handlePreviewDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewDragging(false);
  }, []);

  const handlePreviewDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handlePreviewDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsPreviewDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith("image/"));

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            onPreviewImageUpload(reader.result);
          }
        };
        reader.readAsDataURL(imageFile);
      }
    },
    [onPreviewImageUpload]
  );

  const handlePreviewFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            onPreviewImageUpload(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    },
    [onPreviewImageUpload]
  );

  // Helper to check if color is light (for border visibility)
  const isLightColor = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 200;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Editor Controls - ULTRA COMPACT */}
      <div className="space-y-2.5">
        {/* Header with Undo */}
        <div className="flex items-center justify-between">
          <Label className="text-base flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Настройки обложки
          </Label>
          <Button
            onClick={onUndo}
            variant="outline"
            size="sm"
            className="rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Отменить
          </Button>
        </div>

        {/* Text Colors Section - ULTRA COMPACT */}
        <Card className="p-3 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
          <Label className="text-xs flex items-center gap-1.5 mb-2">
            <Type className="w-3.5 h-3.5" />
            Цвет
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {/* Title Color */}
            <div className="p-2 bg-[#E8F0E8]/30 rounded-lg text-center">
              <Label htmlFor="titleColor" className="text-[10px] text-[#6B6B6B] block mb-1.5">
                Название
              </Label>
              <input
                type="color"
                id="titleColor"
                value={localTitleColor}
                onChange={(e) => {
                  setLocalTitleColor(e.target.value);
                  if (onCoverColorChange) {
                    onCoverColorChange(e.target.value, localOtherColor);
                  }
                }}
                className="w-10 h-10 mx-auto rounded-lg border-2 border-[#2D2D2D]/20 cursor-pointer"
                style={{ padding: '2px' }}
              />
            </div>

            {/* Other Text Color */}
            <div className="p-2 bg-[#F4E7E7]/30 rounded-lg text-center">
              <Label htmlFor="otherColor" className="text-[10px] text-[#6B6B6B] block mb-1.5">
                Другой текст
              </Label>
              <input
                type="color"
                id="otherColor"
                value={localOtherColor}
                onChange={(e) => {
                  setLocalOtherColor(e.target.value);
                  if (onCoverColorChange) {
                    onCoverColorChange(localTitleColor, e.target.value);
                  }
                }}
                className="w-10 h-10 mx-auto rounded-lg border-2 border-[#2D2D2D]/20 cursor-pointer"
                style={{ padding: '2px' }}
              />
            </div>
          </div>
          {/* Cover Language Selector */}
          <div className="mt-2">
            <Label className="text-[10px] text-[#6B6B6B] block mb-1.5">
              Язык обложки
            </Label>
            <select
              value={projectData.coverLanguage || 'ru'}
              onChange={(e) => onCoverLanguageChange?.(e.target.value as CoverLanguage)}
              className="w-full text-[10px] bg-white/50 border border-[#2D2D2D]/20 rounded-lg px-2 py-1.5 cursor-pointer focus:border-[#8B9D83] focus:ring-1 focus:ring-[#8B9D83]/20"
            >
              {(Object.keys(COVER_LANGUAGE_NAMES) as CoverLanguage[]).map((lang) => (
                <option key={lang} value={lang}>
                  {COVER_LANGUAGE_FLAGS[lang]} {COVER_LANGUAGE_NAMES[lang]}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Design Section - ULTRA COMPACT */}
        <Card className="p-3 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
          <Label className="text-xs flex items-center gap-1.5 mb-2">
            <ImageIcon className="w-3.5 h-3.5" />
            Дизайн
          </Label>
          
          {/* Two upload buttons side by side */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Background Image Upload - EXTRA COMPACT */}
            <div
              className={`border-2 border-dashed rounded-xl p-3 transition-all cursor-pointer flex flex-col items-center justify-center ${
                isDragging
                  ? "border-[#2D2D2D] bg-[#E8F0E8]/30"
                  : "border-[#2D2D2D]/20 hover:border-[#2D2D2D]/40 hover:bg-[#E8F0E8]/20"
              }`}
              style={{ minHeight: '90px' }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mb-1 text-[#6B6B6B]" />
              <p className="text-[10px] text-[#6B6B6B] text-center leading-tight">
                Фоновое<br />изображение
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Preview Image Upload - EXTRA COMPACT */}
            <div
              className={`border-2 border-dashed rounded-xl p-3 transition-all cursor-pointer flex flex-col items-center justify-center ${
                isPreviewDragging
                  ? "border-[#2D2D2D] bg-[#F4E7E7]/30"
                  : "border-[#2D2D2D]/20 hover:border-[#2D2D2D]/40 hover:bg-[#F4E7E7]/20"
              }`}
              style={{ minHeight: '90px' }}
              onDragEnter={handlePreviewDragEnter}
              onDragLeave={handlePreviewDragLeave}
              onDragOver={handlePreviewDragOver}
              onDrop={handlePreviewDrop}
              onClick={() => previewFileInputRef.current?.click()}
            >
              <Wand2 className="w-4 h-4 mb-1 text-[#6B6B6B]" />
              <p className="text-[10px] text-[#6B6B6B] text-center leading-tight">
                Превью<br />схемы
              </p>
              <input
                ref={previewFileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePreviewFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Preview Size Slider */}
          {coverPreviewImage && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs text-[#6B6B6B]">Размер превью</Label>
                <span className="text-xs text-[#6B6B6B]">{localPreviewSize}%</span>
              </div>
              <Slider
                value={[localPreviewSize]}
                onValueChange={(value) => {
                  const newValue = value[0];
                  setLocalPreviewSize(newValue);
                  if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                  }
                  debounceTimerRef.current = setTimeout(() => {
                    onPreviewSizeChange(newValue);
                  }, 150);
                }}
                min={50}
                max={100}
                step={1}
              />
            </div>
          )}

          {/* Background Color */}
          <div>
            <Label htmlFor="bgColor" className="text-xs text-[#6B6B6B] block mb-2">
              Цвет фона
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="bgColor"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="w-12 h-12 rounded-lg border-2 border-[#2D2D2D]/20 cursor-pointer"
                style={{ padding: '2px' }}
              />
              <Input
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="flex-1 h-12 rounded-lg"
                placeholder="#F5F3EE"
              />
            </div>
          </div>
        </Card>

        {/* Corner Style Section - MINI ICONS */}
        <Card className="p-3 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
          <Label className="text-xs flex items-center gap-1.5 mb-2">
            <Maximize2 className="w-3.5 h-3.5" />
            Стиль углов
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {/* Rounded Corner Style - MINI ICON */}
            <button
              onClick={() => onCornerStyleChange?.('rounded')}
              className={`p-2 rounded-lg border-2 transition-all ${
                cornerStyle === 'rounded'
                  ? 'border-[#8B9D83] bg-[#8B9D83]/10'
                  : 'border-[#2D2D2D]/20 hover:border-[#2D2D2D]/40'
              }`}
            >
              <div 
                className="w-12 h-16 mx-auto bg-gradient-to-br from-[#E8F0E8] to-[#D4E8D0] border-2 border-[#8B9D83]/40 mb-1"
                style={{ borderRadius: '8px' }}
              ></div>
              <p className="text-[9px] text-center font-medium leading-tight">Скругленные</p>
            </button>

            {/* Sharp Corner Style - MINI ICON */}
            <button
              onClick={() => onCornerStyleChange?.('sharp')}
              className={`p-2 rounded-lg border-2 transition-all ${
                cornerStyle === 'sharp'
                  ? 'border-[#8B9D83] bg-[#8B9D83]/10'
                  : 'border-[#2D2D2D]/20 hover:border-[#2D2D2D]/40'
              }`}
            >
              <div 
                className="w-12 h-16 mx-auto bg-gradient-to-br from-[#E8F0E8] to-[#D4E8D0] border-2 border-[#8B9D83]/40 mb-1"
                style={{ borderRadius: '0' }}
              ></div>
              <p className="text-[9px] text-center font-medium leading-tight">Прямоугольные</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Live Preview - INCREASED HEIGHT */}
      <div className="space-y-3">
        <Label className="text-base flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Предпросмотр обложки
        </Label>

        {/* A4 Preview - LARGER */}
        <div className="mx-auto" style={{ maxWidth: "450px" }}>
          <div
            id="cover-preview"
            className="relative overflow-hidden shadow-2xl"
            style={{
              aspectRatio: "1 / 1.414",
              backgroundColor,
              backgroundImage: coverImage ? `url(${coverImage})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius,
            }}
          >
            {/* Background Pattern */}
            {!coverImage && (
              <div className="absolute inset-0 opacity-5">
                <svg
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <pattern
                    id="cover-pattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="20" cy="20" r="1" fill="currentColor" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#cover-pattern)" />
                </svg>
              </div>
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between items-center p-6 sm:p-8">
              <div className="w-full flex flex-col items-center justify-between h-full">
                {coverPreviewImage ? (
                  <>
                    {/* Header section - centered in top space */}
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <div className="text-center space-y-2 px-4">
                        <p 
                          ref={coverLabelRef}
                          className="text-xs sm:text-sm font-light tracking-widest uppercase" 
                          style={{ 
                            fontFamily: COVER_FONTS.other,
                            color: previewOtherColor,
                            letterSpacing: COVER_FONTS.labelSpacing
                          }}
                        >
                          {t.coverLabel}
                        </p>
                        <h2
                          ref={titleRef}
                          className={getTitleClasses}
                          style={{ 
                            fontFamily: COVER_FONTS.title,
                            color: previewTitleColor,
                            fontWeight: 500
                          }}
                        >
                          «{title || "Название схемы"}»
                        </h2>
                        {designer && (
                          <p 
                            ref={designerRef}
                            className="text-sm sm:text-base mt-3"
                            style={{ 
                              fontFamily: COVER_FONTS.other,
                              color: previewOtherColor
                            }}
                          >
                            {t.designerLabel} <span className="font-medium">{designer}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preview Image - centered on page */}
                    <div className="flex-shrink-0 flex justify-center">
                      <div 
                        className="relative overflow-hidden shadow-xl transition-all duration-200"
                        style={{
                          width: `${120 + (localPreviewSize - 50) * 4.6}px`,
                          borderRadius: borderRadius,
                          display: 'inline-block',
                        }}
                      >
                        <img
                          src={coverPreviewImage}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                          }}
                        />
                      </div>
                    </div>

                    {/* Chart info and subtitle - centered in bottom space */}
                    <div className="flex-1 flex items-center justify-center min-h-0">
                      <div className="text-center space-y-2 px-4">
                        {subtitle && (
                          <p 
                            className={getSubtitleClasses}
                            style={{ 
                              fontFamily: COVER_FONTS.other,
                              color: previewOtherColor,
                              fontStyle: "italic",
                              marginBottom: "0.75rem"
                            }}
                          >
                            {subtitle}
                          </p>
                        )}
                        {chartInfo.stitchesWidth > 0 && (
                          <div className="space-y-1">
                            {/* Dimensions line */}
                            <p 
                              className="text-xs sm:text-sm font-medium"
                              style={{ 
                                fontFamily: COVER_FONTS.other,
                                color: previewOtherColor 
                              }}
                            >
                              {chartInfo.stitchesWidth} × {chartInfo.stitchesHeight} {t.stitchesLabel} ({chartInfo.widthCm} × {chartInfo.heightCm} см)
                            </p>
                            
                            {/* Technical info line with bullets */}
                            <p 
                              className="text-xs sm:text-sm"
                              style={{ 
                                fontFamily: COVER_FONTS.other,
                                color: previewOtherColor, 
                                opacity: 0.9 
                              }}
                            >
                              {t.countLabel} {projectData.coverFabricCount || 14}
                              {chartInfo.colorCount > 0 && chartInfo.flossRange && (
                                <>
                                  {' • '}
                                  {t.paletteLabel} {chartInfo.colorCount} {getColorPlural(chartInfo.colorCount, coverLanguage)} {chartInfo.flossRange}
                                </>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* No preview - show header centered with chart info */
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <p 
                          className="text-xs sm:text-sm font-medium" 
                          style={{ 
                            fontFamily: COVER_FONTS.other,
                            color: previewOtherColor
                          }}
                        >
                          {t.coverLabel}
                        </p>
                        <h2
                          className={getTitleClasses}
                          style={{ 
                            fontFamily: COVER_FONTS.title,
                            color: previewTitleColor
                          }}
                        >
                          «{title || "Название схемы"}»
                        </h2>
                        {designer && (
                          <p 
                            className="text-xs sm:text-sm"
                            style={{ 
                              fontFamily: COVER_FONTS.other,
                              color: previewOtherColor
                            }}
                          >
                            {t.designerLabel} <span className="font-medium">{designer}</span>
                          </p>
                        )}
                      </div>

                      {/* Chart info even without image */}
                      {chartInfo.stitchesWidth > 0 && (
                        <div className="space-y-1 pt-4">
                          {/* Dimensions line */}
                          <p 
                            className="text-xs sm:text-sm font-medium"
                            style={{ 
                              fontFamily: COVER_FONTS.other,
                              color: previewOtherColor 
                            }}
                          >
                            {chartInfo.stitchesWidth} × {chartInfo.stitchesHeight} {t.stitchesLabel} ({chartInfo.widthCm} × {chartInfo.heightCm} см)
                          </p>
                          
                          {/* Technical info line with bullets */}
                          <p 
                            className="text-xs sm:text-sm"
                            style={{ 
                              fontFamily: COVER_FONTS.other,
                              color: previewOtherColor, 
                              opacity: 0.9 
                            }}
                          >
                            {t.countLabel} {projectData.coverFabricCount || 14}
                            {chartInfo.colorCount > 0 && chartInfo.flossRange && (
                              <>
                                {' • '}
                                {t.paletteLabel} {chartInfo.colorCount} {getColorPlural(chartInfo.colorCount, coverLanguage)} {chartInfo.flossRange}
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-[#6B6B6B] mt-2">
            Формат A4 (210 × 297 мм)
          </p>
        </div>
      </div>
    </div>
  );
}