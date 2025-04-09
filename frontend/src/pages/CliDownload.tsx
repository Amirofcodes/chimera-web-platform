import React from 'react';
import { Card } from '../components/shared/Card'; // Reusable Card component for grouping content
import Button from '../components/shared/Button'; // Reusable Button component for actions
import { useTheme } from '../context/ThemeContext'; // Hook to access current theme and dark mode

/**
 * CliDownloadPage Component
 *
 * This page provides users with options to download and install the ChimeraStack CLI.
 * It offers two main download options: installing via PyPI and direct download for Linux and macOS.
 * The page also includes installation instructions and basic usage commands.
 */
const CliDownloadPage = () => {
  // Retrieve current theme settings from the Theme context.
  const { theme, isDarkMode } = useTheme();
  
  // Dynamic text and background classes based on theme and dark mode.
  const textColor = theme === 'modern' && isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const headingColor = theme === 'modern' && isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subtextColor = theme === 'modern' && isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const codeBlockBg = theme === 'modern' && isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
  const linkColor = theme === 'modern' && isDarkMode ? 'text-indigo-400' : 'text-blue-600';
  
  /**
   * copyPyPiCommand: Copies the PyPI installation command to the clipboard.
   */
  const copyPyPiCommand = () => {
    navigator.clipboard.writeText('pip install chimera-stack-cli');
  };

  // Define direct download URLs for Linux and macOS executables.
  const linuxDownloadUrl = "https://github.com/Amirofcodes/ChimeraStack_CLI/releases/download/v0.1.0/chimera-stack-cli-linux-x64";
  const macosDownloadUrl = "https://github.com/Amirofcodes/ChimeraStack_CLI/releases/download/v0.1.0/chimera-stack-cli-macos";

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Page Title */}
      <h1 className={`text-3xl font-bold mb-6 ${headingColor}`}>ChimeraStack CLI</h1>
      
      {/* Card: Download Options */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Download Options</h2>
        <p className={`mb-6 ${textColor}`}>
          Choose your preferred installation method for the ChimeraStack CLI. The CLI tool allows you to quickly create
          development environments directly from your terminal.
        </p>
        
        {/* Option 1: Install via PyPI */}
        <div className="mb-6">
          <h3 className={`font-bold text-lg mb-2 ${textColor}`}>Option 1: Install via PyPI</h3>
          <div className={`${codeBlockBg} p-4 rounded mb-4 flex justify-between items-center`}>
            <code className={textColor}>pip install chimera-stack-cli</code>
            <button 
              onClick={copyPyPiCommand}
              className={`${linkColor} hover:text-blue-800 dark:hover:text-blue-300 text-sm`}
            >
              Copy
            </button>
          </div>
          <p className={subtextColor}>
            Requires Python 3.8 or higher. This is the recommended method for most users.
          </p>
        </div>
        
        {/* Option 2: Direct Download */}
        <div className="mb-4">
          <h3 className={`font-bold text-lg mb-2 ${textColor}`}>Option 2: Direct Download</h3>
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
          <p className={subtextColor}>
            Standalone executables that don't require Python installation.
          </p>
        </div>
      </Card>
      
      {/* Card: Installation Instructions */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-4">Installation Instructions</h2>
        
        {/* Linux Installation */}
        <div className="mb-6">
          <h3 className={`font-bold mb-2 ${textColor}`}>Linux</h3>
          <div className={`${codeBlockBg} p-4 rounded`}>
            <code className={`block mb-2 ${textColor}`}>wget {linuxDownloadUrl}</code>
            <code className={`block mb-2 ${textColor}`}>chmod +x chimera-stack-cli-linux-x64</code>
            <code className={`block ${textColor}`}>sudo mv chimera-stack-cli-linux-x64 /usr/local/bin/chimera</code>
          </div>
        </div>
        
        {/* macOS Installation */}
        <div className="mb-6">
          <h3 className={`font-bold mb-2 ${textColor}`}>macOS</h3>
          <div className={`${codeBlockBg} p-4 rounded`}>
            <code className={`block mb-2 ${textColor}`}>curl -L {macosDownloadUrl} -o chimera</code>
            <code className={`block mb-2 ${textColor}`}>chmod +x chimera</code>
            <code className={`block ${textColor}`}>sudo mv chimera /usr/local/bin/</code>
          </div>
        </div>
      </Card>
      
      {/* Card: Basic Usage */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Basic Usage</h2>
        <div className={`${codeBlockBg} p-4 rounded mb-4`}>
          <code className={`block mb-2 ${textColor}`}># List available templates</code>
          <code className={`block mb-2 ${textColor}`}>chimera list</code>
          <code className={`block mb-2 ${textColor}`}># Create a new project</code>
          <code className={`block mb-2 ${textColor}`}>chimera create myproject</code>
          <code className={`block mb-2 ${textColor}`}># Create with specific template</code>
          <code className={`block ${textColor}`}>chimera create myproject -t php/nginx/mysql</code>
        </div>
        <p className={subtextColor}>
          For complete documentation, visit our <a href="https://github.com/Amirofcodes/ChimeraStack_CLI" className={`${linkColor} hover:underline`} target="_blank" rel="noopener noreferrer">GitHub repository</a>.
        </p>
      </Card>
    </div>
  );
};

export default CliDownloadPage;
