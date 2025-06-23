import axios from 'axios';
import { ProductGroup, FlyerConfig } from '../types';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

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
    const response = await apiClient.get('/projects');
    return response.data;
};

export const getProjectById = async (id: string): Promise<FullProject> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
};

export const saveProject = async (projectData: SaveProjectPayload): Promise<FullProject> => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
};
