import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from './ui/input';

interface AdvancedColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSV {
  h: number;
  s: number;
  v: number;
}

export default function AdvancedColorPicker({ value, onChange }: AdvancedColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [rgb, setRgb] = useState<RGB>({ r: 232, g: 240, b: 232 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hueCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingCanvas = useRef(false);
  const isDraggingHue = useRef(false);

  // Convert HEX to RGB
  const hexToRgb = (hex: string): RGB => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number): HSV => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    const s = max === 0 ? 0 : d / max;
    const v = max;
    let h = 0;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
  };

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number): RGB => {
    h = h / 360;
    s = s / 100;
    v = v / 100;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    let r = 0, g = 0, b = 0;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Initialize from HEX value
  useEffect(() => {
    const rgbColor = hexToRgb(value);
    const hsv = rgbToHsv(rgbColor.r, rgbColor.g, rgbColor.b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    setRgb(rgbColor);
  }, [value]);

  // Draw saturation/brightness canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Fill with hue color
    const hueRgb = hsvToRgb(hue, 100, 100);
    ctx.fillStyle = `rgb(${hueRgb.r}, ${hueRgb.g}, ${hueRgb.b})`;
    ctx.fillRect(0, 0, width, height);

    // Add white gradient (saturation)
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    whiteGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // Add black gradient (brightness)
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    blackGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  // Draw hue slider
  const drawHueCanvas = useCallback(() => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ff0000');
    gradient.addColorStop(0.17, '#ff00ff');
    gradient.addColorStop(0.34, '#0000ff');
    gradient.addColorStop(0.51, '#00ffff');
    gradient.addColorStop(0.68, '#00ff00');
    gradient.addColorStop(0.85, '#ffff00');
    gradient.addColorStop(1, '#ff0000');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    drawHueCanvas();
  }, [drawHueCanvas]);

  // Update color from HSV
  const updateColor = useCallback((h: number, s: number, v: number) => {
    const newRgb = hsvToRgb(h, s, v);
    setRgb(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChange(hex);
  }, [onChange]);

  // Handle canvas click/drag
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newSaturation = (x / rect.width) * 100;
    const newBrightness = 100 - (y / rect.height) * 100;

    setSaturation(Math.max(0, Math.min(100, newSaturation)));
    setBrightness(Math.max(0, Math.min(100, newBrightness)));
    updateColor(hue, newSaturation, newBrightness);
  };

  // Handle hue slider click/drag
  const handleHueInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const newHue = (y / rect.height) * 360;

    setHue(Math.max(0, Math.min(360, newHue)));
    updateColor(newHue, saturation, brightness);
  };

  // Handle RGB input change
  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newRgb = { ...rgb, [channel]: numValue };
    setRgb(newRgb);
    
    const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    onChange(hex);
  };

  // Handle HEX input change
  const handleHexChange = (hexValue: string) => {
    // Clean input - allow only valid hex characters
    let cleanHex = hexValue.replace(/[^0-9A-Fa-f#]/g, '');
    
    // Ensure it starts with #
    if (!cleanHex.startsWith('#')) {
      cleanHex = '#' + cleanHex;
    }
    
    // Limit to 7 characters (#RRGGBB)
    if (cleanHex.length > 7) {
      cleanHex = cleanHex.slice(0, 7);
    }
    
    // Only update if it's a valid hex color
    if (cleanHex.length === 7) {
      const newRgb = hexToRgb(cleanHex);
      setRgb(newRgb);
      
      const hsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
      setHue(hsv.h);
      setSaturation(hsv.s);
      setBrightness(hsv.v);
      
      onChange(cleanHex.toUpperCase());
    }
  };

  // Mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingCanvas.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newSaturation = (x / rect.width) * 100;
        const newBrightness = 100 - (y / rect.height) * 100;

        setSaturation(Math.max(0, Math.min(100, newSaturation)));
        setBrightness(Math.max(0, Math.min(100, newBrightness)));
        updateColor(hue, newSaturation, newBrightness);
      }

      if (isDraggingHue.current && hueCanvasRef.current) {
        const rect = hueCanvasRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const newHue = (y / rect.height) * 360;

        setHue(Math.max(0, Math.min(360, newHue)));
        updateColor(newHue, saturation, brightness);
      }
    };

    const handleMouseUp = () => {
      isDraggingCanvas.current = false;
      isDraggingHue.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [hue, saturation, brightness, updateColor]);

  return (
    <div className="space-y-3">
      {/* Color Preview */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center">
          <p className="text-xs text-[#6B6B6B] mb-1">Новый</p>
          <div 
            className="h-12 rounded-xl border-2 border-[#2D2D2D]/10"
            style={{ backgroundColor: rgbToHex(rgb.r, rgb.g, rgb.b) }}
          />
        </div>
        <div className="text-center">
          <p className="text-xs text-[#6B6B6B] mb-1">Текущий</p>
          <div 
            className="h-12 rounded-xl border-2 border-[#2D2D2D]/10"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>

      {/* Main picker area */}
      <div className="flex gap-3">
        {/* Saturation/Brightness Canvas */}
        <div className="relative flex-1">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="w-full h-48 rounded-xl cursor-crosshair border-2 border-[#2D2D2D]/10"
            onMouseDown={(e) => {
              isDraggingCanvas.current = true;
              handleCanvasInteraction(e);
            }}
            onClick={handleCanvasInteraction}
          />
          {/* Cursor indicator */}
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full pointer-events-none shadow-lg"
            style={{
              left: `${saturation}%`,
              top: `${100 - brightness}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
            }}
          />
        </div>

        {/* Hue Slider */}
        <div className="relative">
          <canvas
            ref={hueCanvasRef}
            width={20}
            height={200}
            className="w-6 h-48 rounded-lg cursor-pointer border-2 border-[#2D2D2D]/10"
            onMouseDown={(e) => {
              isDraggingHue.current = true;
              handleHueInteraction(e);
            }}
            onClick={handleHueInteraction}
          />
          {/* Hue indicator */}
          <div
            className="absolute left-0 right-0 h-1 bg-white border border-[#2D2D2D] pointer-events-none"
            style={{
              top: `${(hue / 360) * 100}%`,
              transform: 'translateY(-50%)'
            }}
          />
        </div>
      </div>

      {/* RGB Inputs */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Красный</label>
          <Input
            type="number"
            min="0"
            max="255"
            value={rgb.r}
            onChange={(e) => handleRgbChange('r', e.target.value)}
            className="text-center bg-[#E8F0E8]/20 border-[#2D2D2D]/20 rounded-xl h-9 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Зелёный</label>
          <Input
            type="number"
            min="0"
            max="255"
            value={rgb.g}
            onChange={(e) => handleRgbChange('g', e.target.value)}
            className="text-center bg-[#E8F0E8]/20 border-[#2D2D2D]/20 rounded-xl h-9 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-[#6B6B6B] mb-1 block">Синий</label>
          <Input
            type="number"
            min="0"
            max="255"
            value={rgb.b}
            onChange={(e) => handleRgbChange('b', e.target.value)}
            className="text-center bg-[#E8F0E8]/20 border-[#2D2D2D]/20 rounded-xl h-9 text-sm"
          />
        </div>
      </div>

      {/* HEX Input */}
      <div>
        <label className="text-xs text-[#6B6B6B] mb-1 block">HEX</label>
        <Input
          type="text"
          value={rgbToHex(rgb.r, rgb.g, rgb.b)}
          onChange={(e) => handleHexChange(e.target.value)}
          className="text-center bg-[#E8F0E8]/20 border-[#2D2D2D]/20 rounded-xl h-9 text-sm font-mono uppercase"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
}