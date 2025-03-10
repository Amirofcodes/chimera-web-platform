import api from './api';

export interface Environment {
  id: string;
  name: string;
  templateId: string;
  status: 'running' | 'stopped' | 'failed';
  services: EnvironmentService[];
  createdAt: string;
}

export interface EnvironmentService {
  name: string;
  port: number;
  status: 'running' | 'stopped' | 'failed';
}

export const environmentService = {
  list: async (): Promise<Environment[]> => {
    const response = await api.get('/environments');
    return response.data;
  },
  
  get: async (id: string): Promise<Environment> => {
    const response = await api.get(`/environments/${id}`);
    return response.data;
  },
  
  create: async (templateId: string, name: string): Promise<Environment> => {
    const response = await api.post('/environments', { templateId, name });
    return response.data;
  },
  
  start: async (id: string): Promise<Environment> => {
    const response = await api.post(`/environments/${id}/start`);
    return response.data;
  },
  
  stop: async (id: string): Promise<Environment> => {
    const response = await api.post(`/environments/${id}/stop`);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/environments/${id}`);
  }
};