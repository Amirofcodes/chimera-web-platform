// src/pages/Templates/TemplatesList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Spinner } from '../../components/shared/Spinner';
import { templateService, Template } from '../../services/templateService';
import { useTheme } from '../../context/ThemeContext';

const TemplatesListPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme, isDarkMode } = useTheme();

  // Text colors based on theme
  const textColor = theme === 'modern' && isDarkMode ? 'text-gray-200' : 'text-gray-700';
  const headingColor = theme === 'modern' && isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const descriptionColor = theme === 'modern' && isDarkMode ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const templates = await templateService.list();
        setTemplates(templates);
        setError(null);
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError('Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className={theme === 'modern' && isDarkMode 
      ? 'bg-red-900/30 text-red-400 p-4 rounded' 
      : 'bg-red-50 text-red-600 p-4 rounded'
    }>
      {error}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${headingColor}`}>Development Templates</h1>
          <p className={descriptionColor}>Choose a template to quickly set up your development environment.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Link key={template.id} to={`/templates/${encodeURIComponent(template.id)}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <h2 className={`text-xl font-bold mb-2 ${headingColor}`}>{template.name}</h2>
              <p className={`mb-4 ${descriptionColor}`}>{template.description}</p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className={theme === 'modern'
                      ? isDarkMode
                        ? 'bg-indigo-900/30 text-indigo-300 text-xs px-2 py-1 rounded'
                        : 'bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded'
                      : 'bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded'
                    }
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