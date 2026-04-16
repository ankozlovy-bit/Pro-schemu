import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Download, Languages, Type, User, Settings, History, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { GlobalSettings } from '../types';
import { StylePreset } from '../types/style-preset';
import { KeyGeneratorPreview } from './KeyGeneratorPreview';
import { generateRTFTemplate } from '../utils/rtf-generator';
import LanguageSelector from './LanguageSelector';
import { getMultiLangText, SupportedLanguage, AVAILABLE_LANGUAGES, getLanguageName } from '../utils/keyGeneratorTranslations';

interface KeyGeneratorProps {
  onClose: () => void;
  settings?: GlobalSettings;
}

// Style presets for 2026 trends
const stylePresets: StylePreset[] = [
  {
    id: 'minimalist-classic',
    name: 'Minimalist Classic',
    description: 'Pure elegance with monochrome palette',
    fontName: 'Times New Roman',  // Classic serif font with excellent readability for Russian
    fontSize: '24',
    fontWeight: 'normal',
    fontColor: '#1A1A1A',
    borderColor: '#1A1A1A',
    headerBgColor: '',  // Disabled - Cross Stitch exports with incorrect colors
    accentColor: '#000000'
  }
];

// Safe fonts list for RTF generation (100% compatible with Cross Stitch Professional Platinum)
const SAFE_RTF_FONTS = [
  { value: 'Arial', label: 'Arial (рекомендуется)', description: 'Самый надёжный шрифт' },
  { value: 'Times New Roman', label: 'Times New Roman', description: 'Классика для русского языка' },
  { value: 'Courier New', label: 'Courier New', description: 'Моноширинный шрифт' },
  { value: 'Verdana', label: 'Verdana', description: 'Отличная читаемость' },
  { value: 'Tahoma', label: 'Tahoma', description: 'Компактный и чёткий' },
  { value: 'Georgia', label: 'Georgia', description: 'Современный шрифт с засечками' },
] as const;

