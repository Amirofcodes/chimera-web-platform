import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">ChimeraStack</span>
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/templates" className="text-gray-700 hover:text-blue-600">Templates</Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};