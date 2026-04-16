import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, ImagePlus, Download, Square, Upload, X, Edit3, CheckCircle2 } from "lucide-react";
import { ProjectData } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import CoverEditor from "./CoverEditor";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface StepTwoProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface CoverHistory {
  coverTitle?: string;
  coverSubtitle?: string;
  coverDesigner?: string;
  coverBackgroundColor?: string;
  coverTextColor?: string;
  coverImage?: string;
  coverPreviewImage?: string;
  coverPreviewSize?: number;
}

export default function StepTwo({ projectData, updateProjectData, onNext, onBack }: StepTwoProps) {
  const [history, setHistory] = useState<CoverHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'editor'>('upload'); // По умолчанию вкладка "Загрузить готовую обложку"
  const isMountedRef = useRef(true);

  // Debug logging
  useEffect(() => {
    console.log('🔧 StepTwo: Component rendered with projectData:', {
      uploadedCoverFile: projectData.uploadedCoverFile ? 'EXISTS (length: ' + projectData.uploadedCoverFile.length + ')' : 'MISSING',
      uploadedCoverType: projectData.uploadedCoverType,
      coverPDF: projectData.coverPDF ? 'EXISTS' : 'MISSING',
      activeTab,
    });
  }, [projectData.uploadedCoverFile, projectData.uploadedCoverType, projectData.coverPDF, activeTab]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save current state to history before making changes
  const saveToHistory = useCallback(() => {
    const currentState: CoverHistory = {
      coverTitle: projectData.coverTitle,
      coverSubtitle: projectData.coverSubtitle,
      coverDesigner: projectData.coverDesigner,
      coverBackgroundColor: projectData.coverBackgroundColor,
      coverTextColor: projectData.coverTextColor,
      coverImage: projectData.coverImage,
      coverPreviewImage: projectData.coverPreviewImage,
      coverPreviewSize: projectData.coverPreviewSize,
    };
    
    setHistory((prev) => [...prev, currentState]);
  }, [projectData]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    updateProjectData(previousState);
  }, [history, updateProjectData]);

  const handleChange = useCallback((data: Partial<ProjectData>) => {
    saveToHistory();
    updateProjectData(data);
  }, [saveToHistory, updateProjectData]);
  
  // Автоматически генерировать PDF обложки перед переходом на следующий шаг
  const handleNext = useCallback(async () => {
    // Skip PDF generation if custom cover is already uploaded and has PDF
    if (projectData.uploadedCoverFile && projectData.coverPDF) {
      onNext();
      return;
    }

    // If no custom cover uploaded, generate PDF from editor
    if (!projectData.uploadedCoverFile && projectData.includeCover !== false && !projectData.coverPDF) {
      const element = document.getElementById("cover-preview");
      if (element) {
        try {
          // Небольшая задержка для рендеринга
          const timeoutId = setTimeout(() => {}, 100);
          await new Promise(resolve => setTimeout(resolve, 100));
          if (!isMountedRef.current) {
            clearTimeout(timeoutId);
            return;
          }
          
          const canvas = await html2canvas(element, {
            backgroundColor: '#FFFFFF',
            scale: 2,
            logging: false,
            useCORS: true,
          });
          
          if (!isMountedRef.current) {
            clearTimeout(timeoutId);
            return;
          }
          
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = imgWidth / imgHeight;
          const margin = 10;
          const maxWidth = pdfWidth - (2 * margin);
          const maxHeight = pdfHeight - (2 * margin);
          
          let finalWidth = maxWidth;
          let finalHeight = maxWidth / ratio;
          
          if (finalHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = maxHeight * ratio;
          }
          
          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;
          
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
          pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
          
          if (isMountedRef.current) {
            const pdfBase64 = pdf.output('dataurlstring');
            updateProjectData({ coverPDF: pdfBase64 });
          }
          clearTimeout(timeoutId);
        } catch (error) {
          console.error('Error auto-generating cover PDF:', error);
        }
      }
    }
    
    // Небольшая задержка перед переходом
    if (!isMountedRef.current) return;
    const nextTimeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        onNext();
      }
    }, 200);
    
    // Cleanup timeout если компонент размонтирован
    return () => clearTimeout(nextTimeoutId);
  }, [projectData, updateProjectData, onNext]);

  const downloadPDF = useCallback(() => {
    const element = document.getElementById("cover-preview");
    if (!element) return;

    html2canvas(element, {
      backgroundColor: '#FFFFFF',
      scale: 2,
    }).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 dimensions in mm
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Convert canvas to image first
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      
      // Fit to A4 with margins
      const margin = 10;
      const maxWidth = pdfWidth - (2 * margin);
      const maxHeight = pdfHeight - (2 * margin);
      
      let finalWidth = maxWidth;
      let finalHeight = maxWidth / ratio;
      
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = maxHeight * ratio;
      }
      
      // Center on page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      // Set white background
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
      
      // Add image
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Save to projectData as base64
      const pdfBase64 = pdf.output('dataurlstring');
      updateProjectData({ coverPDF: pdfBase64 });
      
      // Also download the file
      pdf.save('cover.pdf');
    }).catch(error => {
      console.error('Error generating PDF:', error);
    });
  }, [updateProjectData]);

  // Handle upload of custom cover file
  const handleUploadCover = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔧 StepTwo: handleUploadCover called');
    
    const file = event.target.files?.[0];
    if (!file) {
      console.log('🔧 StepTwo: No file selected');
      return;
    }

    console.log('🔧 StepTwo: File selected:', file.name, file.type, file.size);
    toast.info(`Загружается файл: ${file.name}`);

    const fileType = file.type;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxSize) {
      toast.error('Файл слишком большой. Максимальный размер: 10MB');
      return;
    }

    // Check file type
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    if (!isImage && !isPDF) {
      toast.error('Поддерживаются только форматы: PDF, JPG, PNG');
      return;
    }

    console.log('🔧 StepTwo: File type check passed:', { isImage, isPDF });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      
      console.log('🔧 StepTwo: File loaded, size:', result?.length);
      
      // If it's an image, convert it to PDF
      if (isImage) {
        try {
          const img = new Image();
          img.src = result;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          console.log('🔧 StepTwo: Image loaded, dimensions:', img.width, 'x', img.height);

          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imgWidth = img.width;
          const imgHeight = img.height;
          const ratio = imgWidth / imgHeight;
          
          const margin = 0; // No margins for uploaded cover
          const maxWidth = pdfWidth - (2 * margin);
          const maxHeight = pdfHeight - (2 * margin);
          
          let finalWidth = maxWidth;
          let finalHeight = maxWidth / ratio;
          
          if (finalHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = maxHeight * ratio;
          }
          
          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;
          
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
          pdf.addImage(result, 'PNG', x, y, finalWidth, finalHeight);
          
          const pdfBase64 = pdf.output('dataurlstring');
          
          console.log('🔧 StepTwo: PDF generated, updating projectData with:', {
            uploadedCoverFile: result.substring(0, 100) + '...',
            uploadedCoverType: 'image',
            coverPDF: pdfBase64.substring(0, 100) + '...',
          });
          
          updateProjectData({
            uploadedCoverFile: result,
            uploadedCoverType: 'image',
            coverPDF: pdfBase64,
          });
          setActiveTab('upload'); // Switch to upload tab
          toast.success(`Обложка загружена: ${file.name}`);
          
          console.log('🔧 StepTwo: projectData should now have uploadedCoverFile');
        } catch (error) {
          console.error('Error converting image to PDF:', error);
          toast.error('Ошибка при конвертации изображения в PDF');
        }
      } else {
        // It's a PDF, use it directly
        console.log('🔧 StepTwo: PDF file, updating projectData');
        
        updateProjectData({
          uploadedCoverFile: result,
          uploadedCoverType: 'pdf',
          coverPDF: result,
        });
        setActiveTab('upload'); // Switch to upload tab
        toast.success(`Обложка загружена: ${file.name}`);
        
        console.log('🔧 StepTwo: projectData should now have uploadedCoverFile');
      }
    };
    reader.onerror = (error) => {
      console.error('🔧 StepTwo: FileReader error:', error);
      toast.error('Ошибка при чтении файла');
    };
    reader.readAsDataURL(file);
  }, [updateProjectData]);

  // Remove uploaded cover
  const handleRemoveCover = useCallback(() => {
    console.log('🗑️ StepTwo: Removing uploaded cover');
    updateProjectData({
      uploadedCoverFile: undefined,
      uploadedCoverType: undefined,
      coverPDF: undefined,
    });
    toast.success('Обложка удалена');
  }, [updateProjectData]);

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ImagePlus className="w-6 h-6 text-[#2D2D2D]" />
            <h2 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Создание обложки
            </h2>
          </div>
          <p className="text-[#6B6B6B]">
            Создайте профессиональную обложку для вашей PDF схемы вышивки
          </p>
        </div>

        {/* Tab Navigation - Planner Style Dividers */}
        <div className="mb-8">
          <div className="flex gap-3 border-b-2 border-[#E8EDE6]">
            {/* Upload Tab */}
            <button
              onClick={() => setActiveTab('upload')}
              className={`relative px-6 py-4 rounded-t-2xl transition-all duration-300 ${
                activeTab === 'upload'
                  ? 'bg-[#8B9D83] text-white shadow-lg'
                  : 'bg-[#F5F3EE] text-[#6B6B6B] hover:bg-[#E8EDE6] hover:text-[#3A3A3A]'
              }`}
              style={{
                transform: activeTab === 'upload' ? 'translateY(2px)' : 'none',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5" />
                <span className="font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
                  Загрузить готовую обложку
                </span>
              </div>
              {/* Tab indicator */}
              {activeTab === 'upload' && (
                <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#8B9D83]"></div>
              )}
            </button>

            {/* Editor Tab */}
            <button
              onClick={() => setActiveTab('editor')}
              className={`relative px-6 py-4 rounded-t-2xl transition-all duration-300 ${
                activeTab === 'editor'
                  ? 'bg-[#8B9D83] text-white shadow-lg'
                  : 'bg-[#F5F3EE] text-[#6B6B6B] hover:bg-[#E8EDE6] hover:text-[#3A3A3A]'
              }`}
              style={{
                transform: activeTab === 'editor' ? 'translateY(2px)' : 'none',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5" />
                <span className="font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
                  Создать в редакторе
                </span>
              </div>
              {/* Tab indicator */}
              {activeTab === 'editor' && (
                <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#8B9D83]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-[#8B9D83]" />
              <div>
                <Label className="text-base font-medium">Загрузить готовую обложку</Label>
                <p className="text-sm text-[#6B6B6B] mt-1">
                  Загрузите готовый файл обложки (PDF, JPG, PNG) - максимум 10MB
                </p>
              </div>
            </div>

            {!projectData.uploadedCoverFile ? (
              <div>
                <input
                  type="file"
                  id="cover-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleUploadCover}
                  className="hidden"
                />
                <label htmlFor="cover-upload">
                  <div className="cursor-pointer border-2 border-dashed border-[#8B9D83]/30 rounded-2xl p-8 text-center hover:border-[#8B9D83]/60 hover:bg-[#E8EDE6]/30 transition-all duration-300">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-[#8B9D83]" />
                    <p className="text-base font-medium text-[#2D2D2D] mb-1">
                      Нажмите для загрузки обложки
                    </p>
                    <p className="text-sm text-[#6B6B6B]">
                      Поддерживаемые форматы: PDF, JPG, PNG
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-[#8B9D83]/30 rounded-2xl p-6 bg-[#E8EDE6]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#8B9D83]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-[#8B9D83]" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-[#2D2D2D]">
                          Обложка загружена
                        </p>
                        <p className="text-sm text-[#6B6B6B]">
                          Тип: {projectData.uploadedCoverType === 'pdf' ? 'PDF' : 'Изображение'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="cover-replace"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleUploadCover}
                        className="hidden"
                      />
                      <label htmlFor="cover-replace">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full border-[#8B9D83]/30 hover:border-[#8B9D83] hover:bg-[#8B9D83]/10"
                          asChild
                        >
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Заменить
                          </span>
                        </Button>
                      </label>
                      <Button
                        onClick={handleRemoveCover}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                  {/* Preview uploaded cover */}
                  {projectData.uploadedCoverType === 'image' && projectData.uploadedCoverFile && (
                    <div className="mt-4 rounded-xl overflow-hidden border-2 border-[#2D2D2D]/10">
                      <img
                        src={projectData.uploadedCoverFile}
                        alt="Uploaded cover preview"
                        className="w-full h-auto max-h-96 object-contain bg-white"
                      />
                    </div>
                  )}
                </div>
                
                {/* Info card about editor option */}
                <div className="border-2 border-[#8B9D83]/20 bg-[#8B9D83]/5 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8B9D83]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Edit3 className="w-5 h-5 text-[#8B9D83]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#3A3A3A] mb-1">
                        Хотите создать обложку в редакторе?
                      </p>
                      <p className="text-sm text-[#5A6B54] mb-3">
                        Вы можете удалить загруженную обложку и воспользоваться встроенным редактором для создания кастомной обложки
                      </p>
                      <Button
                        onClick={() => {
                          handleRemoveCover();
                          setActiveTab('editor');
                        }}
                        size="sm"
                        className="rounded-full bg-[#8B9D83] text-white hover:bg-[#7A8C73]"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Создать в редакторе
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'editor' && (
          <Card className="p-8 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
            <CoverEditor
              title={projectData.coverTitle || projectData.chartTitle || ""}
              subtitle={projectData.coverSubtitle || ""}
              designer={projectData.coverDesigner || projectData.designerName || ""}
              backgroundColor={projectData.coverBackgroundColor || "#E8F0E8"}
              textColor={projectData.coverTextColor || "#2D2D2D"}
              coverImage={projectData.coverImage}
              coverPreviewImage={projectData.coverPreviewImage}
              coverPreviewSize={projectData.coverPreviewSize || 70}
              projectData={projectData}
              onTitleChange={(value) => handleChange({ coverTitle: value })}
              onSubtitleChange={(value) => handleChange({ coverSubtitle: value })}
              onDesignerChange={(value) => handleChange({ coverDesigner: value })}
              onBackgroundColorChange={(value) => handleChange({ coverBackgroundColor: value })}
              onTextColorChange={(value) => handleChange({ coverTextColor: value })}
              onImageUpload={(imageData) => handleChange({ coverImage: imageData })}
              onPreviewImageUpload={(imageData) => handleChange({ coverPreviewImage: imageData })}
              onPreviewSizeChange={(value) => handleChange({ coverPreviewSize: value })}
              onUndo={handleUndo}
              onCoverColorChange={(titleColor, otherColor) => {
                console.log('🔧 StepTwo onCoverColorChange called:', { titleColor, otherColor });
                handleChange({
                  coverTitleColor: titleColor,
                  coverOtherColor: otherColor
                });
              }}
              onCornerStyleChange={(style) => {
                console.log('🔧 StepTwo onCornerStyleChange called:', style);
                handleChange({ cornerStyle: style });
              }}
              onCoverLanguageChange={(language) => {
                console.log('🔧 StepTwo onCoverLanguageChange called:', language);
                handleChange({ coverLanguage: language });
              }}
            />
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Назад
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
        >
          Продолжить
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Download Button - only show if custom cover is NOT uploaded */}
      {!projectData.uploadedCoverFile && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={downloadPDF}
            className="h-14 px-8 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
          >
            <Download className="w-5 h-5 mr-2" />
            Скачать PDF
          </Button>
        </div>
      )}
    </div>
  );
}