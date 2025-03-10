import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css'; // Import global styles
import './styles/output.css';   // Generated output CSS
import App from './App';


const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
