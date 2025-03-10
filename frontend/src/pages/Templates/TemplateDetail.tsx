import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Spinner } from '../../components/shared/Spinner';

// Mock data for development
const mockTemplates = [
  {
    id: '1',
    name: 'LAMP Stack',
    description: 'Linux, Apache, MySQL, PHP development stack',
    longDescription: 'A complete web development environment with Apache, MySQL, and PHP. Perfect for PHP projects and WordPress development.',
    tags: ['php', 'mysql', 'apache'],
    services: [
      { name: 'apache', port: 80, type: 'web' },
      { name: 'php', port: 9000, type: 'app' },
      { name: 'mysql', port: 3306, type: 'db' }
    ]
  },
  {
    id: '2',
    name: 'MERN Stack',
    description: 'MongoDB, Express, React, Node.js fullstack environment',
    longDescription: 'A JavaScript-based stack featuring MongoDB, Express.js, React, and Node.js. Great for single-page applications and real-time features.',
    tags: ['react', 'node', 'mongodb'],
    services: [
      { name: 'react', port: 3000, type: 'web' },
      { name: 'node', port: 5000, type: 'api' },
      { name: 'mongodb', port: 27017, type: 'db' }
    ]
  },
  {
    id: '3',
    name: 'Django + PostgreSQL',
    description: 'Python Django with PostgreSQL database',
    longDescription: 'A Python web development environment with Django framework and PostgreSQL database. Ideal for data-driven applications with admin interfaces.',
    tags: ['python', 'django', 'postgresql'],
    services: [
      { name: 'django', port: 8000, type: 'app' },
      { name: 'postgresql', port: 5432, type: 'db' }
    ]
  }
];

const TemplateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const found = mockTemplates.find(t => t.id === id);
      if (found) {
        setTemplate(found);
      } else {
        setError('Template not found');
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const handleCreateEnvironment = () => {
    setCreating(true);
    // Simulate environment creation
    setTimeout(() => {
      setCreating(false);
      navigate('/dashboard');
    }, 1500);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded">
      {error}
    </div>
  );

  if (!template) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{template.name}</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="mb-4">{template.longDescription}</p>
        <div className="flex flex-wrap gap-2 mb-4">
        {template.tags.map((tag: string) => (
            <span 
              key={tag} 
              className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button 
          onClick={handleCreateEnvironment} 
          isLoading={creating}
        >
          Create Environment
        </Button>
      </Card>
      
      <Card>
        <h2 className="text-xl font-semibold mb-4">Services</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {template.services.map((service: { name: string, type: string, port: number }) => (
                <tr key={service.name}>
                  <td className="px-6 py-4 whitespace-nowrap">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{service.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{service.port}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TemplateDetailPage;