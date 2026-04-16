import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import WelcomePage from './pages/WelcomePage';
import SettingsPage from './pages/SettingsPage';
import KeyGeneratorPage from './pages/KeyGeneratorPage';
import MainWorkflow from './pages/MainWorkflow';
import { GlobalSettings, SavedProject } from './types';

type Page = 'home' | 'workflow' | 'key-generator' | 'history' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [previousPage, setPreviousPage] = useState<Page>('home');
  const [loadedProject, setLoadedProject] = useState<SavedProject | null>(null);
  const [settings, setSettings] = useState<GlobalSettings>(() => {
    try {
      const saved = localStorage.getItem('proschemu-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return {
      defaultLanguage: 'RU',
      language: 'RU',
      theme: 'light',
    };
  });

  useEffect(() => {
    console.log('ПроСхему App mounted successfully');
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('proschemu-settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const handleNavigate = (page: Page, fromStep?: number) => {
    if (fromStep !== undefined) {
      localStorage.setItem('proschemu-workflow-step', fromStep.toString());
    }
    
    if (page === 'settings' || page === 'history' || page === 'key-generator') {
      if (fromStep !== undefined) {
        setPreviousPage('workflow');
      } else {
        setPreviousPage(currentPage);
      }
    }
    
    setCurrentPage(page);
  };

  const handleSaveSettings = (newSettings: GlobalSettings) => {
    setSettings(newSettings);
  };

  const handleLoadProject = (project: SavedProject) => {
    setLoadedProject(project);
  };

  try {
    if (currentPage === 'home') {
      return (
        <>
          <WelcomePage 
            onNavigate={handleNavigate}
            onLoadProject={handleLoadProject}
          />
          <Toaster position="top-right" />
        </>
      );
    }

    if (currentPage === 'workflow') {
      return (
        <>
          <MainWorkflow 
            onNavigate={handleNavigate}
            initialLanguage={settings.language}
            settings={settings}
            loadedProject={loadedProject}
            onProjectLoaded={() => setLoadedProject(null)}
          />
          <Toaster position="top-right" />
        </>
      );
    }

    if (currentPage === 'settings') {
      return (
        <>
          <SettingsPage 
            onNavigate={handleNavigate}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            previousPage={previousPage}
          />
          <Toaster position="top-right" />
        </>
      );
    }

    if (currentPage === 'key-generator') {
      return (
        <>
          <KeyGeneratorPage 
            onNavigate={handleNavigate}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            previousPage={previousPage}
          />
          <Toaster position="top-right" />
        </>
      );
    }

    return (
      <>
        <div style={{
          minHeight: '100vh',
          background: '#F5F3EE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '40px',
            textAlign: 'center'
          }}>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#8B9D83', marginBottom: '1rem' }}>
              {currentPage === 'history' ? 'История' : currentPage === 'settings' ? 'Настройки' : currentPage}
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#6B6B6B', fontFamily: 'Arial, sans-serif' }}>
              Эта страница находится в разработке
            </p>
            <button
              onClick={() => handleNavigate('home')}
              style={{
                background: '#8B9D83',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              Вернуться на главную
            </button>
          </div>
        </div>
        <Toaster position="top-right" />
      </>
    );
  } catch (error) {
    console.error('App render error:', error);
    return (
      <div style={{
        minHeight: '100vh',
        background: '#F5F3EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h2 style={{ fontFamily: 'Georgia, serif', color: '#D4A89F', marginBottom: '1rem' }}>
            Произошла ошибка
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#6B6B6B', fontFamily: 'Arial, sans-serif' }}>
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#8B9D83',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            Перезагрузить страницу
          </button>
        </div>
      </div>
    );
  }
}
