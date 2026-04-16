import { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Upload as UploadIcon, Check, FileText, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { ProjectData, ChartPDF } from "../types";
import { Button } from './ui/button';
import { Card } from "./ui/card";
import { Label } from "./ui/label";

interface StepFiveProps {
  projectData: ProjectData;
  updateProjectData: (updates: Partial<ProjectData>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function StepFive({
  projectData,
  updateProjectData,
  onNext,
  onBack,
}: StepFiveProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [chartPDFs, setChartPDFs] = useState<ChartPDF[]>(projectData.chartPDFs || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  const MAX_FILES = 4;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      const pdfFiles = files.filter((f) => f.name.toLowerCase().endsWith('.pdf'));
      
      if (pdfFiles.length === 0) {
        alert('Пожалуйста, выберите PDF файлы');
        return;
      }

      if (chartPDFs.length + pdfFiles.length > MAX_FILES) {
        alert(`Можно загрузить максимум ${MAX_FILES} файла`);
        return;
      }

      const newChartPDFs: ChartPDF[] = [];

      for (const file of pdfFiles) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`Файл "${file.name}" слишком большой (максимум 50 MB)`);
          continue;
        }

        try {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newChartPDFs.push({
            id: `chart-pdf-${Date.now()}-${Math.random()}`,
            name: file.name,
            file: base64,
            size: file.size,
          });
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          alert(`Ошибка при чтении файла "${file.name}"`);
        }
      }

      const updatedChartPDFs = [...chartPDFs, ...newChartPDFs];
      setChartPDFs(updatedChartPDFs);
      updateProjectData({ chartPDFs: updatedChartPDFs });
    },
    [chartPDFs, updateProjectData]
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
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      handleFileUpload(files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileUpload]
  );

  const handleRemoveFile = useCallback(
    (id: string) => {
      const updatedChartPDFs = chartPDFs.filter((pdf) => pdf.id !== id);
      setChartPDFs(updatedChartPDFs);
      updateProjectData({ chartPDFs: updatedChartPDFs });
    },
    [chartPDFs, updateProjectData]
  );

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Загрузка схем
          </h2>
          <p className="text-[#6B6B6B]">
            Загрузите PDF файлы схем вышивки (до {MAX_FILES} файлов), которые будут добавлены в конец итогового PDF
          </p>
        </div>

        <div className="mt-8">
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-[#2D2D2D]/10 rounded-3xl shadow-lg">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                chartPDFs.length > 0
                  ? "border-[#8B9D83] bg-[#E8F0E8] cursor-default"
                  : isDragging
                  ? "border-[#2D2D2D] bg-[#E8F0E8]/50 scale-[1.02]"
                  : chartPDFs.length >= MAX_FILES
                  ? "border-[#2D2D2D]/10 bg-gray-50 cursor-not-allowed"
                  : "border-[#2D2D2D]/20 hover:border-[#2D2D2D]/40 hover:bg-[#E8F0E8]/20"
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => chartPDFs.length === 0 && chartPDFs.length < MAX_FILES && fileInputRef.current?.click()}
            >
              {chartPDFs.length > 0 ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B9D83] flex items-center justify-center">
                    <Check className="w-9 h-9 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                    Файлы успешно загружены
                  </h3>
                  <p className="text-sm text-[#6B7B65]">
                    Загружено {chartPDFs.length} {chartPDFs.length === 1 ? 'файл' : chartPDFs.length < 5 ? 'файла' : 'файлов'}
                  </p>
                </>
              ) : (
                <>
                  <div>
                    <UploadIcon className="w-16 h-16 mx-auto mb-4 text-[#2D2D2D]/40" />
                  </div>
                  
                  <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                    {chartPDFs.length >= MAX_FILES 
                      ? `Достигнут лимит (${MAX_FILES} файла)`
                      : 'Перетащите PDF файлы сюда'
                    }
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mb-4">
                    {chartPDFs.length >= MAX_FILES 
                      ? 'Удалите файлы ниже, чтобы загрузить новые'
                      : 'или нажмите для выбора файлов'
                    }
                  </p>

                  <div className="flex items-center justify-center gap-4 text-xs text-[#6B6B6B]">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Формат: PDF</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>До {MAX_FILES} файлов</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Макс 50 MB</span>
                    </div>
                  </div>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                disabled={chartPDFs.length >= MAX_FILES}
              />
            </div>

            {/* Uploaded Files List */}
            {chartPDFs.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
                    Загруженные файлы ({chartPDFs.length}/{MAX_FILES})
                  </Label>
                  {chartPDFs.length < MAX_FILES && (
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      size="sm"
                      className="bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white rounded-2xl"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Добавить
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {chartPDFs.map((pdf, index) => (
                    <div key={pdf.id}>
                      <Card className="p-4 bg-gradient-to-r from-[#E8F0E8]/30 to-[#F4E7E7]/30 border-[#2D2D2D]/10 rounded-2xl hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          {/* File Icon */}
                          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <FileText className="w-6 h-6 text-[#2D2D2D]" />
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <h4 className="font-medium text-sm truncate" title={pdf.name}>
                                {pdf.name}
                              </h4>
                            </div>
                            <p className="text-xs text-[#6B6B6B]">
                              Размер: {formatFileSize(pdf.size)}
                            </p>
                          </div>

                          {/* Order Badge */}
                          <div className="flex-shrink-0 w-8 h-8 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>

                          {/* Remove Button */}
                          <Button
                            onClick={() => handleRemoveFile(pdf.id)}
                            variant="ghost"
                            size="sm"
                            className="flex-shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Info Note */}
                <div className="mt-6 p-4 bg-[#E8F0E8]/50 border border-[#8B9D83]/30 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#8B9D83] flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-[#2D2D2D]">
                      <p className="font-medium mb-1">Порядок файлов в итоговом PDF:</p>
                      <p className="text-xs text-[#6B6B6B]">
                        Файлы будут добавлены в конец итогового PDF в том порядке, в котором они отображаются выше. Цифры справа показывают порядок добавления.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {chartPDFs.length === 0 && (
              <div className="mt-8 text-center text-[#6B6B6B]">
                <FileText className="w-20 h-20 mx-auto mb-4 opacity-20" />
                <p className="text-sm">
                  Пока не загружено ни одного файла
                </p>
                <p className="text-xs mt-2">
                  Загрузка схем необязательна, но если у вас есть готовые PDF-схемы,<br />
                  вы можете добавить их в итоговый документ
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
          >
            Продолжить
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}