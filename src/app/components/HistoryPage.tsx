import { motion } from 'motion/react';
import { Clock, ArrowLeft, Calendar, FileText } from 'lucide-react';
import { HistoryItem } from '../types';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface HistoryPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    title: 'Роза в саду',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
    date: new Date('2026-03-01'),
  },
  {
    id: '2',
    title: 'Пейзаж осени',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    date: new Date('2026-02-28'),
  },
  {
    id: '3',
    title: 'Котёнок',
    thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    date: new Date('2026-02-25'),
  },
  {
    id: '4',
    title: 'Морской пейзаж',
    thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
    date: new Date('2026-02-20'),
  },
  {
    id: '5',
    title: 'Букет лаванды',
    thumbnail: 'https://images.unsplash.com/photo-1611462985358-60d3498e0364?w=400&h=300&fit=crop',
    date: new Date('2026-02-15'),
  },
  {
    id: '6',
    title: 'Зимний лес',
    thumbnail: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=400&h=300&fit=crop',
    date: new Date('2026-02-10'),
  },
];

export default function HistoryPage({ isOpen, onClose }: HistoryPageProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-[#FCFAF9] z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[#FCFAF9]/95 backdrop-blur-sm border-b border-[#2D2D2D]/10 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 md:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full w-10 h-10 p-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8F0E8] to-[#F4E7E7] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#2D2D2D]" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif text-[#2D2D2D]">Последние экспорты</h1>
                  <p className="text-sm text-[#6B6B6B]">{MOCK_HISTORY.length} проектов</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:px-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {MOCK_HISTORY.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/80 via-[#2D2D2D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3">
                      <Button
                        size="sm"
                        className="w-full rounded-xl bg-white text-[#2D2D2D] hover:bg-white/90 text-xs h-8"
                      >
                        <FileText className="w-3 h-3 mr-1.5" />
                        Открыть
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-[#2D2D2D] text-sm mb-1.5 truncate">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B]">
                    <Calendar className="w-3 h-3" />
                    <span>{item.date.toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}