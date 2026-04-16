import { FileText, Clock, Settings } from 'lucide-react';
import { useState } from 'react';
import { SavedProject } from '../types';
import heroImage from '../../assets/1a9130512102c84ba257835ff37f8eac3d431de5.png';
import sealImage from '../../assets/ffb22b2d182b79f7dbbc34113e2c13d5e2786f9e.png';

type Page = 'home' | 'workflow' | 'key-generator' | 'history' | 'settings';

interface WelcomePageProps {
  onNavigate: (page: Page, fromStep?: number) => void;
  onLoadProject?: (project: SavedProject) => void;
}

export default function WelcomePage({ onNavigate, onLoadProject }: WelcomePageProps) {
  const [showHistory, setShowHistory] = useState(false);

  const handleStartWorkflow = () => {
    onNavigate('workflow');
  };

  const handleLoadProject = (project: SavedProject) => {
    if (onLoadProject) {
      onLoadProject(project);
    }
    onNavigate('workflow');
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center p-0">
      <div className="w-full max-w-[1400px] h-screen max-h-[900px] grid lg:grid-cols-2 shadow-2xl">
        
        {/* Left Column - Hero Image */}
        <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 overflow-hidden">
          {/* Hero Image */}
          <img
            src={heroImage}
            alt="Вышивка крестом - растение"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Content overlay - Bottom Left */}
          <div className="absolute bottom-12 left-12 right-32 z-10">
            <h1 
              className="text-7xl font-bold text-white leading-[1.1] mb-4" 
              style={{ 
                fontFamily: 'Georgia, serif',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
              }}
            >
              ПроСхему
            </h1>
            
            <p 
              className="text-white/95 text-sm mb-1" 
              style={{ 
                fontFamily: 'Arial, sans-serif',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              © 2026 ПроСхему. Все права защищены.
            </p>
            
            <p 
              className="text-white/90 text-sm" 
              style={{ 
                fontFamily: 'Arial, sans-serif',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
              }}
            >
              Подготовлено сообществом{' '}
              <a
                href="https://vk.ru/nataly_k_create"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/80 hover:decoration-white transition-all hover:text-white"
                style={{ textUnderlineOffset: '3px' }}
              >
                "Вышивка Натальи Козловой. Авторские схемы"
              </a>
            </p>
          </div>
          
          {/* Seal/Badge - Bottom Right */}
          <div className="absolute bottom-8 right-8 z-10">
            <img
              src={sealImage}
              alt="Печать сообщества"
              className="w-28 h-28 object-contain opacity-90"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))'
              }}
            />
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="bg-[#F5F3EE] flex flex-col justify-center px-12 py-16">
          {/* Top Badge */}
          <div className="inline-block self-start px-5 py-2.5 rounded-full bg-white/60 border border-[#8B9D83]/15 mb-8">
            <span 
              className="text-sm text-[#6B6B6B]" 
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              Конструктор файла PDF для Вашей схемы
            </span>
          </div>

          {/* Description */}
          <p 
            className="text-xl text-[#6B6B6B] leading-relaxed mb-10 max-w-md" 
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            Создавайте идеальные PDF-схемы для вышивки с легкостью и вдохновением
          </p>

          {/* CTA Buttons */}
          <div className="space-y-4 mb-12">
            {/* Primary Button */}
            <button
              onClick={handleStartWorkflow}
              className="group w-full bg-[#5A707C] hover:bg-[#4D5F6A] text-white rounded-2xl px-8 py-5 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between"
            >
              <div className="text-left">
                <div 
                  className="text-lg font-semibold mb-0.5" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Начать с чистого листа
                </div>
                <div 
                  className="text-sm text-white/80" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Создать файл PDF для новой схемы
                </div>
              </div>
              <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </button>

            {/* Secondary Button - History */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="group w-full bg-white hover:bg-white/90 border border-[#E0E0E0] text-[#2D2D2D] rounded-2xl px-8 py-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div className="text-left">
                <div 
                  className="text-lg font-semibold mb-0.5" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Предыдущие проекты
                </div>
                <div 
                  className="text-sm text-[#6B6B6B]" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  К списку истории создания файлов
                </div>
              </div>
              <div className="w-11 h-11 rounded-lg bg-[#F5F3EE] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8B9D83]" />
              </div>
            </button>

            {/* Tertiary Button - Settings */}
            <button
              onClick={() => onNavigate('settings')}
              className="group w-full bg-white hover:bg-white/90 border border-[#E0E0E0] text-[#2D2D2D] rounded-2xl px-8 py-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div className="text-left">
                <div 
                  className="text-lg font-semibold mb-0.5" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Настройки
                </div>
                <div 
                  className="text-sm text-[#6B6B6B]" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Настройте параметры приложения
                </div>
              </div>
              <div className="w-11 h-11 rounded-lg bg-[#F5F3EE] flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#8B9D83]" />
              </div>
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center space-y-1">
              <div 
                className="text-3xl font-bold text-[#8B9D83]" 
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                A4
              </div>
              <div 
                className="text-sm text-[#6B6B6B]" 
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Формат
              </div>
            </div>
            <div className="text-center space-y-1">
              <div 
                className="text-3xl font-bold text-[#8B9D83]" 
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                PDF
              </div>
              <div 
                className="text-sm text-[#6B6B6B]" 
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Экспорт
              </div>
            </div>
            <div className="text-center space-y-1">
              <div 
                className="text-3xl font-bold text-[#8B9D83]" 
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Pro
              </div>
              <div 
                className="text-sm text-[#6B6B6B]" 
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                Качество
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project History Modal */}
      {showHistory && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowHistory(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 
                className="text-3xl font-bold text-[#8B9D83]" 
                style={{ fontFamily: 'Georgia, serif' }}
              >
                История проектов
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-[#6B6B6B] hover:text-[#8B9D83] transition-all duration-300 p-2 hover:bg-[#8B9D83]/10 rounded-full"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="text-center py-16 text-[#6B6B6B]">
                <Clock className="w-20 h-20 mx-auto mb-6 text-[#8B9D83]/30" />
                <p 
                  className="text-xl mb-3 font-semibold" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  История проектов пока пуста
                </p>
                <p 
                  className="text-base" 
                  style={{ fontFamily: 'Arial, sans-serif' }}
                >
                  Создайте первый проект, чтобы увидеть его здесь
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}