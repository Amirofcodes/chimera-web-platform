// frontend/src/services/templateService.ts
import api from './api';

export interface Template {
  id: string;
  name: string;
  description: string;
  tags: string[];
  downloads: number;
}

export interface Service {
  name: string;
  type: string;
  port: number;
}

export const templateService = {
  list: async (): Promise<Template[]> => {
    const response = await api.get('/templates');
    return response.data.templates;
  },
  
  get: async (id: string): Promise<Template> => {
    // For the detailed view, we're using mock data for now
    // In a real implementation, this would call: api.get(`/templates/${id}`)
    const templates = await templateService.list();
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      throw new Error('Template not found');
    }
    
    // Add mock services based on template id
    const longDescription = `A complete ${template.name} for rapid development. 
      This template includes all the necessary configuration for a modern development environment.
      Perfect for building professional applications with ${template.tags.join(', ')}.`;
    
    // Generate mock services based on the template tags
    const services: Service[] = [];
    
    if (template.tags.includes('php')) {
      services.push({ name: 'php', type: 'app', port: 9000 });
    }
    
    if (template.tags.includes('nginx')) {
      services.push({ name: 'nginx', type: 'web', port: 80 });
    }
    
    if (template.tags.includes('mysql')) {
      services.push({ name: 'mysql', type: 'db', port: 3306 });
    }
    
    if (template.tags.includes('mariadb')) {
      services.push({ name: 'mariadb', type: 'db', port: 3306 });
    }
    
    if (template.tags.includes('postgresql')) {
      services.push({ name: 'postgresql', type: 'db', port: 5432 });
    }
    
    if (template.tags.includes('react')) {
      services.push({ name: 'react', type: 'web', port: 3000 });
    }
    
    return {
      ...template,
      longDescription,
      services
    } as any;
  },
  
  download: async (id: string): Promise<string> => {
    const response = await api.get(`/templates/download?id=${id}`);
    return response.data.download_url;
  }
};