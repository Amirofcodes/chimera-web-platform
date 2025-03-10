import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Spinner } from '../../components/shared/Spinner';
import Button from '../../components/shared/Button';

// Mock data for development
const mockTemplates = [
  {
    id: '1',
    name: 'LAMP Stack',
    description: 'Linux, Apache, MySQL, PHP development stack',
    tags: ['php', 'mysql', 'apache']
  },
  {
    id: '2',
    name: 'MERN Stack',
    description: 'MongoDB, Express, React, Node.js fullstack environment',
    tags: ['react', 'node', 'mongodb']
  },
  {
    id: '3',
    name: 'Django + PostgreSQL',
    description: 'Python Django with PostgreSQL database',
    tags: ['python', 'django', 'postgresql']
  }
];

const TemplatesListPage = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, this would fetch from the API
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setTemplates(mockTemplates);
      setLoading(false);
    }, 500);
  }, []);

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Development Templates</h1>
          <p>Choose a template to quickly set up your development environment.</p>
        </div>
        <Link to="/templates/create">
          <Button>Create Template</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Link key={template.id} to={`/templates/${template.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <h2 className="text-xl font-bold mb-2">{template.name}</h2>
              <p className="text-gray-600 mb-4">{template.description}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TemplatesListPage;