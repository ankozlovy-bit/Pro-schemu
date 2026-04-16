import { useState, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, Calculator, Download, Plus, Trash2, QrCode, Settings } from 'lucide-react';
import ExcelJS from 'exceljs';
import { ProjectData, ThreadUsageRow, QRCode } from "../types";
import { Button } from "./ui/button";
import ThreadCalculator from "./ThreadCalculator";

interface StepFourProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function StepFour({ projectData, updateProjectData, onNext, onBack }: StepFourProps) {
  const handleThreadUsageFileUpload = (fileData: string, parsedData: ThreadUsageRow[]) => {
    updateProjectData({
      threadUsageFile: fileData,
      threadUsageData: parsedData,
    });
  };

  const handleShowColorNamesToggle = (value: boolean) => {
    updateProjectData({ showColorNames: value });
  };

  const handleMessageChange = (value: string) => {
    updateProjectData({ threadUsageMessage: value });
  };

  const handleQRCodesChange = (qrCodes: QRCode[]) => {
    updateProjectData({ threadUsageQRCodes: qrCodes });
  };

  const handleQRCodeSizeChange = (size: number) => {
    updateProjectData({ qrCodeSize: size });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    updateProjectData({ threadUsageFontFamily: fontFamily });
  };

  const handleHeaderColorChange = (color: string) => {
    updateProjectData({ threadUsageHeaderColor: color });
  };

  return (
    <div className="space-y-6">
      <ThreadCalculator
        projectData={projectData}
        onThreadUsageFileUpload={handleThreadUsageFileUpload}
        onShowColorNamesToggle={handleShowColorNamesToggle}
        onMessageChange={handleMessageChange}
        onQRCodesChange={handleQRCodesChange}
        onQRCodeSizeChange={handleQRCodeSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        onHeaderColorChange={handleHeaderColorChange}
      />

      {/* Navigation Buttons */}
      <div className="max-w-7xl mx-auto px-6 pb-6 flex gap-4">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 h-14 rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Назад
          </Button>
        )}

        {onNext && (
          <Button
            onClick={onNext}
            className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white"
          >
            Далее
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}