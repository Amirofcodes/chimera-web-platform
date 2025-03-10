import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} ChimeraStack. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};