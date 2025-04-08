// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card } from '../components/shared/Card'; // Reusable Card component for layout sections
import { useAuth } from '../context/AuthContext'; // Auth context for accessing user information
import { templateService, Template } from '../services/templateService'; // Service to fetch templates and Template type
import { Spinner } from '../components/shared/Spinner'; // Spinner component to show loading state
import { Link } from 'react-router-dom'; // Link component for navigation
import DownloadHistoryWidget from './DownloadHistoryWidget'; // Component to display download history
import { useTheme } from '../context/ThemeContext'; // Hook to access current theme
import ModernDashboard from '../components/dashboard/ModernDashboard';

/**
 * DashboardPage Component
 *
 * This component renders the dashboard page. It fetches recent templates,
 * displays a welcome message and some quick links, and includes a widget for download history.
 * Depending on the active theme, it conditionally renders either the ModernDashboard component
 * or a Classic dashboard layout.
 */
const DashboardPage = () => {
  // Access the current theme from the Theme context.
  const { theme } = useTheme();
  // Retrieve current user data from Auth context.
  const { user } = useAuth();
  // Local state to hold the list of recent templates.
  const [templates, setTemplates] = useState<Template[]>([]);
  // Local state to track loading status when fetching templates.
  const [loading, setLoading] = useState(true);

  // useEffect to fetch the list of templates when the component mounts.
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Fetch all templates from the backend.
        const templateData = await templateService.list();
        // For "recent templates", display only the first 3.
        setTemplates(templateData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // If the Modern theme is active, delegate rendering to the ModernDashboard component.
  if (theme === 'modern') {
    return <ModernDashboard />;
  }

  // Classic Dashboard Layout
  return (
    <div>
      {/* Dashboard Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Welcome Card */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || 'Developer'}</h2>
        <p>Manage your development environments and templates from this dashboard.</p>
      </Card>
      
      {/* Section for Recent Templates and Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Templates Card */}
        <Card>
          <h3 className="text-lg font-bold mb-2">Recent Templates</h3>
          {loading ? (
            // Display a spinner while loading templates.
            <Spinner />
          ) : templates.length > 0 ? (
            // If templates exist, display them as a list.
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
            // Message if no recent templates are found.
            <p className="text-gray-600">No recent templates</p>
          )}
        </Card>
        
        {/* Quick Links Card */}
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
      
      {/* Download History Widget */}
      <DownloadHistoryWidget />
    </div>
  );
};

export default DashboardPage;
