import { motion } from 'motion/react';
import { Ruler, Palette, Grid3x3 } from 'lucide-react';
import { Card } from './ui/card';
import type { BinaryXSPData } from '../utils/binaryXspParser';

interface PatternInfoCardProps {
  data: BinaryXSPData;
}

/**
 * Компонент для отображения информации о схеме вышивки
 * Показывает: название, автора, размеры, палитру, цвета по типам стежков
 */
export default function PatternInfoCard({ data }: PatternInfoCardProps) {
  // Вычисляем размеры в см (зависит от каунта канвы)
  const fabricCount = data.fabricCount || 14;
  const widthCm = ((data.width / fabricCount) * 2.54).toFixed(2);
  const heightCm = ((data.height / fabricCount) * 2.54).toFixed(2);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header - Название и автор */}
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[24px]">
        <div className="space-y-3">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-serif text-[#2D2D2D] mb-2">
              {data.title}
            </h2>
            <p className="text-base text-[#6B6B6B]">
              Дизайнер: <span className="font-medium text-[#2D2D2D]">{data.author}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Канва */}
        <Card className="p-5 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[20px]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F0E8] flex items-center justify-center flex-shrink-0">
              <Grid3x3 className="w-5 h-5 text-[#2D2D2D]" />
            </div>
            <div>
              <p className="text-sm text-[#6B6B6B] mb-1">Канва / Fabric</p>
              <p className="text-lg font-medium text-[#2D2D2D]">{fabricCount} каунта</p>
            </div>
          </div>
        </Card>

        {/* Размер */}
        <Card className="p-5 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[20px]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F4E7E7] flex items-center justify-center flex-shrink-0">
              <Ruler className="w-5 h-5 text-[#2D2D2D]" />
            </div>
            <div>
              <p className="text-sm text-[#6B6B6B] mb-1">Размер / Size</p>
              <p className="text-lg font-medium text-[#2D2D2D]">
                {widthCm} × {heightCm} см
              </p>
              <p className="text-xs text-[#6B6B6B]">
                или {data.width} × {data.height} стежков
              </p>
            </div>
          </div>
        </Card>

        {/* Палитра */}
        <Card className="p-5 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[20px]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F0E8] flex items-center justify-center flex-shrink-0">
              <Palette className="w-5 h-5 text-[#2D2D2D]" />
            </div>
            <div>
              <p className="text-sm text-[#6B6B6B] mb-1">Палитра / Colours</p>
              <p className="text-lg font-medium text-[#2D2D2D]">{data.flossBrand}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Таблицы цветов по типам стежков */}
      <div className="space-y-6">
        {/* Крест / Cross stitch */}
        {data.crossStitchColors && data.crossStitchColors.length > 0 && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[24px]">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">
              Крест / Cross stitch
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D2D2D]/10">
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Цвет</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Символ</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">№ цвета</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Нити</th>
                  </tr>
                </thead>
                <tbody>
                  {data.crossStitchColors.map((color, idx) => (
                    <tr key={idx} className="border-b border-[#2D2D2D]/5 hover:bg-[#E8F0E8]/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-[#2D2D2D]/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs text-[#6B6B6B]">{color.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-base font-medium">{color.symbol || '-'}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-[#2D2D2D]">{color.code}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[#6B6B6B]">{color.strands}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Полукрест / Half Cross Stitches */}
        {data.halfStitchColors && data.halfStitchColors.length > 0 && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[24px]">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">
              Полукрест / Half Cross Stitches
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D2D2D]/10">
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Цвет</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Символ</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">№ цвета</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Нити</th>
                  </tr>
                </thead>
                <tbody>
                  {data.halfStitchColors.map((color, idx) => (
                    <tr key={idx} className="border-b border-[#2D2D2D]/5 hover:bg-[#F4E7E7]/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-[#2D2D2D]/20"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs text-[#6B6B6B]">{color.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-base font-medium">{color.symbol || '-'}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-[#2D2D2D]">{color.code}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[#6B6B6B]">{color.strands}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Бэкстич (шов назад иголку) / Backstitch */}
        {data.backstitchColors && data.backstitchColors.length > 0 && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[24px]">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">
              Бэкстич (шов назад иголку) / Backstitch
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D2D2D]/10">
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Цвет</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">№ цвета</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Нити</th>
                  </tr>
                </thead>
                <tbody>
                  {data.backstitchColors.map((color, idx) => (
                    <tr key={idx} className="border-b border-[#2D2D2D]/5 hover:bg-[#E8F0E8]/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 w-16">
                            <div
                              className="w-full h-0.5 rounded"
                              style={{ backgroundColor: color.hex }}
                            />
                          </div>
                          <span className="text-xs text-[#6B6B6B]">{color.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-[#2D2D2D]">{color.code}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[#6B6B6B]">{color.strands}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Французский узелок / French Knots */}
        {data.frenchKnotColors && data.frenchKnotColors.length > 0 && (
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[24px]">
            <h3 className="text-lg font-medium text-[#2D2D2D] mb-4">
              Французский узелок / French Knots
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2D2D2D]/10">
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Символ</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">№ цвета</th>
                    <th className="text-left py-2 px-3 font-medium text-[#6B6B6B]">Нити</th>
                  </tr>
                </thead>
                <tbody>
                  {data.frenchKnotColors.map((color, idx) => (
                    <tr key={idx} className="border-b border-[#2D2D2D]/5 hover:bg-[#F4E7E7]/30 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xl font-medium"
                            style={{ color: color.hex }}
                          >
                            {color.symbol || '●'}
                          </span>
                          <span className="text-xs text-[#6B6B6B]">{color.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-[#2D2D2D]">{color.code}</span>
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-[#6B6B6B]">{color.strands} (в оборота)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Примечание */}
      <Card className="p-5 bg-[#F4E7E7]/30 backdrop-blur-sm border-[#2D2D2D]/10 rounded-[20px]">
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          ⚠️ <strong>Обратите внимание на затемнённые блоки:</strong> они показывают совмещение листов, их не нужно вышивать отдельно!
        </p>
        <p className="text-sm text-[#6B6B6B] leading-relaxed mt-2">
          ⚠️ <strong>Attention!</strong> The shaded blocks show the alignment of the sheets, they do not need to be embroidered separately!
        </p>
      </Card>
    </motion.div>
  );
}
