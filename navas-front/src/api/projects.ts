import { SavedProject } from '../types';
import axios from 'axios';

// Axios instance scoped to this module
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // adjust if backend URL changes
  timeout: 30000
});

export async function getProjects(): Promise<SavedProject[]> {
  const res = await api.get<SavedProject[]>('/projects');
  return res.data;
}

export async function createProject(project: SavedProject): Promise<SavedProject> {
    try {
      const payload = {
        name: project.name,
        config: {
          title: project.config.title,
          headerText: project.config.headerText,
          footerText: project.config.footerText,
          headerImageUrl: project.config.headerImageUrl,
          footerImageUrl: project.config.footerImageUrl,
          backgroundColor: project.config.backgroundColor,
          primaryColor: project.config.primaryColor,
          secondaryColor: project.config.secondaryColor
        },
        groups: project.groups?.map(g => ({
          title: g.title,
          position: g.position,
          type: g.type.toUpperCase(),
          products: g.products?.map(p => ({
            code: p.code,
            description: p.description,
            category: p.category,
            price: p.price,
            specifications: p.specifications
          })) ?? []
        })) ?? [],
        products: project.products?.map(p => ({
          code: p.code,
          description: p.description,
          category: p.category,
          price: p.price,
          specifications: p.specifications
        })) ?? []
      };

    const response = await api.post<SavedProject>('/projects', payload);
    return response.data
    

    // return {
    //   ...data,
    //   createdAt: new Date(data.createdAt),
    //   updatedAt: new Date(data.updatedAt),
    //   config: {
    //     ...data.config,
    //     createdAt: new Date(data.config.createdAt),
    //     updatedAt: new Date(data.config.updatedAt)
    //   }
    // } as SavedProject;
  } catch {
    throw new Error('Erro ao salvar projeto no servidor');
  }
}
