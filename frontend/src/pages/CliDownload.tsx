// frontend/src/pages/CliDownload.tsx
import React from 'react';
import { Card } from '../components/shared/Card';
import Button from '../components/shared/Button';

const CliDownloadPage = () => {
  // Mock download function
  const handleDownload = () => {
    window.open('/downloads/chimera-cli.zip', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">ChimeraStack CLI</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Download the CLI Tool</h2>
        <p className="mb-4">
          The ChimeraStack CLI allows you to quickly create development environments directly from your terminal.
        </p>
        <Button onClick={handleDownload} variant="primary">
          Download CLI
        </Button>
      </Card>
      
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Installation Guide</h2>
        <div className="mb-4">
          <h3 className="font-bold mb-2 text-lg">Prerequisites</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Python 3.8 or higher</li>
            <li>Docker and Docker Compose</li>
          </ul>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold mb-2 text-lg">Installation Steps</h3>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <code className="block">
              # Extract the downloaded zip file<br />
              unzip chimera-cli.zip<br /><br />
              
              # Navigate to the extracted directory<br />
              cd chimera-cli<br /><br />
              
              # Install using pip<br />
              pip install .
            </code>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold mb-4">Basic Usage</h2>
        <div className="bg-gray-50 p-4 rounded mb-4">
          <code className="block">
            # List available templates<br />
            chimera list<br /><br />
            
            # Create a new project<br />
            chimera create myproject<br /><br />
            
            # Create a project with a specific template<br />
            chimera create myproject -t php/nginx/mysql
          </code>
        </div>
        <p className="text-gray-600">
          For more detailed documentation, visit our GitHub repository.
        </p>
      </Card>
    </div>
  );
};

export default CliDownloadPage;