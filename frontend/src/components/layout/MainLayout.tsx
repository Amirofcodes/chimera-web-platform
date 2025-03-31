// src/components/layout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useTheme } from '../../context/ThemeContext';
import SideNav from '../layout/SideNav'; // New component for modern layout

export const MainLayout: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  
  // Apply different styles based on theme
  const bgClass = theme === 'modern' 
    ? isDarkMode 
      ? 'bg-modern-background text-modern-text' 
      : 'bg-gray-50 text-gray-900'
    : 'bg-gray-50';

  // Modern theme uses a different layout with a sidebar
  if (theme === 'modern') {
    return (
      <div className={`min-h-screen flex ${bgClass}`}>
        <SideNav />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-grow px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }
  
  // Classic theme layout
  return (
    <div className={`min-h-screen ${bgClass} flex flex-col`}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};