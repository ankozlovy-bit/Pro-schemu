import { useState, useCallback } from 'react';
import { Check, Languages } from 'lucide-react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { AVAILABLE_LANGUAGES, SupportedLanguage } from '../utils/keyGeneratorTranslations';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onChange: (languages: string[]) => void;
  maxLanguages?: number;
}

export default function LanguageSelector({ 
  selectedLanguages, 
  onChange,
  maxLanguages = 5
}: LanguageSelectorProps) {
  const [hoverLang, setHoverLang] = useState<string | null>(null);

  const handleToggleLanguage = useCallback((langCode: SupportedLanguage) => {
    if (selectedLanguages.includes(langCode)) {
      // Remove language
      onChange(selectedLanguages.filter(l => l !== langCode));
    } else {
      // Add language (if under max limit)
      if (selectedLanguages.length < maxLanguages) {
        onChange([...selectedLanguages, langCode]);
      }
    }
  }, [selectedLanguages, onChange, maxLanguages]);

  const moveLanguageUp = useCallback((langCode: string) => {
    const index = selectedLanguages.indexOf(langCode);
    if (index > 0) {
      const newLanguages = [...selectedLanguages];
      [newLanguages[index - 1], newLanguages[index]] = [newLanguages[index], newLanguages[index - 1]];
      onChange(newLanguages);
    }
  }, [selectedLanguages, onChange]);

  const moveLanguageDown = useCallback((langCode: string) => {
    const index = selectedLanguages.indexOf(langCode);
    if (index < selectedLanguages.length - 1 && index !== -1) {
      const newLanguages = [...selectedLanguages];
      [newLanguages[index], newLanguages[index + 1]] = [newLanguages[index + 1], newLanguages[index]];
      onChange(newLanguages);
    }
  }, [selectedLanguages, onChange]);

  return (
    <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#8B9D83]/20 rounded-3xl">
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Languages className="w-5 h-5 text-[#8B9D83]" />
          <div>
            <Label className="text-base font-medium text-[#3A3A3A]">
              Языки для генератора ключа
            </Label>
            <p className="text-sm text-[#5A5A5A] mt-1">
              Выберите до {maxLanguages} языков. Порядок имеет значение — переводы будут отображаться через " / "
            </p>
          </div>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguages.includes(lang.code);
            const position = selectedLanguages.indexOf(lang.code);
            const isDisabled = !isSelected && selectedLanguages.length >= maxLanguages;

            return (
              <button
                key={lang.code}
                onClick={() => !isDisabled && handleToggleLanguage(lang.code)}
                onMouseEnter={() => setHoverLang(lang.code)}
                onMouseLeave={() => setHoverLang(null)}
                disabled={isDisabled}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all duration-200
                  ${isSelected 
                    ? 'border-[#8B9D83] bg-[#E8EDE6]/50 shadow-sm' 
                    : isDisabled
                      ? 'border-[#D0D0D0]/30 bg-gray-50/30 cursor-not-allowed opacity-50'
                      : 'border-[#D0D0D0]/30 hover:border-[#8B9D83]/50 hover:bg-[#E8EDE6]/20 cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left flex-1">
                    <div className="font-medium text-[#3A3A3A] text-sm">
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-[#6B6B6B] mt-0.5">
                      {lang.name}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-[#8B9D83] flex items-center justify-center text-white text-xs font-bold">
                        {position + 1}
                      </div>
                      <Check className="w-4 h-4 text-[#8B9D83]" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Languages - Reorder */}
        {selectedLanguages.length > 0 && (
          <div className="mt-6 p-4 bg-[#E8EDE6]/30 rounded-2xl border border-[#8B9D83]/20">
            <Label className="text-sm font-medium text-[#3A3A3A] mb-3 block">
              Выбранные языки (порядок):
            </Label>
            <div className="space-y-2">
              {selectedLanguages.map((langCode, index) => {
                const lang = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
                if (!lang) return null;

                return (
                  <div
                    key={langCode}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#8B9D83]/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8B9D83] flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-[#3A3A3A] text-sm">
                          {lang.nativeName}
                        </div>
                        <div className="text-xs text-[#6B6B6B]">
                          {lang.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveLanguageUp(langCode)}
                        disabled={index === 0}
                        className={`p-1.5 rounded-lg transition-colors ${
                          index === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-[#8B9D83] hover:bg-[#E8EDE6]/50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveLanguageDown(langCode)}
                        disabled={index === selectedLanguages.length - 1}
                        className={`p-1.5 rounded-lg transition-colors ${
                          index === selectedLanguages.length - 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-[#8B9D83] hover:bg-[#E8EDE6]/50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview Example */}
        {selectedLanguages.length > 1 && (
          <div className="mt-4 p-4 bg-[#E8F0E8]/50 rounded-2xl border border-[#8B9D83]/30">
            <Label className="text-sm font-medium text-[#2D2D2D] mb-2 block">
              Пример отображения:
            </Label>
            <div className="text-sm text-[#2D2D2D] font-mono">
              {selectedLanguages.map((langCode, index) => {
                const lang = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
                return lang?.nativeName || langCode;
              }).join(' / ')}
            </div>
            <div className="text-xs text-[#8B9D83] mt-1">
              Например: "Цвет / Color / Farbe"
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}