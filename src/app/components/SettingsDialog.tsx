import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Settings as SettingsIcon, QrCode, User, Plus, Trash2 } from 'lucide-react';
import { GlobalSettings, SavedQRCode } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GlobalSettings;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
}

// Default preset QR codes
const DEFAULT_PRESETS: SavedQRCode[] = [
  { id: 'preset-vk', name: 'Группа ВК', image: '', isPreset: true },
  { id: 'preset-boosty', name: 'Boosty', image: '', isPreset: true },
  { id: 'preset-telegram', name: 'Чат Telegram', image: '', isPreset: true },
];

export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  updateSettings,
}: SettingsDialogProps) {
  const [savedQRCodes, setSavedQRCodes] = useState<SavedQRCode[]>(() => {
    // Initialize with existing or default presets
    if (settings.savedQRCodes && settings.savedQRCodes.length > 0) {
      return settings.savedQRCodes;
    }
    return DEFAULT_PRESETS;
  });

  // Sync with settings when dialog opens
  useEffect(() => {
    if (isOpen && settings.savedQRCodes) {
      setSavedQRCodes(settings.savedQRCodes);
    }
  }, [isOpen, settings.savedQRCodes]);

  const handleAddQRCode = () => {
    const newQRCode: SavedQRCode = {
      id: `qr-${Date.now()}`,
      name: 'Новый QR-код',
      image: '',
      isPreset: false,
    };
    const updated = [...savedQRCodes, newQRCode];
    setSavedQRCodes(updated);
  };

  const handleDeleteQRCode = (id: string) => {
    const updated = savedQRCodes.filter(qr => qr.id !== id);
    setSavedQRCodes(updated);
  };

  const handleQRNameChange = (id: string, name: string) => {
    const updated = savedQRCodes.map(qr => 
      qr.id === id ? { ...qr, name } : qr
    );
    setSavedQRCodes(updated);
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
      const updated = savedQRCodes.map(qr => 
        qr.id === id ? { ...qr, image: base64 } : qr
      );
      setSavedQRCodes(updated);
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Save QR codes to global settings
    updateSettings({ savedQRCodes });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-[#2D2D2D]/60 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
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
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif text-[#2D2D2D]">Настройки</h2>
                  <p className="text-sm text-[#6B6B6B]">Глобальные параметры проекта</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full w-10 h-10 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-5">
              {/* Designer Names */}
              <Card className="p-5 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E8F0E8] to-[#F4E7E7] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#2D2D2D]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#2D2D2D]">Имя дизайнера</h3>
                    <p className="text-xs text-[#6B6B6B]">Будет использоваться во всех проектах</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="designerRU" className="text-xs">На русском</Label>
                    <Input
                      id="designerRU"
                      placeholder="Анна Иванова"
                      value={settings.designerNameRU || ''}
                      onChange={(e) => updateSettings({ designerNameRU: e.target.value })}
                      className="mt-1.5 bg-[#E8F0E8]/20 border-[#2D2D2D]/20 rounded-xl h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="designerEN" className="text-xs">На английском</Label>
                    <Input
                      id="designerEN"
                      placeholder="Anna Ivanova"
                      value={settings.designerNameEN || ''}
                      onChange={(e) => updateSettings({ designerNameEN: e.target.value })}
                      className="mt-1.5 bg-[#E8F0E8]/20 border-[#2D2D2D]/20 rounded-xl h-9"
                    />
                  </div>
                </div>
              </Card>

              {/* QR Codes Library */}
              <Card className="p-5 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E8F0E8] to-[#F4E7E7] flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-[#2D2D2D]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-[#2D2D2D]">Библиотека QR-кодов</h3>
                    <p className="text-xs text-[#6B6B6B]">Настройте QR-коды для использования в проектах</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddQRCode}
                    className="rounded-2xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Добавить
                  </Button>
                </div>

                {/* QR Codes List */}
                <div className="space-y-3">
                  {savedQRCodes.map((qr, index) => (
                    <div key={qr.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#E8F0E8]/20 to-[#F4E7E7]/20 rounded-2xl border border-[#2D2D2D]/10">
                      {/* QR Image Upload */}
                      <div className="relative w-16 h-16 rounded-lg bg-white border-2 border-dashed border-[#2D2D2D]/20 overflow-hidden group cursor-pointer hover:border-[#2D2D2D]/40 transition-all flex-shrink-0">
                        {qr.image && qr.image.trim() !== '' ? (
                          <img src={qr.image} alt={qr.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Upload className="w-5 h-5 text-[#6B6B6B]" />
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
                        <Input
                          value={qr.name}
                          onChange={(e) => handleQRNameChange(qr.id, e.target.value)}
                          className="bg-white/80 border-[#2D2D2D]/20 rounded-xl h-10"
                          placeholder="Название QR-кода"
                        />
                        {qr.isPreset && (
                          <p className="text-xs text-[#6B6B6B] mt-1">Предустановленный шаблон</p>
                        )}
                      </div>

                      {/* Delete Button (only for custom QR codes) */}
                      {!qr.isPreset && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQRCode(qr.id)}
                          className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {savedQRCodes.length === 0 && (
                    <div className="text-center py-8 text-[#6B6B6B]">
                      <QrCode className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">Нет сохраненных QR-кодов</p>
                      <p className="text-xs mt-1">Нажмите "Добавить" для создания нового</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-4 p-3 bg-[#E8F0E8]/30 border border-[#8B9D83]/20 rounded-xl">
                  <p className="text-xs text-[#2D2D2D]">
                    💡 <strong>Подсказка:</strong> Сохраненные QR-коды можно будет выбрать на шаге "Расход мулине" для добавления в PDF
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-[#2D2D2D]/10 bg-[#FCFAF9]">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-2xl border-[#2D2D2D]/20"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                className="rounded-2xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}