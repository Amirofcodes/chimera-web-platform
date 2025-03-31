/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Classic theme colors
        'classic-primary': '#2563eb', // blue-600
        'classic-secondary': '#f3f4f6', // gray-100
        'classic-accent': '#1d4ed8', // blue-700
        'classic-background': '#f9fafb', // gray-50
        'classic-card': '#ffffff', // white
        'classic-text': '#111827', // gray-900
        
        // Modern theme colors (improved for visibility)
        'modern-primary': '#4f46e5', // indigo-600
        'modern-secondary': '#1e1e2f', // dark blue-gray
        'modern-accent': '#8b5cf6', // violet-500
        'modern-background': '#f9fafb', // for light mode
        'modern-background-dark': '#0f172a', // for dark mode
        'modern-card': '#ffffff', // for light mode
        'modern-card-dark': '#1e293b', // for dark mode
        'modern-text': '#111827', // for light mode
        'modern-text-dark': '#e2e8f0', // for dark mode
      },
      boxShadow: {
        'modern-card': '0 4px 15px 0 rgba(0, 0, 0, 0.1)',
        'modern-card-dark': '0 4px 15px 0 rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'modern': '12px',
      },
    },
  },
  plugins: [],
}