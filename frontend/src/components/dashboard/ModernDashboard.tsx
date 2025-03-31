// src/components/dashboard/ModernDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../shared/Card';
import { useAuth } from '../../context/AuthContext';
import { templateService, Template } from '../../services/templateService';
import { Spinner } from '../shared/Spinner';
import Button from '../shared/Button';
import { useTheme } from '../../context/ThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, positive }) => {
  const { isDarkMode } = useTheme();
  
  const bgClass = isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-100';
  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-800';
  const changeTextClass = positive 
    ? isDarkMode ? 'text-green-400' : 'text-green-500'
    : isDarkMode ? 'text-red-400' : 'text-red-500';
  
  return (
    <Card className="flex items-center">
      <div className={`p-3 rounded-lg mr-4 ${bgClass}`}>
        {icon}
      </div>
      <div>
        <p className={isDarkMode ? "text-sm text-gray-400" : "text-sm text-gray-500"}>{title}</p>
        <p className={`text-2xl font-semibold ${textClass}`}>{value}</p>
        {change && (
          <p className={`text-xs ${changeTextClass}`}>
            {positive ? '↑' : '↓'} {change} from last month
          </p>
        )}
      </div>
    </Card>
  );
};

const ModernDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);

  // Text colors based on dark mode
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const subtextClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const highlightedTextClass = isDarkMode ? 'text-indigo-400' : 'text-indigo-600';

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const templateData = await templateService.list();
        setTemplates(templateData.slice(0, 3));
        
        // Mock data for recent downloads (would come from API in real implementation)
        setRecentDownloads([
          { template_id: 'php/nginx/mysql', template_name: 'PHP/Nginx/MySQL Stack', download_date: new Date(Date.now() - 86400000 * 2).toISOString() },
          { template_id: 'fullstack/react-php/mysql-nginx', template_name: 'React/PHP/MySQL Fullstack Stack', download_date: new Date(Date.now() - 86400000 * 5).toISOString() }
        ]);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);
  
  // Mock stat data
  const stats = [
    { 
      title: 'Templates Used', 
      value: '12', 
      change: '14%',
      positive: true,
      icon: (
        <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" fill="currentColor" />
          <path d="M4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" fill="currentColor" />
        </svg>
      )
    },
    { 
      title: 'Active Environments', 
      value: '3', 
      change: '5%',
      positive: false,
      icon: (
        <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 12h14M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    { 
      title: 'Downloads', 
      value: '27', 
      change: '32%',
      positive: true,
      icon: (
        <svg className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${textClass}`}>Welcome back, {user?.name || 'Developer'}</h1>
          <p className={subtextClass}>
            Here's what's happening with your environments today.
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            positive={stat.positive}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Templates */}
        <Card className="lg:col-span-2" title="Recent Templates">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td className={`px-6 py-4 whitespace-nowrap ${textClass}`}>
                      <div className="font-medium">{template.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDarkMode 
                          ? 'bg-indigo-900 text-indigo-300' 
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {template.tags[0] || 'Stack'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/templates/${encodeURIComponent(template.id)}`}>
                        <Button variant="secondary" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <Link to="/templates" className={`${highlightedTextClass} hover:underline text-sm font-medium`}>
              View all templates →
            </Link>
          </div>
        </Card>
        
        {/* Download History */}
        <Card title="Recent Downloads">
          {recentDownloads.length === 0 ? (
            <p className={subtextClass}>You haven't downloaded any templates yet.</p>
          ) : (
            <div className="space-y-4">
              {recentDownloads.map((download, index) => (
                <div key={index} className="flex items-start">
                  <div className={`p-2 rounded mr-3 ${isDarkMode ? 'bg-indigo-900/40' : 'bg-indigo-100'}`}>
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <Link 
                      to={`/templates/${encodeURIComponent(download.template_id)}`}
                      className={`${highlightedTextClass} hover:underline font-medium block`}
                    >
                      {download.template_name}
                    </Link>
                    <div className={`text-sm ${subtextClass}`}>
                      {new Date(download.download_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ModernDashboard;