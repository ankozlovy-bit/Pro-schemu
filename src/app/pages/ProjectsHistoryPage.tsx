import { ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

type Page = 'home' | 'workflow' | 'key-generator' | 'history' | 'settings';

interface ProjectsHistoryPageProps {
  onNavigate: (page: Page) => void;
}

export default function ProjectsHistoryPage({ onNavigate }: ProjectsHistoryPageProps) {
  // TODO: Implement real project history from localStorage or database
  const hasProjects = false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3EE] via-[#F9F7F2] to-[#F2EFE8] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#8B9D83]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4A89F]/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-8 md:px-12 md:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onNavigate('home')}
              className="rounded-full border-[#8B9D83]/20 hover:bg-[#8B9D83]/10 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#2D2D2D]" />
            </Button>
            <div>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl text-[#2D2D2D] tracking-tight" 
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Предыдущие проекты
              </h1>
              <p className="mt-2 text-base md:text-lg text-[#6B6B6B]" style={{ fontFamily: 'var(--font-sans)' }}>
                История создания PDF-схем вышивки
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          {!hasProjects ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8B9D83]/20 to-[#D4A89F]/20 flex items-center justify-center">
                  <FileText className="w-16 h-16 text-[#8B9D83]" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#D4A89F]" />
                </div>
              </div>

              <h2
                className="text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-4"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Пока здесь пусто
              </h2>

              <p
                className="text-lg text-[#6B6B6B] mb-8 max-w-md"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Создайте вашу первую PDF-схему, и она появится здесь
              </p>

              <button
                onClick={() => onNavigate('workflow')}
                className="group bg-gradient-to-r from-[#8B9D83] to-[#7A8C73] hover:from-[#7A8C73] hover:to-[#6B7D64] text-white rounded-[24px] px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3"
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold" style={{ fontFamily: 'var(--font-accent)' }}>
                  Создать первую схему
                </span>
              </button>
            </div>
          ) : (
            /* Projects Grid - будет реализовано позже */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Project cards will be here */}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
