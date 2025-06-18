import { SavedProject, FlyerConfig, ProductGroup, Product } from '../types';

export class ProjectManager {
  private static readonly STORAGE_KEY = 'navas_promotional_projects';

  static saveProject(
    name: string,
    config: FlyerConfig,
    groups: ProductGroup[],
    products: Product[]
  ): SavedProject {
    const project: SavedProject = {
      id: `project-${Date.now()}`,
      name,
      config,
      groups,
      products,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingProjects = this.getAllProjects();
    const updatedProjects = [...existingProjects, project];
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProjects));
    return project;
  }

  static updateProject(
    projectId: string,
    config: FlyerConfig,
    groups: ProductGroup[],
    products: Product[]
  ): SavedProject | null {
    const existingProjects = this.getAllProjects();
    const projectIndex = existingProjects.findIndex(p => p.id === projectId);
    
    if (projectIndex === -1) return null;

    const updatedProject: SavedProject = {
      ...existingProjects[projectIndex],
      config,
      groups,
      products,
      updatedAt: new Date()
    };

    existingProjects[projectIndex] = updatedProject;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingProjects));
    
    return updatedProject;
  }

  static getAllProjects(): SavedProject[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const projects = JSON.parse(stored);
      return projects.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        config: {
          ...p.config,
          createdAt: new Date(p.config.createdAt),
          updatedAt: new Date(p.config.updatedAt)
        }
      }));
    } catch {
      return [];
    }
  }

  static getProject(projectId: string): SavedProject | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  static deleteProject(projectId: string): boolean {
    const existingProjects = this.getAllProjects();
    const filteredProjects = existingProjects.filter(p => p.id !== projectId);
    
    if (filteredProjects.length === existingProjects.length) return false;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProjects));
    return true;
  }

  static exportProject(project: SavedProject): void {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_projeto.json`;
    link.click();
  }

  static async importProject(file: File): Promise<SavedProject> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target?.result as string);
          
          // Validate project structure
          if (!projectData.id || !projectData.name || !projectData.config) {
            throw new Error('Arquivo de projeto inválido');
          }

          const importedProject: SavedProject = {
            ...projectData,
            id: `project-${Date.now()}`, // Generate new ID
            createdAt: new Date(),
            updatedAt: new Date(),
            config: {
              ...projectData.config,
              id: `flyer-${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          };

          const existingProjects = this.getAllProjects();
          const updatedProjects = [...existingProjects, importedProject];
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProjects));
          
          resolve(importedProject);
        } catch (error) {
          reject(new Error('Erro ao importar projeto. Verifique se o arquivo é válido.'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  }
}