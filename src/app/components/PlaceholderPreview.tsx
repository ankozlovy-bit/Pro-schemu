/**
 * PlaceholderPreview - Превью плейсхолдеров для PDF
 * Показывает как будут выглядеть данные в финальном PDF
 */

import { motion } from "motion/react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProjectData } from "../types";
import { generatePlaceholders, generateCompleteKey } from "../utils/pdfPlaceholders";
import { Info, CheckCircle2, XCircle } from "lucide-react";

interface PlaceholderPreviewProps {
  projectData: ProjectData;
}

export default function PlaceholderPreview({ projectData }: PlaceholderPreviewProps) {
  const placeholders = generatePlaceholders(projectData);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="p-6 bg-gradient-to-br from-white/80 to-[#E8F0E8]/40 backdrop-blur-md border-[#2D2D2D]/10">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-5 h-5 text-[#2D2D2D] mt-0.5" />
          <div>
            <h3 className="font-medium text-[#2D2D2D] mb-1">Предпросмотр данных для PDF</h3>
            <p className="text-sm text-[#6B6B6B]">
              Эти данные будут использованы при генерации схемы
            </p>
          </div>
        </div>

        {/* Основная информация */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-[#2D2D2D] border-b border-[#2D2D2D]/10 pb-2">
            Основная информация
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <PlaceholderField label="%Title%" value={placeholders['%Title%']} />
            <PlaceholderField label="%RNG%" value={placeholders['%RNG%']} />
            <PlaceholderField label="%count%" value={placeholders['%count%']} />
            <PlaceholderField label="%dimcm%" value={placeholders['%dimcm%']} />
            <PlaceholderField label="%stitches%" value={placeholders['%stitches%']} />
          </div>
        </div>

        {/* Статистика по типам стежков */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#2D2D2D] border-b border-[#2D2D2D]/10 pb-2">
            Типы стежков
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StitchTypeCard
              label="Крест"
              count={placeholders.crossStitch.length}
              active={placeholders.crossStitch.length > 0}
            />
            <StitchTypeCard
              label="Полукрест"
              count={placeholders.halfStitch.length}
              active={placeholders['%ifhalf%']}
            />
            <StitchTypeCard
              label="Бэкстич"
              count={placeholders.backstitch.length}
              active={placeholders['%ifbacks%']}
            />
            <StitchTypeCard
              label="Бисер"
              count={placeholders.beads.length}
              active={placeholders['%ifbeads%']}
            />
          </div>
        </div>
      </Card>

      {/* Пример таблиц */}
      {placeholders.crossStitch.length > 0 && (
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
          <h4 className="text-sm font-medium text-[#2D2D2D] mb-4">
            Пример: Таблица "Крест" (первые 5 цветов)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D2D2D]/10">
                  <th className="text-left pb-2 px-2">Цвет</th>
                  <th className="text-left pb-2 px-2">Символ</th>
                  <th className="text-left pb-2 px-2">DMC</th>
                  <th className="text-left pb-2 px-2">Нити</th>
                </tr>
              </thead>
              <tbody>
                {placeholders.crossStitch.slice(0, 5).map((color, idx) => (
                  <tr key={idx} className="border-b border-[#2D2D2D]/5">
                    <td className="py-2 px-2">
                      <div
                        className="w-8 h-8 rounded border border-[#2D2D2D]/20"
                        style={{ backgroundColor: color['%p%'] }}
                      />
                    </td>
                    <td className="py-2 px-2 font-mono font-medium">{color['%s%']}</td>
                    <td className="py-2 px-2">{color['%n%']}</td>
                    <td className="py-2 px-2">{color['%st%']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {placeholders.crossStitch.length > 5 && (
              <p className="text-xs text-[#6B6B6B] mt-2 text-center">
                + еще {placeholders.crossStitch.length - 5} цветов
              </p>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
}

function PlaceholderField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/60 border border-[#2D2D2D]/10">
      <p className="text-xs text-[#6B6B6B] mb-1 font-mono">{label}</p>
      <p className="text-sm font-medium text-[#2D2D2D]">{value || '—'}</p>
    </div>
  );
}

function StitchTypeCard({ 
  label, 
  count, 
  active 
}: { 
  label: string; 
  count: number; 
  active: boolean; 
}) {
  return (
    <div className={`p-3 rounded-xl border transition-all ${
      active 
        ? 'bg-[#E8F0E8]/50 border-[#2D2D2D]/20' 
        : 'bg-white/40 border-[#2D2D2D]/10'
    }`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-[#2D2D2D]">{label}</p>
        {active ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <XCircle className="w-4 h-4 text-[#6B6B6B]" />
        )}
      </div>
      <p className="text-lg font-semibold text-[#2D2D2D]">{count}</p>
    </div>
  );
}
