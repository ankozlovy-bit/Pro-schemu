import { ProjectData, SavedProject, ProjectHistoryData } from '../types';

const STORAGE_KEY = 'proschemu-projects';
const STORAGE_VERSION = '1.0';
const MAX_PROJECTS = 50; // Maximum projects to keep

/**
 * Load all saved projects from LocalStorage
 */
export function loadProjects(): SavedProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const parsed: ProjectHistoryData = JSON.parse(data);
    return parsed.projects || [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
}

/**
 * Save a project to LocalStorage
 * Note: Saves lightweight version without large binary data (PDFs, images in base64)
 */
export function saveProject(projectData: ProjectData): SavedProject {
  try {
    const projects = loadProjects();
    
    // Check if project already exists
    const existingIndex = projects.findIndex(p => p.id === projectData.id);
    
    // Create lightweight copy of projectData - exclude large binary files
    const lightweightData: ProjectData = {
      ...projectData,
      // Keep only essential data, remove large files
      coverPDF: undefined, // Don't save PDF in localStorage
      uploadedCoverFile: undefined, // Don't save uploaded files
      symbolKeyPDF: undefined, // Don't save PDF
      threadUsageFile: undefined, // Don't save file
      chartPDFs: undefined, // Don't save PDFs
      coverImage: undefined, // Don't save large base64 images
      coverPreviewImage: projectData.coverPreviewImage, // Keep small preview
    };
    
    const now = new Date().toISOString();
    const savedProject: SavedProject = {
      id: projectData.id,
      name: projectData.chartTitle || projectData.designerName || 'Без названия',
      createdAt: existingIndex >= 0 ? projects[existingIndex].createdAt : now,
      lastModified: now,
      thumbnail: projectData.coverPreviewImage,
      projectData: lightweightData,
    };

    if (existingIndex >= 0) {
      // Update existing project
      projects[existingIndex] = savedProject;
    } else {
      // Add new project at the beginning
      projects.unshift(savedProject);
      
      // Keep only MAX_PROJECTS
      if (projects.length > MAX_PROJECTS) {
        projects.splice(MAX_PROJECTS);
      }
    }

    // Save to localStorage
    const historyData: ProjectHistoryData = {
      version: STORAGE_VERSION,
      projects,
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
    } catch (quotaError) {
      // If still quota exceeded, remove old projects and try again
      if (quotaError instanceof DOMException && quotaError.name === 'QuotaExceededError') {
        console.warn('⚠️ Storage quota exceeded, cleaning old projects...');
        // Keep only last 10 projects
        const reducedProjects = projects.slice(0, 10);
        const reducedData: ProjectHistoryData = {
          version: STORAGE_VERSION,
          projects: reducedProjects,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedData));
      } else {
        throw quotaError;
      }
    }

    return savedProject;
  } catch (error) {
    console.error('Failed to save project:', error);
    throw error;
  }
}

/**
 * Delete a project from LocalStorage
 */
export function deleteProject(projectId: string): void {
  try {
    const projects = loadProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    
    const historyData: ProjectHistoryData = {
      version: STORAGE_VERSION,
      projects: filtered,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}

/**
 * Load a specific project by ID
 */
export function loadProject(projectId: string): SavedProject | null {
  try {
    const projects = loadProjects();
    return projects.find(p => p.id === projectId) || null;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
}

/**
 * Clear all projects from LocalStorage
 */
export function clearAllProjects(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear projects:', error);
    throw error;
  }
}

/**
 * Export all projects as JSON file
 */
export function exportProjects(): void {
  try {
    const projects = loadProjects();
    const historyData: ProjectHistoryData = {
      version: STORAGE_VERSION,
      projects,
    };

    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `proschemu-projects-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export projects:', error);
    throw error;
  }
}

/**
 * Import projects from JSON file
 */
export function importProjects(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported: ProjectHistoryData = JSON.parse(content);
        
        if (!imported.projects || !Array.isArray(imported.projects)) {
          throw new Error('Invalid project file format');
        }

        const currentProjects = loadProjects();
        const importedProjects = imported.projects;
        
        // Merge projects (avoid duplicates by ID)
        const mergedProjects = [...currentProjects];
        let newCount = 0;
        
        for (const importedProject of importedProjects) {
          const exists = mergedProjects.some(p => p.id === importedProject.id);
          if (!exists) {
            mergedProjects.push(importedProject);
            newCount++;
          }
        }
        
        // Sort by lastModified (newest first)
        mergedProjects.sort((a, b) => 
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );
        
        // Keep only MAX_PROJECTS
        if (mergedProjects.length > MAX_PROJECTS) {
          mergedProjects.splice(MAX_PROJECTS);
        }
        
        const historyData: ProjectHistoryData = {
          version: STORAGE_VERSION,
          projects: mergedProjects,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
        
        resolve(newCount);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Get storage usage statistics
 */
export function getStorageStats(): { count: number; size: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return {
      count: loadProjects().length,
      size: data ? new Blob([data]).size : 0,
    };
  } catch (error) {
    return { count: 0, size: 0 };
  }
}