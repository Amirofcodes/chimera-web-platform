// src/pages/Dashboard.tsx
import React from 'react';
import { Card } from '../components/shared/Card';
import { useAuth } from '../context/AuthContext';
import { templateService, Template } from '../services/templateService';
import { Spinner } from '../components/shared/Spinner';
import { Link } from 'react-router-dom';
import DownloadHistoryWidget from './DownloadHistoryWidget';
import { useTheme } from '../context/ThemeContext';
import ModernDashboard from '../components/dashboard/ModernDashboard';
import { useEffect, useState } from 'react';

const DashboardPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const templateData = await templateService.list();
        // Just show the first 3 as "recently viewed"
        setTemplates(templateData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);
  
  // If modern theme is active, use the ModernDashboard component
  if (theme === 'modern') {
    return <ModernDashboard />;
  }

  // Classic dashboard
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || 'Developer'}</h2>
        <p>Manage your development environments and templates from this dashboard.</p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-bold mb-2">Recent Templates</h3>
          {loading ? (
            <Spinner />
          ) : templates.length > 0 ? (
            <ul className="divide-y">
              {templates.map(template => (
                <li key={template.id} className="py-2">
                  <Link to={`/templates/${template.id}`} className="text-blue-600 hover:underline">
                    {template.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No recent templates</p>
          )}
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold mb-2">Quick Links</h3>
          <ul className="divide-y">
            <li className="py-2">
              <Link to="/profile" className="text-blue-600 hover:underline">
                Edit Your Profile
              </Link>
            </li>
            <li className="py-2">
              <Link to="/templates" className="text-blue-600 hover:underline">
                Browse All Templates
              </Link>
            </li>
            <li className="py-2">
              <Link to="/download-cli" className="text-blue-600 hover:underline">
                Download CLI Tool
              </Link>
            </li>
          </ul>
        </Card>
      </div>
      
      {/* Add the download history widget */}
      <DownloadHistoryWidget />
    </div>
  );
};

export default DashboardPage;