import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card';
import { useAuth } from '../context/AuthContext';
import { templateService, Template } from '../services/templateService';
import { Spinner } from '../components/shared/Spinner';
import { Link } from 'react-router-dom';
import DownloadHistoryWidget from './DownloadHistoryWidget';

const DashboardPage = () => {
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || 'Developer'}</h2>
        <p>Manage your development environments and templates from this dashboard.</p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="text-lg font-bold mb-2">Active Environments</h3>
          <p className="text-2xl font-semibold">0</p>
        </Card>
        
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
          <h3 className="text-lg font-bold mb-2">System Status</h3>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>All systems operational</span>
          </div>
        </Card>
      </div>
      
      {/* Add the download history widget */}
      <DownloadHistoryWidget />
    </div>
  );
};

export default DashboardPage;