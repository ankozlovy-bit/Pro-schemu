import { X, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  // Автоматическая прокрутка вверх при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-[32px] shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#8B9D83]/10 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5 text-[#6B6B6B]" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#8B9D83]/20 blur-2xl rounded-full" />
            <CheckCircle className="w-12 h-12 text-[#8B9D83] relative" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h2 
          className="text-2xl font-bold text-center text-[#2D2D2D]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ваш файл PDF готов!
        </h2>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#8B9D83]/30 to-transparent" />

        {/* Community Attribution */}
        <div className="flex flex-col items-center space-y-3">
          {/* Clickable Logo */}
          <a
            href="https://vk.ru/nataly_k_create"
            target="_blank"
            rel="noopener noreferrer"
            className="group hover:scale-105 transition-transform duration-300"
            title="Перейти в группу ВКонтакте"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-[#8B9D83]/30 group-hover:border-[#8B9D83]/60 transition-colors bg-gradient-to-br from-[#8B9D83] to-[#B8C5B3] flex items-center justify-center">
              <span className="text-white text-xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>НК</span>
            </div>
          </a>

          {/* Clickable Text */}
          <p 
            className="text-xs text-center text-[#6B6B6B] max-w-xs leading-relaxed"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Приложение разработано сообществом
            <br />
            <a
              href="https://vk.ru/nataly_k_create"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B9D83] hover:text-[#6B7D63] underline decoration-[#8B9D83]/50 hover:decoration-[#8B9D83] transition-all font-medium"
              style={{ textUnderlineOffset: '3px' }}
            >
              "Вышивка Натальи Козловой. Авторские схемы"
            </a>
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-6 rounded-2xl bg-gradient-to-r from-[#8B9D83] to-[#7A8C73] hover:from-[#7A8C73] hover:to-[#6B7D63] text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          style={{ fontFamily: 'var(--font-accent)' }}
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}