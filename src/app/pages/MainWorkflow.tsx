import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Settings, Clock, Info } from 'lucide-react';
import { ProjectData, GlobalSettings, SavedProject } from '../types';
import { Button } from '../components/ui/button';
import { ScrollProgress } from '../components/ScrollProgress';
import { saveProject } from '../utils/projectStorage';
import { toast } from 'sonner';

// Direct imports instead of lazy loading for debugging
import StepOne from '../components/StepOne';
import StepTwo from '../components/StepTwo';
import StepThree from '../components/StepThree';
import StepFour from '../components/StepFour';
import StepFive from '../components/StepFive';
import StepSix from '../components/StepSix';

type Page = 'home' | 'workflow' | 'key-generator' | 'history' | 'settings';

interface MainWorkflowProps {
  onNavigate: (page: Page, fromStep?: number) => void;
  initialLanguage?: 'RU' | 'EN';
  settings?: GlobalSettings;
  loadedProject?: SavedProject | null;
  onProjectLoaded?: () => void;
}

export default function MainWorkflow({ onNavigate, initialLanguage = 'RU', settings, loadedProject, onProjectLoaded }: MainWorkflowProps) {
  // Load saved step from localStorage
  const loadSavedStep = () => {
    try {
      const saved = localStorage.getItem('proschemu-workflow-step');
      if (saved) {
        const step = parseInt(saved, 10);
        // Clear it after loading
        localStorage.removeItem('proschemu-workflow-step');
        // Validate step is within valid range
        if (step >= 1 && step <= 6) {
          return step;
        }
      }
    } catch (e) {
      console.error('Failed to load workflow step:', e);
    }
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(() => loadSavedStep());
  
  const [projectData, setProjectData] = useState<ProjectData>(() => {
    return {
      id: crypto.randomUUID(),
      designerName: '',
      chartTitle: '',
      language: initialLanguage || 'RU',
      canvasCount: 14,
      fabricColor: '#FFFFFF',
      margins: 20,
      crossStitchColors: [],
      halfStitchColors: [],
      backstitchColors: [],
      frenchKnotColors: [],
      beadColors: [],
      selectedPages: [],
      createdAt: new Date(),
      settings: settings,
    };
  });
  
  const updateProjectData = (data: Partial<ProjectData>) => {
    setProjectData((prev) => ({ ...prev, ...data }));
  };

  // Sync settings changes
  useEffect(() => {
    if (settings) {
      setProjectData((prev) => ({ ...prev, settings }));
    }
  }, [settings]);

  // Load project data if a project is loaded
  useEffect(() => {
    if (loadedProject) {
      setProjectData(loadedProject.projectData);
      if (loadedProject.currentStep) {
        setCurrentStep(loadedProject.currentStep);
      }
      toast.success(`Проект "${loadedProject.name}" загружен`);
      if (onProjectLoaded) {
        onProjectLoaded();
      }
    }
  }, [loadedProject, onProjectLoaded]);

  // Auto-save project on data changes (debounced)
  useEffect(() => {
    // Don't save if no meaningful data yet
    if (!projectData.designerName && !projectData.chartTitle) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        saveProject(projectData);
        console.log('Project auto-saved');
      } catch (error) {
        console.error('Failed to auto-save project:', error);
      }
    }, 2000); // Save 2 seconds after last change

    return () => clearTimeout(timer);
  }, [projectData]);

  const handleNext = () => {
    setCurrentStep((prev) => {
      const newStep = Math.min(prev + 1, 6);
      return newStep;
    });
  };

  const handleBack = () => {
    setCurrentStep((prev) => {
      const newStep = Math.max(prev - 1, 1);
      return newStep;
    });
  };

  const handleOpenKeyGenerator = () => {
    console.log('Opening Key Generator...');
    onNavigate('key-generator', currentStep);
  };

  // Check if step is completed (has required data)
  const isStepCompleted = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        // Step 1: Check if basic project info is filled
        const step1Complete = !!(projectData.designerName && projectData.chartTitle);
        return step1Complete;
      case 2:
        // Step 2: Check if cover is created or uploaded
        const step2Complete = !!(projectData.coverPDF || projectData.uploadedCoverFile);
        return step2Complete;
      case 3:
        // Step 3: Check if symbol key PDF is uploaded
        const step3Complete = !!projectData.symbolKeyPDF;
        return step3Complete;
      case 4:
        // Step 4: Check if thread usage file is uploaded or data exists
        const step4Complete = !!(projectData.threadUsageFile || (projectData.threadUsageData && projectData.threadUsageData.length > 0));
        return step4Complete;
      case 5:
        // Step 5: Check if chart PDFs are uploaded
        const step5Complete = !!(projectData.chartPDFs && projectData.chartPDFs.length > 0);
        return step5Complete;
      case 6:
        // Step 6: Final preview - never automatically completed
        return false;
      default:
        return false;
    }
  };

  // Handle click on step circle
  const handleStepClick = (stepNumber: number) => {
    // Allow navigation to current step, previous steps, or next step if current is completed
    if (stepNumber <= currentStep || isStepCompleted(currentStep)) {
      setCurrentStep(stepNumber);
    }
  };

  const steps = [
    { number: 1, title: 'Информация', component: StepOne, displayNumber: null }, // Без цифры
    { number: 2, title: 'Обложка', component: StepTwo, displayNumber: 1 },
    { number: 3, title: 'Ключ схемы', component: StepThree, displayNumber: 2 },
    { number: 4, title: 'Расход мулине', component: StepFour, displayNumber: 3 },
    { number: 5, title: 'Загрузка схем', component: StepFive, displayNumber: 4 },
    { number: 6, title: 'Финальный PDF', component: StepSix, displayNumber: 5 },
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne 
          projectData={projectData}
          updateProjectData={updateProjectData}
          onNext={handleNext}
        />;
      case 2:
        return <StepTwo 
          projectData={projectData}
          updateProjectData={updateProjectData}
          onNext={handleNext}
          onBack={handleBack}
        />;
      case 3:
        return <StepThree 
          projectData={projectData}
          updateProjectData={updateProjectData}
          onNext={handleNext}
          onBack={handleBack}
          onOpenKeyGenerator={handleOpenKeyGenerator}
        />;
      case 4:
        return <StepFour 
          projectData={projectData}
          updateProjectData={updateProjectData}
          onNext={handleNext}
          onBack={handleBack}
        />;
      case 5:
        return <StepFive 
          projectData={projectData}
          updateProjectData={updateProjectData}
          onNext={handleNext}
          onBack={handleBack}
        />;
      case 6:
        return <StepSix 
          projectData={projectData}
          updateProjectData={updateProjectData}
          onBack={handleBack}
        />;
      default:
        return <StepOne 
          projectData={projectData}
          updateProjectData={updateProjectData}
          onNext={handleNext}
        />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F5F3EE' }}>
      <ScrollProgress />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[40%] -right-[20%] w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #E8F0E8 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-[40%] -left-[20%] w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #F4E7E7 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6 md:px-6 md:py-8 lg:px-12 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate('home')}
                className="rounded-full border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50 shrink-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-[#2D2D2D]" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#2D2D2D] tracking-tight truncate"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Создание PDF схемы
                </h1>
                <p className="mt-1 md:mt-2 text-sm md:text-base lg:text-lg text-[#6B6B6B] font-light line-clamp-1">
                  {currentStep === 1 ? (
                    <>{steps[currentStep - 1].title}</>
                  ) : (
                    <>Шаг {steps[currentStep - 1].displayNumber} из 5: {steps[currentStep - 1].title}</>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 self-end sm:self-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate('settings', currentStep)}
                className="rounded-full border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-[#2D2D2D]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onNavigate('history')}
                className="rounded-full border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
              >
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-[#2D2D2D]" />
              </Button>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => {
              const completed = isStepCompleted(step.number);
              const isCurrent = currentStep === step.number;
              const isPast = currentStep > step.number;
              const isClickable = step.number <= currentStep || isStepCompleted(currentStep);
              
              return (
                <div key={step.number} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        completed && !isCurrent
                          ? 'bg-[#8B9D83] text-white cursor-pointer hover:bg-[#7a8c74] shadow-md'
                          : isCurrent
                          ? 'bg-[#8B9D83] text-white ring-4 ring-[#8B9D83]/30 cursor-pointer shadow-lg scale-110'
                          : isClickable
                          ? 'bg-white text-[#2D2D2D] border-2 border-[#8B9D83]/30 cursor-pointer hover:border-[#8B9D83] hover:bg-[#E8F0E8]/50 shadow-sm'
                          : 'bg-white/40 text-[#6B6B6B]/50 border-2 border-[#2D2D2D]/10 cursor-not-allowed'
                      }`}
                      onClick={() => handleStepClick(step.number)}
                      style={{ cursor: isClickable ? 'pointer' : 'not-allowed' }}
                    >
                      {completed && !isCurrent ? (
                        <Check className="w-5 h-5 md:w-6 md:h-6" />
                      ) : step.displayNumber === null ? (
                        <Info className="w-5 h-5 md:w-6 md:h-6" />
                      ) : (
                        <span className="text-base md:text-lg">{step.displayNumber}</span>
                      )}
                    </div>
                    <span className={`hidden md:block text-xs mt-2 text-center max-w-[80px] ${
                      completed ? 'text-[#8B9D83] font-medium' : 'text-[#6B6B6B]'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-6 md:w-16 h-1 mx-0.5 md:mx-2 transition-all duration-300 rounded-full ${
                        completed
                          ? 'bg-[#8B9D83]'
                          : 'bg-[#2D2D2D]/20'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-4 py-6 md:px-6 md:py-8 lg:px-12 lg:pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/60 backdrop-blur-xl rounded-[24px] md:rounded-[32px] p-4 md:p-8 lg:p-12 shadow-xl border border-white/40">
            <div key={currentStep}>
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}