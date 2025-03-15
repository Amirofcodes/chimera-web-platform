import React from 'react';
import { Card } from '../components/shared/Card';
import Button from '../components/shared/Button';

const CliDownloadPage = () => {
  // Function to handle PyPI installation guide copy
  const copyPyPiCommand = () => {
    navigator.clipboard.writeText('pip install chimera-stack-cli');
  };

  // Download URLs from GitHub release
  const linuxDownloadUrl = "https://github.com/Amirofcodes/ChimeraStack_CLI/releases/download/v0.1.0/chimera-stack-cli-linux-x64";
  const macosDownloadUrl = "https://github.com/Amirofcodes/ChimeraStack_CLI/releases/download/v0.1.0/chimera-stack-cli-macos";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">ChimeraStack CLI</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Download Options</h2>
        <p className="mb-6">
          Choose your preferred installation method for the ChimeraStack CLI. The CLI tool allows you to quickly create
          development environments directly from your terminal.
        </p>
        
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-2">Option 1: Install via PyPI</h3>
          <div className="bg-gray-50 p-4 rounded mb-4 flex justify-between items-center">
            <code>pip install chimera-stack-cli</code>
            <button 
              onClick={copyPyPiCommand}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Copy
            </button>
          </div>
          <p className="text-gray-600 text-sm">
            Requires Python 3.8 or higher. This is the recommended method for most users.
          </p>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">Option 2: Direct Download</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <a href={linuxDownloadUrl} className="flex-1">
              <Button variant="primary" className="w-full">
                Download for Linux
              </Button>
            </a>
            <a href={macosDownloadUrl} className="flex-1">
              <Button variant="primary" className="w-full">
                Download for macOS
              </Button>
            </a>
          </div>
          <p className="text-gray-600 text-sm">
            Standalone executables that don't require Python installation.
          </p>
        </div>
      </Card>
      
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Installation Instructions</h2>
        
        <div className="mb-6">
          <h3 className="font-bold mb-2">Linux</h3>
          <div className="bg-gray-50 p-4 rounded">
            <code className="block mb-2">wget {linuxDownloadUrl}</code>
            <code className="block mb-2">chmod +x chimera-stack-cli-linux-x64</code>
            <code className="block">sudo mv chimera-stack-cli-linux-x64 /usr/local/bin/chimera</code>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold mb-2">macOS</h3>
          <div className="bg-gray-50 p-4 rounded">
            <code className="block mb-2">curl -L {macosDownloadUrl} -o chimera</code>
            <code className="block mb-2">chmod +x chimera</code>
            <code className="block">sudo mv chimera /usr/local/bin/</code>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-bold mb-4">Basic Usage</h2>
        <div className="bg-gray-50 p-4 rounded mb-4">
          <code className="block mb-2"># List available templates</code>
          <code className="block mb-2">chimera list</code>
          <code className="block mb-2"># Create a new project</code>
          <code className="block mb-2">chimera create myproject</code>
          <code className="block mb-2"># Create with specific template</code>
          <code className="block">chimera create myproject -t php/nginx/mysql</code>
        </div>
        <p className="text-gray-600">
          For complete documentation, visit our <a href="https://github.com/Amirofcodes/ChimeraStack_CLI" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
        </p>
      </Card>
    </div>
  );
};

export default CliDownloadPage;