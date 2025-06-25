import axios from 'axios';
import { ProductGroup, FlyerConfig } from '../types';

// Get the base URL from Electron API or fallback to localhost
const getBaseURL = async () => {
  if (window.electronAPI) {
    return await window.electronAPI.getBackendUrl();
  }
  return 'http://localhost:8080';
};

const createApiClient = async () => {
  const baseURL = await getBaseURL();
  return axios.create({
    baseURL: `${baseURL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Types from Backend DTOs
export interface ProjectSummary {
    id: string;
    name: string;
    updatedAt: string;
}

export interface FullProject extends ProjectSummary {
    config: FlyerConfig;
    groups: ProductGroup[];
}

export interface SaveProjectPayload {
    name: string;
    config: Omit<FlyerConfig, 'id' | 'createdAt' | 'updatedAt'>;
    groups: ProductGroup[];
}

// API Functions
export const getProjects = async (): Promise<ProjectSummary[]> => {
    const apiClient = await createApiClient();
    const response = await apiClient.get('/projects');
    return response.data;
};

export const getProjectById = async (id: string): Promise<FullProject> => {
    const apiClient = await createApiClient();
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
};

export const saveProject = async (projectData: SaveProjectPayload): Promise<FullProject> => {
    const apiClient = await createApiClient();
    const response = await apiClient.post('/projects', projectData);
    return response.data;
};

export const updateProject = async (id: string, projectData: SaveProjectPayload): Promise<FullProject> => {
    const apiClient = await createApiClient();
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
    const apiClient = await createApiClient();
    await apiClient.delete(`/projects/${id}`);
};

export const saveOrUpdateProject = async (projectData: SaveProjectPayload, existingId?: string): Promise<FullProject> => {
    if (existingId) {
        return updateProject(existingId, projectData);
    } else {
        return saveProject(projectData);
    }
};
