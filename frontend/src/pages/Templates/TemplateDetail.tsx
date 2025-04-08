// src/pages/Templates/TemplateDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card'; // Reusable Card component for layout
import Button from '../../components/shared/Button'; // Reusable Button component
import { Spinner } from '../../components/shared/Spinner'; // Spinner component for loading state
import { templateService } from '../../services/templateService'; // Service to interact with the templates API
import { useTheme } from '../../context/ThemeContext'; // Hook to access theme and dark mode information

/**
 * TemplateDetailPage Component
 *
 * This component fetches and displays detailed information about a template.
 * It handles:
 *  - Fetching template data from the backend using the templateService.
 *  - Displaying a loading spinner while fetching data.
 *  - Handling errors if the template is not found.
 *  - Allowing users to download the template.
 *  - Rendering additional details like tags and services associated with the template.
 */
const TemplateDetailPage = () => {
  // Retrieve the template id from the URL parameters.
  const { id } = useParams<{ id: string }>();
  // Navigation hook for programmatic route changes.
  const navigate = useNavigate();
  // Retrieve current theme and dark mode status for dynamic styling.
  const { theme, isDarkMode } = useTheme();
  
  // Local state to store template details, loading status, download state, and any errors.
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Define dynamic text classes based on the current theme and dark mode.
  const textColor = isDarkMode && theme === 'modern' ? 'text-gray-200' : 'text-gray-700';
  const labelColor = isDarkMode && theme === 'modern' ? 'text-gray-300' : 'text-gray-700';
  // Define background color classes for fields based on theme.
  const fieldBgColor = isDarkMode && theme === 'modern' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-gray-50 border-gray-100';

  // Fetch the template details when the component mounts or the id changes.
  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        if (id) {
          // Decode the template id to correctly handle special characters.
          const decodedId = decodeURIComponent(id);
          console.log("Decoded template ID:", decodedId);
          
          // Fetch template data from the backend.
          const templateData = await templateService.get(decodedId);
          setTemplate(templateData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('Template not found');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  /**
   * handleDownloadTemplate: Handles the template download process.
   *
   * - Sets the downloading state and clears previous errors.
   * - Calls the templateService.download API to initiate the download.
   * - On success, refreshes the template data (e.g., to update the download count).
   * - Catches and displays any errors that occur.
   */
  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError(null);
    setDownloadSuccess(false);
    
    try {
      if (id) {
        // Decode the template id before making the download call.
        const decodedId = decodeURIComponent(id);
        await templateService.download(decodedId);
        setDownloadSuccess(true);
        
        // Refresh template data to update information like download count.
        const refreshedTemplate = await templateService.get(decodedId);
        setTemplate(refreshedTemplate);
      }
    } catch (err: any) {
      console.error('Download failed:', err);
      setError(err.message || 'Failed to download template');
    } finally {
      setDownloading(false);
    }
  };

  // While loading, show a centered spinner.
  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <Spinner size="lg" />
    </div>
  );

  // If there's an error, display the error message in a styled alert.
  if (error) return (
    <div className={`bg-red-50 text-red-600 p-4 rounded ${theme === 'modern' && isDarkMode ? 'bg-red-900/30' : ''}`}>
      {error}
    </div>
  );

  // If template data is not available, render nothing.
  if (!template) return null;

  return (
    <div>
      {/* Template Title */}
      <h1 className={`text-2xl font-bold mb-6 ${textColor}`}>{template.name}</h1>
      
      {/* Template Details Card */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className={`mb-4 ${textColor}`}>{template.longDescription}</p>
        
        {/* Render template tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.map((tag: string) => (
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
        
        {/* Display download success message if download is initiated */}
        {downloadSuccess && (
          <div className={theme === 'modern' && isDarkMode 
            ? 'bg-green-900/30 text-green-300 p-3 rounded mb-4'
            : 'bg-green-50 text-green-700 p-3 rounded mb-4'
          }>
            Template download initiated successfully!
          </div>
        )}
        
        {/* Download Button and Download Count */}
        <div className="flex items-center">
          <Button 
            onClick={handleDownloadTemplate} 
            isLoading={downloading}
            disabled={downloading}
          >
            Download Template
          </Button>
          <span className={`ml-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {template.downloads} downloads
          </span>
        </div>
      </Card>
      
      {/* Services Card: Display list of services associated with the template */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Services</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={theme === 'modern' && isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Service</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Type</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Port</th>
              </tr>
            </thead>
            <tbody className={theme === 'modern' && isDarkMode ? 'divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
              {template.services.map((service: { name: string, type: string, port: number }) => (
                <tr key={service.name}>
                  <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>{service.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>{service.type}</td>
                  <td className={`px-6 py-4 whitespace-nowrap ${textColor}`}>{service.port}</td>
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
