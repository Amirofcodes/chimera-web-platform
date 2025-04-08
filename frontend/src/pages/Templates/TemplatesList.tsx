// src/pages/Templates/TemplatesList.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/shared/Card'; // Reusable Card component for template display
import { Spinner } from '../../components/shared/Spinner'; // Spinner component for loading state
import { templateService, Template } from '../../services/templateService'; // Service to fetch template data and Template type
import { useTheme } from '../../context/ThemeContext'; // Hook to access current theme and dark mode status

/**
 * TemplatesListPage Component
 *
 * This component fetches and displays a list of development templates.
 * It shows a loading spinner while data is being fetched and displays
 * an error message if fetching fails.
 * Templates are rendered as clickable cards that navigate to the template detail page.
 */
const TemplatesListPage = () => {
  // Local state to hold templates, loading status, and error messages.
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Retrieve the current theme and dark mode flag from the Theme context.
  const { theme, isDarkMode } = useTheme();

  // Define dynamic text classes based on the theme and dark mode status.
  const textColor = theme === 'modern' && isDarkMode ? 'text-gray-200' : 'text-gray-700';
  const headingColor = theme === 'modern' && isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const descriptionColor = theme === 'modern' && isDarkMode ? 'text-gray-400' : 'text-gray-600';

  // useEffect to fetch the list of templates when the component mounts.
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Call the template service to fetch templates.
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

  // Render a loading spinner while fetching data.
  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <Spinner size="lg" />
    </div>
  );

  // Render an error message if template fetching fails.
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
      {/* Header section with page title and description */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${headingColor}`}>Development Templates</h1>
          <p className={descriptionColor}>
            Choose a template to quickly set up your development environment.
          </p>
        </div>
      </div>
      
      {/* Grid layout for displaying template cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          // Each template is wrapped in a Link to navigate to its detail page.
          <Link key={template.id} to={`/templates/${encodeURIComponent(template.id)}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <h2 className={`text-xl font-bold mb-2 ${headingColor}`}>{template.name}</h2>
              <p className={`mb-4 ${descriptionColor}`}>{template.description}</p>
              {/* Display template tags */}
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
