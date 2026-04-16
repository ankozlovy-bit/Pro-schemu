import myNewPhoto from '../../assets/123.png';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { ProjectData } from "../types";
import { Button } from './ui/button';
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";

const HERO_IMAGE = myNewPhoto;

interface StepOneProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
  onNext: () => void;
}

export default function StepOne({ projectData, updateProjectData, onNext }: StepOneProps) {
  const [isMounted, setIsMounted] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize symbolKeyLanguages if not set
  useEffect(() => {
    if (hasInitialized) return;
    
    const updates: Partial<ProjectData> = {};
    let needsUpdate = false;

    if (!projectData.symbolKeyLanguages || projectData.symbolKeyLanguages.length === 0) {
      // Default to Russian - language selection is available in Key Generator step
      updates.symbolKeyLanguages = ['ru'];
      needsUpdate = true;
    }
    
    // Auto-fill designer name from settings if not set
    if (!projectData.designerName && projectData.settings?.designerNames) {
      const languages = projectData.symbolKeyLanguages || ['ru'];
      const firstLang = languages[0];
      const autoName = projectData.settings.designerNames[firstLang] || 
                       projectData.settings.designerNameRU || 
                       projectData.settings.designerNameEN;
      if (autoName) {
        updates.designerName = autoName;
        needsUpdate = true;
      }
    }

    // Set default fabric count to 14 if not set
    if (projectData.coverFabricCount === undefined || projectData.coverFabricCount === null) {
      updates.coverFabricCount = 14;
      needsUpdate = true;
    }

    // Auto-set threadCount based on fabric count if not already set
    if (projectData.threadCount === undefined || projectData.threadCount === null) {
      const fabricCount = updates.coverFabricCount || projectData.coverFabricCount || 14;
      const defaultThreadCount = fabricCount < 20 ? 1 : 2;
      updates.threadCount = defaultThreadCount;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updateProjectData(updates);
    }
    
    setHasInitialized(true);
  }, [hasInitialized, projectData.symbolKeyLanguages, projectData.language, projectData.designerName, projectData.settings, projectData.threadCount, projectData.coverFabricCount, updateProjectData]);

  // Cleanup on unmount
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  const canProceed = projectData.designerName && projectData.chartTitle;

  // Calculate effective count based on thread count
  const fabricCount = projectData.coverFabricCount || 14;
  const threadCount = projectData.threadCount || 2;
  const effectiveCount = threadCount > 0 ? fabricCount / threadCount : fabricCount;

  // Handle fabric count change and auto-adjust thread count
  const handleFabricCountChange = (newFabricCount: number) => {
    const currentFabricCount = projectData.coverFabricCount || 14;
    const currentThreadCount = projectData.threadCount;
    const expectedThreadCount = currentFabricCount < 20 ? 1 : 2;
    
    // Build update object
    const updates: Partial<ProjectData> = {
      coverFabricCount: newFabricCount
    };
    
    // If current threadCount matches expected (user hasn't manually changed it), auto-adjust
    if (currentThreadCount === expectedThreadCount || currentThreadCount === undefined) {
      const newThreadCount = newFabricCount < 20 ? 1 : 2;
      updates.threadCount = newThreadCount;
    }
    
    // Single update call
    updateProjectData(updates);
  };

  // Calculate dimensions in cm using effective count
  const calculateCm = (stitches: number) => {
    if (!stitches || !effectiveCount || effectiveCount <= 0) return '0.0';
    return ((stitches / effectiveCount) * 2.54).toFixed(1);
  };

  const widthCm = calculateCm(projectData.chartWidth || 0);
  const heightCm = calculateCm(projectData.chartHeight || 0);

  return (
    <div className="relative space-y-8 min-h-[600px]">
      {/* Large Background Image with Vignette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        {/* Image */}
        <div className="absolute inset-0 opacity-90">
          <img 
            src={HERO_IMAGE} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Soft Vignette overlay - very subtle */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(255, 255, 255, 0.15) 100%)'
          }}
        />
      </div>

      {/* Basic Information */}
      <div className="relative grid md:grid-cols-2 gap-6 z-10">
        <Card className="p-6 bg-white/85 backdrop-blur-md border-[#8B9D83]/20 rounded-3xl shadow-sm">
          <Label htmlFor="designerName" className="text-sm font-medium mb-3 block text-[#3A3A3A]">
            Имя дизайнера
          </Label>
          <Input
            id="designerName"
            placeholder={
              (() => {
                // Get designer name based on selected languages
                const selectedLangs = projectData.symbolKeyLanguages || ['ru'];
                const firstLang = selectedLangs[0];
                const designerNames = projectData.settings?.designerNames;
                
                if (designerNames && designerNames[firstLang]) {
                  return designerNames[firstLang];
                }
                
                return projectData.settings?.designerNameRU || 
                       projectData.settings?.designerNameEN || 
                       "Введите ваше имя";
              })()
            }
            value={projectData.designerName}
            onChange={(e) => updateProjectData({ designerName: e.target.value })}
            className="rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20"
          />
          {projectData.settings?.designerNames && !projectData.designerName && (() => {
            const selectedLangs = projectData.symbolKeyLanguages || ['ru'];
            const firstLang = selectedLangs[0];
            const designerNames = projectData.settings.designerNames;
            const autoName = designerNames[firstLang] || designerNames.ru || designerNames.en;
            
            if (autoName) {
              return (
                <p className="text-xs text-[#5A6B54] mt-2">
                  💡 Используется имя из настроек: {autoName}
                </p>
              );
            }
            return null;
          })()}
        </Card>

        <Card className="p-6 bg-white/85 backdrop-blur-md border-[#8B9D83]/20 rounded-3xl shadow-sm">
          <Label htmlFor="chartTitle" className="text-sm font-medium mb-3 block text-[#3A3A3A]">
            Название схемы
          </Label>
          <Input
            id="chartTitle"
            placeholder="Например: Роза в саду"
            value={projectData.chartTitle}
            onChange={(e) => updateProjectData({ chartTitle: e.target.value })}
            className="rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20"
          />
        </Card>
      </div>

      {/* Chart Dimensions */}
      <div className="relative grid md:grid-cols-2 gap-6 z-10">
        <Card className="p-4 bg-white/80 backdrop-blur-md border-[#8B9D83]/20 rounded-2xl shadow-sm">
          <Label htmlFor="chartWidth" className="text-sm font-medium mb-2 block text-[#3A3A3A]">
            Ширина схемы (стежки)
          </Label>
          <Input
            id="chartWidth"
            type="number"
            placeholder="150"
            value={projectData.chartWidth || ''}
            onChange={(e) => updateProjectData({ chartWidth: parseInt(e.target.value) || 0 })}
            className="rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20"
          />
          {projectData.chartWidth > 0 && (
            <p className="text-xs text-[#5A6B54] mt-1.5 font-medium">
              ≈ {widthCm} см (при каунте {effectiveCount})
            </p>
          )}
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border-[#8B9D83]/20 rounded-2xl shadow-sm">
          <Label htmlFor="chartHeight" className="text-sm font-medium mb-2 block text-[#3A3A3A]">
            Высота схемы (стежки)
          </Label>
          <Input
            id="chartHeight"
            type="number"
            placeholder="200"
            value={projectData.chartHeight || ''}
            onChange={(e) => updateProjectData({ chartHeight: parseInt(e.target.value) || 0 })}
            className="rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20"
          />
          {projectData.chartHeight > 0 && (
            <p className="text-xs text-[#5A6B54] mt-1.5 font-medium">
              ≈ {heightCm} см (при каунте {effectiveCount})
            </p>
          )}
        </Card>
      </div>

      {/* Fabric and Palette Information */}
      <div className="relative grid md:grid-cols-4 gap-4 z-10">
        <Card className="p-4 bg-white/80 backdrop-blur-md border-[#8B9D83]/20 rounded-2xl shadow-sm">
          <Label htmlFor="fabricCount" className="text-sm font-medium mb-2 block text-[#3A3A3A]">
            Каунт основы
          </Label>
          <Input
            id="fabricCount"
            type="number"
            placeholder="14"
            value={projectData.coverFabricCount || 14}
            onChange={(e) => handleFabricCountChange(parseInt(e.target.value) || 14)}
            className="rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20"
          />
          <p className="text-xs text-[#5A6B54] mt-1.5">
            Например: 14, 16, 28
          </p>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border-[#8B9D83]/20 rounded-2xl shadow-sm">
          <Label htmlFor="threadCount" className="text-sm font-medium mb-2 block text-[#3A3A3A]">
            Стежок через
          </Label>
          <select
            id="threadCount"
            value={projectData.threadCount || 2}
            onChange={(e) => updateProjectData({ threadCount: parseInt(e.target.value) })}
            className="w-full bg-[#E8EDE6]/30 border border-[#B8C5B3]/30 rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20 px-3 py-2 pr-10 text-sm appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%236B6B6B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
            }}
          >
            <option value="1">1 нить</option>
            <option value="2">2 нити</option>
          </select>
          <p className="text-xs text-[#5A6B54] mt-1.5">
            {effectiveCount !== fabricCount ? (
              <span>Эфф. каунт: {effectiveCount}</span>
            ) : (
              <span>&nbsp;</span>
            )}
          </p>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border-[#8B9D83]/20 rounded-2xl shadow-sm">
          <Label htmlFor="flossRange" className="text-sm font-medium mb-2 block text-[#3A3A3A]">
            Палитра мулине
          </Label>
          <Input
            id="flossRange"
            list="flossRangeList"
            placeholder="DMC"
            value={projectData.flossRange || ''}
            onChange={(e) => updateProjectData({ flossRange: e.target.value })}
            className="rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20"
          />
          <datalist id="flossRangeList">
            <option value="DMC" />
            <option value="Royal" />
            <option value="Airo" />
            <option value="CXC" />
            <option value="Гамма" />
            <option value="Anchor" />
            <option value="Madeira" />
          </datalist>
          <p className="text-xs text-[#5A6B54] mt-1.5">
            DMC, Royal, CXC, Гамма
          </p>
        </Card>

        <Card className="p-4 bg-white/80 backdrop-blur-md border-[#8B9D83]/20 rounded-2xl shadow-sm">
          <Label htmlFor="colorCount" className="text-sm font-medium mb-2 block text-[#3A3A3A]">
            Количество цветов
          </Label>
          <Input
            id="colorCount"
            type="number"
            placeholder="25"
            value={projectData.colorCount || ''}
            onChange={(e) => updateProjectData({ colorCount: parseInt(e.target.value) || 0 })}
            className="rounded-xl focus:border-[#8B9D83] focus:ring-[#8B9D83]/20"
          />
          <p className="text-xs text-[#5A6B54] mt-1.5">
            Число цветов в схеме
          </p>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 h-14 rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Продолжить
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}