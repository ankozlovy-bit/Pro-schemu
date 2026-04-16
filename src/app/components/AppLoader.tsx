import { motion } from 'motion/react';

export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#F5F3EE] via-[#F9F7F2] to-[#F2EFE8] overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#8B9D83]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4A89F]/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {/* Decorative circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative mb-8"
          >
            <div className="w-24 h-24 rounded-full border-4 border-[#8B9D83]/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#8B9D83]/20" />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl text-[#8B9D83] mb-4" 
              style={{ fontFamily: 'Georgia, serif' }}
            >
              ПроСхему
            </h1>
            <p 
              className="text-lg md:text-xl text-[#6B6B6B] mb-8" 
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Профессиональный генератор PDF-схем для вышивки крестом
            </p>

            {/* Loading animation */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-[#8B9D83]"
                  animate={{
                    scale: [1, 1.5, 1],
                    backgroundColor: ['#8B9D83', '#D4A89F', '#8B9D83'],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}