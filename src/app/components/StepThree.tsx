import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft, Key, Upload, FileText, Check, X, Wand2 } from "lucide-react";
import { ProjectData } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

interface StepThreeProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
  onNext: () => void;
  onBack: () => void;
  onOpenKeyGenerator?: () => void;
}

export default function StepThree({ projectData, updateProjectData, onNext, onBack, onOpenKeyGenerator }: StepThreeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Пожалуйста, загрузите PDF файл');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (isMountedRef.current) {
        updateProjectData({ 
          symbolKeyPDF: base64,
          includeSymbolKey: true 
        });
        setPdfPreview(base64);
      }
    };
    reader.readAsDataURL(file);
  }, [updateProjectData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleRemoveFile = useCallback(() => {
    updateProjectData({ 
      symbolKeyPDF: undefined,
      includeSymbolKey: false 
    });
    setPdfPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [updateProjectData]);

  const handleIncludeToggle = useCallback((checked: boolean) => {
    updateProjectData({ includeSymbolKey: checked });
  }, [updateProjectData]);

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-6 h-6 text-[#3A3A3A]" />
            <h2 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Ключ
            </h2>
          </div>
          <p className="text-[#5A5A5A] mb-4">
            Загрузите готовый PDF файл с ключом схемы для включения в итоговый документ
          </p>
          
          {/* Key Generator Button */}
          {onOpenKeyGenerator && (
            <div className="mb-4">
              <Button
                onClick={() => {
                  console.log('Key Generator button clicked');
                  onOpenKeyGenerator();
                }}
                variant="outline"
                className="px-4 py-2 rounded-2xl border-[#8B9D83]/40 hover:bg-[#E8EDE6]/50 hover:border-[#8B9D83] transition-all"
              >
                <Wand2 className="w-4 h-4 mr-2 text-[#8B9D83]" />
                <span className="text-sm">Генератор ключа для Cross Stitch Professional Platinum</span>
              </Button>
              <p className="text-xs text-[#5A5A5A] mt-2 ml-1">
                Создайте RTF файл для Cross Stitch Professional Platinum
              </p>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <Card className="p-8 bg-white/60 backdrop-blur-sm border-[#8B9D83]/20 rounded-3xl shadow-sm">
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <Label className="text-base font-medium mb-4 block text-[#3A3A3A]">
                Файл PDF с ключом
              </Label>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-3xl p-12 transition-all ${
                  projectData.symbolKeyPDF
                    ? 'border-[#8B9D83] bg-[#E8F0E8] cursor-default'
                    : isDragging
                    ? 'border-[#8B9D83] bg-[#E8EDE6]/20'
                    : 'border-[#B8C5B3]/30 hover:border-[#8B9D83] hover:bg-[#E8EDE6]/10'
                }`}
              >
                {!projectData.symbolKeyPDF && (
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                )}
                
                <div className="text-center">
                  {projectData.symbolKeyPDF ? (
                    <>
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#8B9D83] flex items-center justify-center">
                        <Check className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-lg font-medium text-[#8B9D83] mb-2">
                        PDF файл загружен
                      </p>
                      <p className="text-sm text-[#6B7B65]">
                        Готов к включению в итоговый документ
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 mx-auto mb-4 text-[#8B9D83]/60" />
                      <p className="text-lg font-medium text-[#3A3A3A] mb-2">
                        Перетащите PDF файл сюда
                      </p>
                      <p className="text-sm text-[#5A5A5A]">
                        или нажмите для выбора файла
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Uploaded File Info */}
            {projectData.symbolKeyPDF && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#E8EDE6]/30 rounded-2xl border border-[#8B9D83]/20">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#8B9D83]" />
                    <div>
                      <p className="font-medium text-[#3A3A3A]">PDF файл загружен</p>
                      <p className="text-sm text-[#5A5A5A]">Готов к включению в итоговый документ</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRemoveFile}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Удалить
                  </Button>
                </div>

                {/* Include in Final PDF Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl border border-[#8B9D83]/20">
                  <Checkbox
                    id="include-symbol-key"
                    checked={projectData.includeSymbolKey ?? true}
                    onCheckedChange={handleIncludeToggle}
                  />
                  <Label
                    htmlFor="include-symbol-key"
                    className="text-base font-medium cursor-pointer flex items-center gap-2 text-[#3A3A3A]"
                  >
                    <Check className="w-4 h-4 text-[#8B9D83]" />
                    Включить ключ в итоговый PDF
                  </Label>
                </div>
              </div>
            )}

            {/* PDF Preview */}
            {projectData.symbolKeyPDF && (
              <div>
                <Label className="text-base font-medium mb-4 block text-[#3A3A3A]">
                  Предпросмотр
                </Label>
                
                <div className="rounded-3xl overflow-hidden border-2 border-[#8B9D83]/20 bg-white shadow-lg">
                  <iframe
                    src={projectData.symbolKeyPDF}
                    className="w-full"
                    style={{ height: '600px' }}
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}

            {/* Empty State */}
            {!projectData.symbolKeyPDF && (
              <div className="text-center py-8 text-[#5A5A5A]">
                <p className="text-sm">
                  Файл не загружен. Вы можете пропустить этот шаг и добавить ключ позже.
                </p>
                {onOpenKeyGenerator && (
                  <Button
                    onClick={onOpenKeyGenerator}
                    variant="outline"
                    size="sm"
                    className="mt-4 px-4 py-2 rounded-3xl border-[#8B9D83]/30 hover:bg-[#E8EDE6]/50 hover:border-[#8B9D83]"
                  >
                    <Wand2 className="w-4 h-4 mr-1 text-[#8B9D83]" />
                    Сгенерировать ключ
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>
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
          onClick={onNext}
          className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
        >
          Продолжить
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}