import { motion } from 'motion/react';
import { FileText, Wand2, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';

type Page = 'home' | 'workflow' | 'key-generator';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Создание PDF схем',
      description: 'Полный workflow для создания профессиональных PDF схем вышивки',
      page: 'workflow' as Page,
      gradient: 'from-[#E8F0E8] to-[#F4E7E7]',
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: 'Генератор ключа схемы',
      description: 'Создание RTF файлов с переводом заголовков для Cross Stitch Pro',
      page: 'key-generator' as Page,
      gradient: 'from-[#F4E7E7] to-[#E8F0E8]',
    },
  ];

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
        className="relative z-10 px-6 py-12 md:px-12 md:py-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-white/40 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-[#2D2D2D]" />
            <span className="text-sm text-[#6B6B6B]">Ethereal Tech Design System</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-serif text-[#2D2D2D] tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            StitchPDF
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-[#6B6B6B] font-light max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Профессиональные инструменты для дизайнеров вышивки
          </motion.p>
        </div>
      </motion.header>

      {/* Main content */}
      <motion.main
        className="relative z-10 px-6 md:px-12 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.page}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="group"
              >
                <div
                  className="h-full bg-white/60 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-xl border border-white/40 cursor-pointer transition-all duration-300 hover:shadow-2xl"
                  onClick={() => onNavigate(feature.page)}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-[20px] bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}>
                    <div className="text-[#2D2D2D]">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <h2 className="text-2xl md:text-3xl font-serif text-[#2D2D2D] mb-3">
                    {feature.title}
                  </h2>
                  <p className="text-[#6B6B6B] leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* CTA Button */}
                  <Button
                    className="rounded-full px-6 bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 transition-all group-hover:gap-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(feature.page);
                    }}
                  >
                    <span>Открыть</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.main>

      {/* Footer */}
      <motion.footer
        className="relative z-10 px-6 py-8 md:px-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-[#6B6B6B]/60">
            Создано с любовью для дизайнеров вышивки
          </p>
        </div>
      </motion.footer>
    </div>
  );
}