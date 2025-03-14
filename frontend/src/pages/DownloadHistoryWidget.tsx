import React, { useState, useEffect } from 'react';
import { Card } from '../components/shared/Card';
import { Spinner } from '../components/shared/Spinner';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface DownloadHistory {
  template_id: string;
  template_name: string;
  download_date: string;
}

const DownloadHistoryWidget = () => {
  const [downloads, setDownloads] = useState<DownloadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        setLoading(true);
        const response = await api.get('/user/downloads');
        setDownloads(response.data.downloads || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching download history:', err);
        setError('Failed to load download history');
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);

  if (loading) {
    return (
      <Card>
        <h3 className="text-lg font-bold mb-2">Your Downloads</h3>
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <h3 className="text-lg font-bold mb-2">Your Downloads</h3>
        <div className="text-red-500 text-sm">{error}</div>
      </Card>
    );
  }

  // For development/demo purposes, if no real data available yet
  const demoDownloads: DownloadHistory[] = [
    {
      template_id: 'php/nginx/mysql',
      template_name: 'PHP/Nginx/MySQL Stack',
      download_date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    },
    {
      template_id: 'fullstack/react-php/mysql-nginx',
      template_name: 'React/PHP/MySQL Fullstack Stack',
      download_date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    },
  ];

  const displayDownloads = downloads.length > 0 ? downloads : demoDownloads;

  return (
    <Card>
      <h3 className="text-lg font-bold mb-2">Your Downloads</h3>
      {displayDownloads.length === 0 ? (
        <p className="text-gray-500">You haven't downloaded any templates yet.</p>
      ) : (
        <div className="divide-y">
          {displayDownloads.map((download, index) => (
            <div key={index} className="py-2">
              <Link 
                to={`/templates/${encodeURIComponent(download.template_id)}`}
                className="text-blue-600 hover:underline font-medium"
              >
                {download.template_name}
              </Link>
              <div className="text-sm text-gray-500">
                {new Date(download.download_date).toLocaleDateString()} at {new Date(download.download_date).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DownloadHistoryWidget;