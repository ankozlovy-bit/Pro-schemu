import { useState, useRef } from 'react';
import { SavedProject } from '../types';
import { loadProjects, deleteProject, exportProjects, importProjects } from '../utils/projectStorage';
import { Trash2, Download, Upload, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectHistoryProps {
  onLoadProject: (project: SavedProject) => void;
}

export function ProjectHistory({ onLoadProject }: ProjectHistoryProps) {
  const [projects, setProjects] = useState<SavedProject[]>(() => loadProjects());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (projectId: string, projectName: string) => {
    if (confirm(`Удалить проект "${projectName}"?`)) {
      try {
        deleteProject(projectId);
        setProjects(loadProjects());
        toast.success('Проект удален');
      } catch (error) {
        toast.error('Не удалось удалить проект');
      }
    }
  };

  const handleExport = () => {
    try {
      exportProjects();
      toast.success('Проекты экспортированы');
    } catch (error) {
      toast.error('Не удалось экспортировать проекты');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newCount = await importProjects(file);
      setProjects(loadProjects());
      
      if (newCount > 0) {
        toast.success(`Импортировано проектов: ${newCount}`);
      } else {
        toast.info('Все проекты уже существуют');
      }
    } catch (error) {
      toast.error('Не удалось импортировать проекты');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (projects.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(139, 157, 131, 0.15)',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(139, 157, 131, 0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <FolderOpen size={32} color="#8B9D83" />
        </div>
        <h3 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1.5rem',
          color: '#2D2D2D',
          marginBottom: '12px',
        }}>
          Нет сохраненных проектов
        </h3>
        <p style={{
          fontFamily: 'Arial, sans-serif',
          color: '#6B6B6B',
          marginBottom: '24px',
        }}>
          Ваши проекты будут автоматически сохраняться здесь
        </p>
        
        {/* Import button */}
        <button
          onClick={handleImportClick}
          style={{
            background: 'transparent',
            color: '#8B9D83',
            border: '2px solid #8B9D83',
            padding: '12px 24px',
            borderRadius: '12px',
            fontFamily: 'Arial, sans-serif',
            fontSize: '0.938rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#8B9D83';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#8B9D83';
          }}
        >
          <Upload size={18} />
          Импортировать проекты
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Header with Import/Export buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 md:mb-6 shrink-0">
        <div className="text-sm md:text-base text-[#6B6B6B]" style={{ fontFamily: 'Arial, sans-serif' }}>
          {projects.length === 0 ? (
            'Нет сохраненных проектов'
          ) : (
            `Всего проектов: ${projects.length}`
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleImportClick}
            title="Импортировать проекты"
            className="flex-1 sm:flex-none bg-white border border-[#8B9D83]/30 hover:bg-[#8B9D83]/5 rounded-[10px] px-3 md:px-4 py-2 flex items-center justify-center gap-2 text-[#8B9D83] transition-all duration-200 text-sm"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Импорт</span>
          </button>
          
          <button
            onClick={handleExport}
            title="Экспортировать все проекты"
            className="flex-1 sm:flex-none bg-[#8B9D83] hover:bg-[#7A8A74] rounded-[10px] px-3 md:px-4 py-2 flex items-center justify-center gap-2 text-white transition-all duration-200 text-sm"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            <Download size={16} />
            <span className="hidden sm:inline">Экспорт</span>
          </button>
        </div>
      </div>

      {/* Project list */}
      <div style={{
        display: 'grid',
        gap: '12px',
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '8px',
      }}>
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: '#F5F3EE',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#8B9D83';
              e.currentTarget.style.background = '#FAFAF9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.background = '#F5F3EE';
            }}
            onClick={() => onLoadProject(project)}
          >
            {/* Thumbnail */}
            {project.thumbnail ? (
              <img
                src={project.thumbnail}
                alt={project.name}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 157, 131, 0.2)',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(139, 157, 131, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FolderOpen size={24} color="#8B9D83" />
              </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#2D2D2D',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {project.name}
              </h4>
              <p style={{
                fontFamily: 'Consolas, monospace',
                fontSize: '0.813rem',
                color: '#6B6B6B',
              }}>
                {formatDate(project.lastModified)}
              </p>
            </div>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(project.id, project.name);
              }}
              title="Удалить проект"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                color: '#6B6B6B',
                borderRadius: '8px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(212, 168, 159, 0.1)';
                e.currentTarget.style.color = '#D4A89F';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#6B6B6B';
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}