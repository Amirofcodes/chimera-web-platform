// src/components/layout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useTheme } from '../../context/ThemeContext';
import SideNav from '../layout/SideNav';

export const MainLayout: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  
  // Apply different styles based on theme
  let bgClass = '';
  let textClass = '';
  
  if (theme === 'modern') {
    if (isDarkMode) {
      bgClass = 'bg-modern-background-dark';
      textClass = 'text-modern-text-dark';
    } else {
      bgClass = 'bg-gray-50';
      textClass = 'text-gray-900';
    }
  } else {
    // Classic theme
    bgClass = 'bg-gray-50';
    textClass = 'text-gray-900';
  }

  // Modern theme uses a different layout with a sidebar and no top navbar
  if (theme === 'modern') {
    return (
      <div className={`min-h-screen flex ${bgClass} ${textClass}`}>
        <SideNav />
        <div className="flex-1 flex flex-col">
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
  
  // Classic theme layout with top navbar
  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};