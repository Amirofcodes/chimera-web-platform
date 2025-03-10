import api from './api';

export interface Template {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  tags: string[];
  services: Service[];
}

export interface Service {
  name: string;
  type: string;
  port: number;
}

export const templateService = {
  list: async (filters = {}): Promise<Template[]> => {
    // Will be replaced with real API call
    const response = await api.get('/templates', { params: filters });
    return response.data;
  },
  
  get: async (id: string): Promise<Template> => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },
  
  create: async (data: Omit<Template, 'id'>): Promise<Template> => {
    const response = await api.post('/templates', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Template>): Promise<Template> => {
    const response = await api.put(`/templates/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`);
  }
};