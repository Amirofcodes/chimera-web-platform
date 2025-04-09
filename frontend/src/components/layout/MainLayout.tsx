// src/components/layout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // Outlet renders nested routes
import { Navbar } from './Navbar'; // Top navigation bar component (for classic theme)
import { Footer } from './Footer'; // Footer component
import { useTheme } from '../../context/ThemeContext'; // Theme context to get current theme and dark mode status
import SideNav from '../layout/SideNav'; // Sidebar navigation component (for modern theme)

export const MainLayout: React.FC = () => {
  // Retrieve the current theme and dark mode status from the Theme context.
  const { theme, isDarkMode } = useTheme();
  
  // Define variables to hold dynamic CSS classes for background and text based on theme and dark mode.
  let bgClass = '';
  let textClass = '';
  
  // Determine classes for modern theme or default to classic styling.
  if (theme === 'modern') {
    if (isDarkMode) {
      // For modern theme in dark mode.
      bgClass = 'bg-modern-background-dark';
      textClass = 'text-modern-text-dark';
    } else {
      // For modern theme in light mode.
      bgClass = 'bg-gray-50';
      textClass = 'text-gray-900';
    }
  } else {
    // Classic theme always uses these default classes.
    bgClass = 'bg-gray-50';
    textClass = 'text-gray-900';
  }

  // For the modern theme, use a layout with a sidebar (SideNav) and no top navbar.
  if (theme === 'modern') {
    return (
      <div className={`min-h-screen flex ${bgClass} ${textClass}`}>
        {/* Sidebar navigation for modern theme */}
        <SideNav />
        <div className="flex-1 flex flex-col">
          {/* Main content area with padding */}
          <main className="flex-grow px-6 py-6">
            <div className="max-w-7xl mx-auto">
              {/* Render nested routes */}
              <Outlet />
            </div>
          </main>
          {/* Footer displayed at the bottom */}
          <Footer />
        </div>
      </div>
    );
  }
  
  // For the classic theme, use a layout with a top navigation bar (Navbar).
  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Top navigation bar for classic theme */}
      <Navbar />
      {/* Main content area with container, auto margin, and padding */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
      {/* Footer displayed at the bottom */}
      <Footer />
    </div>
  );
};