export default function KeyGenerator({ onClose, settings }: KeyGeneratorProps) {
  console.log('🔑 KeyGenerator rendered with props:', { onClose: typeof onClose, settings });
  
  const [designerName, setDesignerName] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']); // Changed to array
  const [selectedStyle] = useState(stylePresets[0]); // Minimalist Classic by default - fixed style

  // Memoize translations to prevent re-renders - now using multi-language function
  const currentTranslations = useMemo(() => {
    const languageCodes = selectedLanguages as SupportedLanguage[];
    return {
      key: getMultiLangText(languageCodes, 'mainTitle'),
      forDesign: getMultiLangText(languageCodes, 'forDesign'),
      designer: getMultiLangText(languageCodes, 'designer'),
      canvas: getMultiLangText(languageCodes, 'fabric'),
      size: getMultiLangText(languageCodes, 'size'),
      palette: getMultiLangText(languageCodes, 'palette'),
      warning: getMultiLangText(languageCodes, 'warningMessage'),
      cross: getMultiLangText(languageCodes, 'crossStitch'),
      color: getMultiLangText(languageCodes, 'color'),
      symbol: getMultiLangText(languageCodes, 'symbol'),
      colorNumber: getMultiLangText(languageCodes, 'colorNumber'),
      threads: getMultiLangText(languageCodes, 'threads'),
      halfCross: getMultiLangText(languageCodes, 'halfCrossStitch'),
      backstitch: getMultiLangText(languageCodes, 'backstitch'),
      frenchKnot: getMultiLangText(languageCodes, 'frenchKnots'),
      beads: getMultiLangText(languageCodes, 'beads'),
      paletteColor: getMultiLangText(languageCodes, 'paletteColor'),
      stitches: getMultiLangText(languageCodes, 'stitches'),
      count: getMultiLangText(languageCodes, 'count'),
      cmOr: getMultiLangText(languageCodes, 'cmOr'),
    };
  }, [selectedLanguages]);

  useEffect(() => {
    // Auto-fill designer name from global settings based on selected language
    const primaryLang = selectedLanguages[0];
    if (primaryLang === 'ru' && settings?.designerNameRU) {
      setDesignerName(settings.designerNameRU);
    } else if (primaryLang !== 'ru' && settings?.designerNameEN) {
      setDesignerName(settings.designerNameEN);
    }
  }, [selectedLanguages, settings]);

  const handleGenerate = () => {
    if (!designerName.trim()) {
      toast.error('Пожалуйста, введите имя дизайнера');
      return;
    }

    try {
      const translations = currentTranslations;
      const rtfContent = generateRTFTemplate(
        designerName,
        selectedStyle,
        translations
      );
      
      // Download RTF file
      const blob = new Blob([rtfContent], { type: 'application/rtf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const languagesSuffix = selectedLanguages.join('_');
      link.download = `pattern_key_${languagesSuffix}.rtf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(
        `Файл pattern_key_${languagesSuffix}.rtf успешно создан! Откройте его в Cross Stitch Professional Platinum.`,
        { duration: 5000 }
      );
    } catch (error) {
      console.error('Error generating RTF:', error);
      toast.error('Ошибка при генерации RTF файла');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF9] relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-[40%] -right-[20%] w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #E8F0E8 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-[40%] -left-[20%] w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #F4E7E7 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 px-6 py-8 md:px-12 md:py-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={onClose}
                className="rounded-full border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
              >
                <ArrowLeft className="w-5 h-5 text-[#2D2D2D]" />
              </Button>
              <div>
                <motion.h1
                  className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#2D2D2D] tracking-tight"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Генератор ключа схемы
                </motion.h1>
                <motion.p
                  className="mt-2 text-base md:text-lg text-[#6B6B6B] font-light"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Создание RTF-файлов для Cross Stitch Professional Platinum
                </motion.p>
              </div>
            </div>

            {/* Settings and History buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-[#2D2D2D]/20 hover:bg-[#F4E7E7]/50"
                onClick={() => toast.info('Настройки (в разработке)')}
              >
                <Settings className="w-5 h-5 text-[#2D2D2D]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
                onClick={() => toast.info('История (в разработке)')}
              >
                <History className="w-5 h-5 text-[#2D2D2D]" />
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <motion.main
        className="relative z-10 px-6 md:px-12 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Info card */}
          <motion.div
            className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 md:p-8 mb-8 shadow-lg border border-white/40"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E8F0E8]/80 flex items-center justify-center">
                <Download className="w-6 h-6 text-[#2D2D2D]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-medium text-[#2D2D2D] mb-2">
                  Создайте персонализированный ключ схемы
                </h2>
                <p className="text-[#6B6B6B] leading-relaxed mb-3">
                  Заполните форму ниже, выберите язык и стиль оформления. Мы сгенерируем готовый RTF-файл с таблицей символов для экспорта ключа в PDF из Cross Stitch Professional Platinum.
                </p>
                <div className="flex items-center gap-2 text-sm text-[#7FA87F] bg-[#E8F0E8]/50 px-3 py-2 rounded-lg">
                  <Type className="w-4 h-4 flex-shrink-0" />
                  <span>Используются только проверенные шрифты с полной поддержкой кириллицы</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-xl border border-white/40"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="space-y-8">
              {/* Designer name */}
              <div className="space-y-3">
                <Label htmlFor="designer-name" className="text-[#2D2D2D] font-medium flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Имя дизайнера
                </Label>
                <Input
                  id="designer-name"
                  value={designerName}
                  onChange={(e) => setDesignerName(e.target.value)}
                  placeholder="Введите ваше имя"
                  className="rounded-[16px] h-12 border-[#2D2D2D]/20 bg-white/80"
                />
              </div>

              {/* Language selector */}
              <div className="space-y-3">
                <Label className="text-[#2D2D2D] font-medium flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Языки заголовков
                </Label>
                <LanguageSelector
                  selectedLanguages={selectedLanguages}
                  onChange={setSelectedLanguages}
                  maxLanguages={5}
                />
                <p className="text-sm text-[#6B6B6B]">
                  Заголовки таблицы будут переведены на все выбранные языки через разделитель " / "
                </p>
              </div>

              {/* Customization tip */}
              <div className="p-6 rounded-[20px] bg-gradient-to-br from-[#E8F0E8]/40 to-[#F4E7E7]/40 border border-[#7FA87F]/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#7FA87F]/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-[#7FA87F]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#2D2D2D] mb-2">
                      Возможности настройки в Word
                    </h3>
                    <p className="text-sm text-[#6B6B6B] leading-relaxed">
                      Вы можете изменить цвет, размер, наименование шрифта, цвет линий границы таблицы, заливки шапки таблицы, удалить текст о затенении стежков или вставить на его место любой другой необходимый текст в редакторе Word после скачивания шаблона.
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Preview of RTF Export (Optimized) */}
              <div className="space-y-3">
                <Label className="text-[#2D2D2D] font-medium">
                  Предпросмотр экспорта ключа
                </Label>
                
                {/* Language Info Banner */}
                {selectedLanguages.length > 0 && (
                  <div className="p-4 bg-[#E8F0E8] rounded-xl border border-[#8B9D83]/30 flex items-center gap-3">
                    <Languages className="w-5 h-5 text-[#8B9D83] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#4A5A44]">
                        Мультиязычные заголовки активны
                      </div>
                      <div className="text-xs text-[#6B7B65] mt-1">
                        Языки: {selectedLanguages.map(lang => getLanguageName(lang as SupportedLanguage)).join(' → ')}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-8 rounded-[20px] bg-white/80 border border-[#2D2D2D]/10 max-h-[600px] overflow-y-auto">
                  <KeyGeneratorPreview
                    selectedLanguage={selectedLanguages[0] as SupportedLanguage}
                    selectedStyle={selectedStyle}
                    designerName={designerName}
                    translations={currentTranslations}
                    maxRows={5}
                  />
                </div>
                <p className="text-sm text-[#6B6B6B]">
                  Этот предпросмотр показывает первые несколько строк каждой таблицы. RTF файл будет содержать полные таблицы со всеми строками. В редакторе Word Вы сможете сами отредактировать файл в нужном стиле
                </p>
              </div>

              {/* Generate button */}
              <div className="pt-6 border-t border-[#2D2D2D]/10">
                <Button
                  onClick={handleGenerate}
                  className="w-full rounded-full h-14 bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 !text-white flex items-center justify-center gap-3 text-base md:text-base font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">Скачать RTF файл</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}