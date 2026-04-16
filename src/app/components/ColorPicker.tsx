import { useState, useRef, useEffect } from 'react';
import { Pipette, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import AdvancedColorPicker from './AdvancedColorPicker';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  recentColors?: string[];
  onAddRecent?: (color: string) => void;
  presetColors?: { name: string; value: string }[];
}

const PRESET_COLORS = [
  { name: "Soft Sage", value: "#E8F0E8" },
  { name: "Dusty Rose", value: "#F4E7E7" },
  { name: "Warm Off-White", value: "#FCFAF9" },
  { name: "Deep Charcoal", value: "#2D2D2D" },
  { name: "Lavender Mist", value: "#E6E6FA" },
  { name: "Peachy Cream", value: "#FFE5CC" },
  { name: "Mint Fresh", value: "#D4F1E8" },
  { name: "Soft Gray", value: "#E0E0E0" },
  { name: "Pure White", value: "#FFFFFF" },
  { name: "Pure Black", value: "#000000" },
  { name: "Navy Blue", value: "#1E3A5F" },
  { name: "Dark Brown", value: "#3E2723" },
];

export default function ColorPicker({ 
  label, 
  value, 
  onChange, 
  recentColors = [],
  onAddRecent,
  presetColors 
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use custom presets if provided, otherwise use defaults
  const colors = presetColors || PRESET_COLORS;

  useEffect(() => {
    setCustomColor(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    if (onAddRecent && !recentColors.includes(color)) {
      onAddRecent(color);
    }
    setIsOpen(false);
  };

  const handleCustomColorChange = (newColor: string) => {
    setCustomColor(newColor);
  };

  const handleCustomColorApply = () => {
    onChange(customColor);
    if (onAddRecent && !recentColors.includes(customColor)) {
      onAddRecent(customColor);
    }
    setIsOpen(false);
  };

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
    <div className="relative" ref={dropdownRef}>
      <Label className="text-sm mb-2 block">{label}</Label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 px-4 flex items-center gap-3 bg-[#E8F0E8]/30 border-2 border-[#2D2D2D]/20 rounded-2xl hover:border-[#2D2D2D]/40 transition-all"
      >
        <div 
          className="w-8 h-8 rounded-xl border-2 border-white shadow-sm flex-shrink-0"
          style={{ 
            backgroundColor: value,
            boxShadow: isLightColor(value) 
              ? "inset 0 0 0 1px rgba(45, 45, 45, 0.1)" 
              : "none"
          }}
        />
        <Pipette className="w-4 h-4 text-[#6B6B6B] ml-auto" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 bottom-full mb-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-[#2D2D2D]/10 p-4 max-h-[600px] overflow-y-auto"
        >
          {/* Current Color Display */}
          <div className="mb-4 p-3 bg-[#E8F0E8]/20 rounded-xl">
            <p className="text-xs text-[#6B6B6B] mb-2 font-medium">Текущий цвет</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl border-2 border-[#2D2D2D]/20"
                style={{ 
                  backgroundColor: value,
                  boxShadow: isLightColor(value) 
                    ? "inset 0 0 0 1px rgba(45, 45, 45, 0.1)" 
                    : "none"
                }}
              />
              <span className="text-sm text-[#2D2D2D] font-mono">{value}</span>
            </div>
          </div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-[#6B6B6B] mb-2 font-medium">Недавние</p>
              <div className="grid grid-cols-6 gap-2">
                {recentColors.slice(0, 6).map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className="relative h-10 rounded-xl border-2 transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: color,
                      borderColor: value === color ? '#2D2D2D' : 'transparent',
                      boxShadow: isLightColor(color)
                        ? "inset 0 0 0 1px rgba(45, 45, 45, 0.1)" 
                        : "none"
                    }}
                    title={color}
                  >
                    {value === color && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preset Colors */}
          <div className="mb-4">
            <p className="text-xs text-[#6B6B6B] mb-2 font-medium">Палитра</p>
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color.value)}
                  className="relative h-10 rounded-xl border-2 transition-all hover:scale-110"
                  style={{ 
                    backgroundColor: color.value,
                    borderColor: value === color.value ? '#2D2D2D' : 'transparent',
                    boxShadow: isLightColor(color.value)
                      ? "inset 0 0 0 1px rgba(45, 45, 45, 0.1)" 
                      : "none"
                  }}
                  title={color.name}
                >
                  {value === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color */}
          <div>
            <p className="text-xs text-[#6B6B6B] mb-2 font-medium">Свой цвет</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div 
                  className="w-full h-10 rounded-xl border-2 border-[#2D2D2D]/20 cursor-pointer"
                  style={{ backgroundColor: customColor }}
                />
              </div>
              <Input
                type="text"
                value={customColor}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="flex-1 bg-[#E8F0E8]/20 border-[#2D2D2D]/20 rounded-xl h-10 font-mono text-sm"
                placeholder="#2D2D2D"
              />
              <Button
                type="button"
                onClick={handleCustomColorApply}
                size="sm"
                className="rounded-xl bg-[#2D2D2D] text-white hover:bg-[#2D2D2D]/90 px-4"
              >
                <Check className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Advanced Color Picker */}
          <div className="mt-4 pt-4 border-t border-[#2D2D2D]/10">
            <p className="text-xs text-[#6B6B6B] mb-3 font-medium">Спектр</p>
            <AdvancedColorPicker
              value={value}
              onChange={(color) => {
                onChange(color);
                setCustomColor(color);
                if (onAddRecent && !recentColors.includes(color)) {
                  onAddRecent(color);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}