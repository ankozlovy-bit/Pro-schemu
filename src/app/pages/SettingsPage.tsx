import { ArrowLeft, User, Palette, FileText, Globe, Plus, X, QrCode, Upload, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { GlobalSettings, SavedQRCode } from '../types';
import { AVAILABLE_LANGUAGES, SupportedLanguage } from '../utils/keyGeneratorTranslations';
import { toast } from 'sonner';

type Page = 'home' | 'workflow' | 'key-generator' | 'history' | 'settings';

interface SettingsPageProps {
  onNavigate: (page: Page, fromStep?: number) => void;
  settings?: GlobalSettings;
  onSaveSettings?: (settings: GlobalSettings) => void;
  previousPage?: Page;
}

// Default preset QR codes
const DEFAULT_PRESETS: SavedQRCode[] = [
  { id: 'preset-vk', name: 'Группа ВК', image: '', isPreset: true },
  { id: 'preset-boosty', name: 'Boosty', image: '', isPreset: true },
  { id: 'preset-telegram', name: 'Чат Telegram', image: '', isPreset: true },
];

export default function SettingsPage({ onNavigate, settings, onSaveSettings, previousPage = 'home' }: SettingsPageProps) {
  const [designerNames, setDesignerNames] = useState<Record<string, string>>(
    settings?.designerNames || { ru: settings?.designerNameRU || '', en: settings?.designerNameEN || '' }
  );
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [activeLanguages, setActiveLanguages] = useState<SupportedLanguage[]>(['ru', 'en']);
  const [savedQRCodes, setSavedQRCodes] = useState<SavedQRCode[]>(() => {
    // Initialize with existing or default presets
    if (settings?.savedQRCodes && settings.savedQRCodes.length > 0) {
      return settings.savedQRCodes;
    }
    return DEFAULT_PRESETS;
  });

  // Initialize active languages from settings
  useEffect(() => {
    if (settings?.designerNames) {
      const langs = Object.keys(settings.designerNames) as SupportedLanguage[];
      setActiveLanguages(langs.length > 0 ? langs : ['ru', 'en']);
    }
  }, [settings]);

  const handleAddLanguage = (langCode: SupportedLanguage) => {
    if (!activeLanguages.includes(langCode)) {
      setActiveLanguages([...activeLanguages, langCode]);
      setDesignerNames({ ...designerNames, [langCode]: '' });
    }
    setShowLanguageDropdown(false);
  };

  const handleRemoveLanguage = (langCode: SupportedLanguage) => {
    if (langCode === 'ru') {
      toast.error('Русский язык обязателен');
      return;
    }
    setActiveLanguages(activeLanguages.filter(l => l !== langCode));
    const newNames = { ...designerNames };
    delete newNames[langCode];
    setDesignerNames(newNames);
  };

  const handleAddQRCode = () => {
    const newQRCode: SavedQRCode = {
      id: `qr-${Date.now()}`,
      name: 'Новый QR-код',
      image: '',
      isPreset: false,
    };
    setSavedQRCodes([...savedQRCodes, newQRCode]);
  };

  const handleDeleteQRCode = (id: string) => {
    setSavedQRCodes(savedQRCodes.filter(qr => qr.id !== id));
  };

  const handleQRNameChange = (id: string, name: string) => {
    setSavedQRCodes(savedQRCodes.map(qr => 
      qr.id === id ? { ...qr, name } : qr
    ));
  };

  const handleQRCodeImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSavedQRCodes(savedQRCodes.map(qr => 
        qr.id === id ? { ...qr, image: base64 } : qr
      ));
    };
    reader.onerror = () => {
      toast.error('Ошибка при чтении файла');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = () => {
    if (!designerNames.ru || designerNames.ru.trim() === '') {
      toast.error('Имя на русском обязательно для заполнения');
      return;
    }

    const newSettings: GlobalSettings = {
      language: settings?.language || 'RU',
      theme: settings?.theme || 'light',
      designerNameRU: designerNames.ru,
      designerNameEN: designerNames.en || '',
      designerNames: designerNames,
      qrGroupImage: settings?.qrGroupImage,
      qrTelegramImage: settings?.qrTelegramImage,
      savedQRCodes: savedQRCodes,
    };

    if (onSaveSettings) {
      onSaveSettings(newSettings);
      toast.success('Настройки сохранены');
      // Navigate to previous page after saving
      setTimeout(() => {
        onNavigate(previousPage);
      }, 500);
    }
  };

  const availableLanguagesToAdd = AVAILABLE_LANGUAGES.filter(
    lang => !activeLanguages.includes(lang.code)
  );

  const getLanguageLabel = (code: SupportedLanguage) => {
    const lang = AVAILABLE_LANGUAGES.find(l => l.code === code);
    return lang?.name.toLowerCase() || code;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3EE] via-[#F9F7F2] to-[#F2EFE8]">
      {/* Header */}
      <header className="relative z-10 px-6 py-8 md:px-12 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate(previousPage)}
              className="rounded-full border-[#2D2D2D]/20 hover:bg-[#8B9D83]/10"
            >
              <ArrowLeft className="w-5 h-5 text-[#2D2D2D]" />
            </Button>
            <div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl text-[#2D2D2D] tracking-tight"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Настройки
              </h1>
              <p className="mt-2 text-base md:text-lg text-[#6B6B6B] font-light">
                Настройте параметры приложения под себя
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12 md:px-12">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Settings Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border-2 border-[#8B9D83]/20 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B9D83] to-[#D4A89F] flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-accent)' }}>
                  Профиль дизайнера
                </h2>
                <p className="text-sm text-[#6B6B6B]">Укажите имя, которое будет отображаться в PDF</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Required Russian Name */}
              <div>
                <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                  Имя на русском <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={designerNames.ru || ''}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-[#8B9D83]/20 bg-white/50 focus:border-[#8B9D83] focus:outline-none transition-colors"
                  placeholder="Введите имя на русском"
                  onChange={(e) => setDesignerNames({ ...designerNames, ru: e.target.value })}
                />
              </div>

              {/* Other Active Languages */}
              {activeLanguages.filter(lang => lang !== 'ru').map(langCode => {
                const lang = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
                return (
                  <div key={langCode} className="relative">
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                      Имя на {getLanguageLabel(langCode)}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={designerNames[langCode] || ''}
                        className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-[#8B9D83]/20 bg-white/50 focus:border-[#8B9D83] focus:outline-none transition-colors"
                        placeholder={`Введите имя на ${getLanguageLabel(langCode)}`}
                        onChange={(e) => setDesignerNames({ ...designerNames, [langCode]: e.target.value })}
                      />
                      <button
                        onClick={() => handleRemoveLanguage(langCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                        title="Удалить язык"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add Language Button */}
              {availableLanguagesToAdd.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-[#8B9D83]/40 bg-white/30 hover:bg-[#E8EDE6]/30 hover:border-[#8B9D83]/60 text-[#8B9D83] font-medium transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Добавить язык</span>
                  </button>

                  {/* Language Dropdown */}
                  {showLanguageDropdown && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowLanguageDropdown(false)}
                      />
                      
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full mt-2 z-20 bg-white/95 backdrop-blur-xl rounded-2xl p-2 border-2 border-[#8B9D83]/20 shadow-xl min-w-[240px]">
                        {availableLanguagesToAdd.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => handleAddLanguage(lang.code)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#E8EDE6]/50 text-left transition-colors group"
                          >
                            <div>
                              <div className="font-medium text-[#2D2D2D]">{lang.nativeName}</div>
                              <div className="text-xs text-[#6B6B6B]">{lang.name}</div>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-[#8B9D83]/10 group-hover:bg-[#8B9D83] flex items-center justify-center transition-colors">
                              <Plus className="w-4 h-4 text-[#8B9D83] group-hover:text-white transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Info Message */}
              <div className="mt-6 p-4 bg-[#E8EDE6]/50 rounded-2xl border border-[#8B9D83]/30">
                <p className="text-sm text-[#2D2D2D]">
                  💡 <strong>Подсказка:</strong> Эти имена будут автоматически подставляться на первой странице workflow, на обложке и в генераторе ключа схемы в зависимости от выбранных языков.
                </p>
              </div>
            </div>
          </div>

          {/* QR Codes Library Card */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border-2 border-[#8B9D83]/20 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B9D83] to-[#D4A89F] flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'var(--font-accent)' }}>
                    Библиотека QR-кодов
                  </h2>
                  <p className="text-sm text-[#6B6B6B]">Настройте QR-коды для использования в проектах</p>
                </div>
              </div>
              <button
                onClick={handleAddQRCode}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-[#8B9D83]/40 bg-white hover:bg-[#E8EDE6]/30 text-[#8B9D83] font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {/* QR Codes List */}
              {savedQRCodes.map(qr => (
                <div key={qr.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#E8EDE6]/30 to-[#F4E7E7]/20 rounded-2xl border border-[#8B9D83]/20">
                  {/* QR Image Upload */}
                  <div className="relative w-20 h-20 rounded-xl bg-white border-2 border-dashed border-[#8B9D83]/30 overflow-hidden group cursor-pointer hover:border-[#8B9D83]/60 transition-all flex-shrink-0">
                    {qr.image && qr.image.trim() !== '' ? (
                      <img src={qr.image} alt={qr.name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-[#8B9D83]/60" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleQRCodeImageUpload(e, qr.id)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* QR Name Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={qr.name}
                      onChange={(e) => handleQRNameChange(qr.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#8B9D83]/20 bg-white/80 focus:border-[#8B9D83] focus:outline-none transition-colors"
                      placeholder="Название QR-кода"
                    />
                    {qr.isPreset && (
                      <p className="text-xs text-[#6B6B6B] mt-1 ml-1">Предустановленный шаблон</p>
                    )}
                  </div>

                  {/* Delete Button (only for custom QR codes) */}
                  {!qr.isPreset && (
                    <button
                      onClick={() => handleDeleteQRCode(qr.id)}
                      className="h-11 w-11 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors"
                      title="Удалить QR-код"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              {savedQRCodes.length === 0 && (
                <div className="text-center py-12 text-[#6B6B6B]">
                  <QrCode className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="text-base">Нет сохраненных QR-кодов</p>
                  <p className="text-sm mt-1">Нажмите "Добавить" для создания нового</p>
                </div>
              )}
            </div>

            {/* Info Message */}
            <div className="mt-6 p-4 bg-[#E8EDE6]/50 rounded-2xl border border-[#8B9D83]/30">
              <p className="text-sm text-[#5A6B54]">
                💡 <strong>Подсказка:</strong> Сохраненные QR-коды можно будет выбрать на шаге "Расход мулине" для добавления в PDF
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              variant="outline"
              onClick={() => onNavigate(previousPage)}
              className="px-8 py-6 rounded-2xl border-2 border-[#2D2D2D]/20 hover:bg-[#8B9D83]/10"
            >
              Отмена
            </Button>
            <button
              onClick={handleSaveSettings}
              className="px-8 py-6 rounded-2xl bg-gradient-to-r from-[#8B9D83] to-[#7A8C73] hover:from-[#7A8C73] hover:to-[#6B7D64] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ fontFamily: 'var(--font-accent)' }}
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}