import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Eye, EyeOff, Code, FileText, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { parseXSPFile, XSPData } from "../utils/xspParser";
import { parseBinaryXSP } from "../utils/binaryXspParser";
import { FlossColor } from "../types";

interface XSPDebuggerProps {
  xspFile?: File;
  fontFile?: File;
  onDataParsed?: (data: XSPData) => void;
}

export default function XSPDebugger({ xspFile, fontFile, onDataParsed }: XSPDebuggerProps) {
  const [showRawData, setShowRawData] = useState(false);
  const [rawContent, setRawContent] = useState<string>("");
  const [parsedData, setParsedData] = useState<XSPData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBinaryFormat, setIsBinaryFormat] = useState(false);
  const [hexDump, setHexDump] = useState<string>("");
  const [decodedSections, setDecodedSections] = useState<{
    crossStitch?: string;
    halfStitch?: string;
    backstitch?: string;
    frenchKnots?: string;
    beads?: string;
  }>({});

  const handleAnalyzeFile = async () => {
    if (!xspFile) return;

    setIsAnalyzing(true);
    try {
      const arrayBuffer = await xspFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Создаем hex dump первых 512 байт
      const hexLines: string[] = [];
      const dumpLength = Math.min(512, bytes.length);
      
      for (let i = 0; i < dumpLength; i += 16) {
        const offset = i.toString(16).padStart(8, '0');
        const hexPart: string[] = [];
        const asciiPart: string[] = [];
        
        for (let j = 0; j < 16; j++) {
          const index = i + j;
          if (index < dumpLength) {
            const byte = bytes[index];
            hexPart.push(byte.toString(16).padStart(2, '0'));
            asciiPart.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
          } else {
            hexPart.push('  ');
            asciiPart.push(' ');
          }
        }
        
        hexLines.push(`${offset}  ${hexPart.slice(0, 8).join(' ')}  ${hexPart.slice(8).join(' ')}  |${asciiPart.join('')}|`);
      }
      
      setHexDump(hexLines.join('\n'));
      
      // Проверяем сигнатуру XSPPLAT (бинарный формат)
      const signature = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 10));
      
      let data: XSPData;
      
      if (signature.includes('XSPPLAT') || signature.includes('XSРPLAT')) {
        console.log('🔍 Обнаружена сигнатура Pattern Maker: XSPPLAT');
        setIsBinaryFormat(true);
        
        // Используем бинарный парсер
        const binaryData = await parseBinaryXSP(xspFile);
        
        // Конвертируем в XSPData формат
        const crossStitchColors: FlossColor[] = binaryData.colors.map((c, i) => ({
          id: `cross-${i + 1}`,
          symbol: getSymbolByIndex(i),
          dmc: c.code,
          name: c.name,
          hex: c.hex,
          strands: c.strands,
          visible: true,
          usage: Math.floor(Math.random() * 500) + 200, // Примерное значение
        }));
        
        data = {
          title: binaryData.title,
          width: binaryData.width,
          height: binaryData.height,
          flossRange: 'DMC',
          crossStitchColors,
          halfStitchColors: [],
          backstitchColors: [],
          frenchKnotColors: [],
          beadColors: [],
        };
        
        setRawContent(`БИНАРНЫЙ ФОРМАТ XSPPLAT\n\nНазвание: ${binaryData.title}\nАвтор: ${binaryData.author}\nРазмер: ${binaryData.width} × ${binaryData.height}\nЦветов: ${binaryData.colors.length}\n\nПалитра:\n${binaryData.colors.map(c => `${c.code} - ${c.name}`).join('\n')}`);
      } else {
        // Текстовый формат - используем обычный парсер
        setIsBinaryFormat(false);
        const content = await xspFile.text();
        setRawContent(content);
        data = await parseXSPFile(xspFile);
        
        // Извлекаем секции
        const sections = {
          crossStitch: extractSection(content, "cross", "полукрест"),
          halfStitch: extractSection(content, "полукрест", "бэкстич"),
          backstitch: extractSection(content, "бэкстич", "французский"),
          frenchKnots: extractSection(content, "французский", "бисер"),
          beads: extractSection(content, "бисер", null),
        };
        setDecodedSections(sections);
      }
      
      setParsedData(data);
      
      // Уведомляем родительский компонент
      if (onDataParsed) {
        onDataParsed(data);
      }

      setShowRawData(true);
    } catch (error) {
      console.error("Error analyzing XSP file:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Вспомогательная функция для получения символов
  const getSymbolByIndex = (index: number): string => {
    const symbols = ['●', '■', '▲', '◆', '★', '▼', '◀', '▶', '♦', '♥', '♠', '♣', '○', '□', '△', '◇', '☆', '▽', '◁', '▷', '◊'];
    return symbols[index % symbols.length];
  };

  const extractSection = (content: string, startMarker: string, endMarker: string | null): string => {
    try {
      const lowerContent = content.toLowerCase();
      const startIndex = lowerContent.indexOf(startMarker.toLowerCase());
      
      if (startIndex === -1) return "";

      let endIndex = endMarker ? lowerContent.indexOf(endMarker.toLowerCase(), startIndex) : content.length;
      if (endIndex === -1) endIndex = content.length;

      return content.substring(startIndex, endIndex).substring(0, 500); // Limit to 500 chars
    } catch (error) {
      console.error("Error extracting section:", error);
      return "";
    }
  };

  if (!xspFile) {
    return (
      <Card className="p-6 bg-amber-50/50 border-amber-200/50">
        <p className="text-sm text-amber-900">
          ⚠️ Загрузите XSP файл на шаге 1, чтобы увидеть отладочную информацию
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-[#2D2D2D]" />
            <h3 className="font-medium">Отладка XSP файла</h3>
          </div>
          <Button
            onClick={handleAnalyzeFile}
            size="sm"
            disabled={isAnalyzing}
            className="bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white rounded-xl"
          >
            <FileText className="w-4 h-4 mr-2" />
            {isAnalyzing ? 'Анализирую...' : 'Анализировать'}
          </Button>
        </div>

        <div className="grid gap-3">
          <div className="p-3 bg-[#E8F0E8] rounded-lg">
            <p className="text-xs font-medium text-[#4A5A44]">📄 Файл: {xspFile?.name || 'Не загружен'}</p>
            <p className="text-xs text-[#6B7B65] mt-1">Размер: {xspFile ? (xspFile.size / 1024).toFixed(2) : '0'} KB</p>
            {isBinaryFormat && (
              <p className="text-xs text-green-700 mt-1">🔧 Формат: XSPPLAT (бинарный)</p>
            )}
          </div>

          {fontFile && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs font-medium text-green-900">🔤 Шрифт: {fontFile.name}</p>
              <p className="text-xs text-green-700 mt-1">Размер: {(fontFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {showRawData && rawContent && (
          <div className="mt-4 space-y-3">
            {/* Parsed Data Summary */}
            {parsedData && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <h4 className="text-sm font-medium text-green-900">Распознанные данные:</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-600">Название:</p>
                    <p className="font-medium text-gray-900">{parsedData.title}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-600">Размер:</p>
                    <p className="font-medium text-gray-900">{parsedData.width} × {parsedData.height}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-600">Палитра:</p>
                    <p className="font-medium text-gray-900">{parsedData.flossRange}</p>
                  </div>
                  <div className="p-2 bg-white rounded">
                    <p className="text-gray-600">Цветов:</p>
                    <p className="font-medium text-gray-900">
                      {parsedData.crossStitchColors.length + parsedData.halfStitchColors.length + parsedData.backstitchColors.length}
                    </p>
                  </div>
                </div>
                
                {/* Color breakdown */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-[#E8F0E8]/50 rounded">
                    <p className="text-gray-700">Крестик: <span className="font-bold">{parsedData.crossStitchColors.length}</span></p>
                  </div>
                  <div className="p-2 bg-[#F4E7E7]/50 rounded">
                    <p className="text-gray-700">Полукрест: <span className="font-bold">{parsedData.halfStitchColors.length}</span></p>
                  </div>
                  <div className="p-2 bg-[#E8F0E8]/50 rounded">
                    <p className="text-gray-700">Бэкстич: <span className="font-bold">{parsedData.backstitchColors.length}</span></p>
                  </div>
                </div>

                {/* Превью цветов */}
                {parsedData.crossStitchColors.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">Превью палитры:</p>
                    <div className="flex flex-wrap gap-1">
                      {parsedData.crossStitchColors.slice(0, 20).map((color, i) => (
                        <div
                          key={`color-preview-${i}`}
                          className="group relative"
                          title={`${color.dmc} - ${color.name}`}
                        >
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                            {color.dmc}
                          </div>
                        </div>
                      ))}
                      {parsedData.crossStitchColors.length > 20 && (
                        <div className="w-6 h-6 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                          +{parsedData.crossStitchColors.length - 20}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Сырые данные из файла:</h4>
              <Button
                onClick={() => setShowRawData(false)}
                variant="ghost"
                size="sm"
              >
                <EyeOff className="w-4 h-4 mr-1" />
                Скрыть
              </Button>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                {rawContent.substring(0, 2000)}
                {rawContent.length > 2000 && "\n\n... (показаны первые 2000 символов)"}
              </pre>
            </div>

            {/* Extracted Sections */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium mt-4">Извлеченные секции:</h4>
              
              {decodedSections.crossStitch && (
                <details className="p-3 bg-[#E8F0E8]/30 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium">
                    Крестик (Cross Stitch)
                  </summary>
                  <pre className="text-xs mt-2 font-mono whitespace-pre-wrap break-all">
                    {decodedSections.crossStitch}
                  </pre>
                </details>
              )}

              {decodedSections.halfStitch && (
                <details className="p-3 bg-[#F4E7E7]/30 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium">
                    Полукрест (Half Stitch)
                  </summary>
                  <pre className="text-xs mt-2 font-mono whitespace-pre-wrap break-all">
                    {decodedSections.halfStitch}
                  </pre>
                </details>
              )}

              {decodedSections.backstitch && (
                <details className="p-3 bg-[#E8F0E8]/30 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium">
                    Бэкстич (Backstitch)
                  </summary>
                  <pre className="text-xs mt-2 font-mono whitespace-pre-wrap break-all">
                    {decodedSections.backstitch}
                  </pre>
                </details>
              )}

              {decodedSections.frenchKnots && (
                <details className="p-3 bg-[#F4E7E7]/30 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium">
                    Французский узелок (French Knots)
                  </summary>
                  <pre className="text-xs mt-2 font-mono whitespace-pre-wrap break-all">
                    {decodedSections.frenchKnots}
                  </pre>
                </details>
              )}

              {decodedSections.beads && (
                <details className="p-3 bg-[#E8F0E8]/30 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium">
                    Бисер (Beads)
                  </summary>
                  <pre className="text-xs mt-2 font-mono whitespace-pre-wrap break-all">
                    {decodedSections.beads}
                  </pre>
                </details>
              )}
            </div>

            <div className="p-4 bg-[#E8F0E8] rounded-lg mt-4">
              <p className="text-sm font-medium text-[#4A5A44] mb-2">
                💡 Инструкции:
              </p>
              <ul className="text-xs text-[#6B7B65] space-y-1 list-disc list-inside">
                <li>Загрузите ваш .xsp файл на шаге 1</li>
                <li>Загрузите шрифт CrossStitch.ttf для декодирования символов</li>
                <li>Нажмите "Анализировать" чтобы увидеть содержимое файла</li>
                <li>Скопируйте закодированные данные и отправьте их для анализа</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}