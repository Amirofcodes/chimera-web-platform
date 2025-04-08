import React from 'react'; // Import React to enable JSX syntax.
import { createRoot } from 'react-dom/client'; // Import createRoot from React 18 for rendering.
import './styles/globals.css'; // Import global CSS styles (base styling for the app).
import './styles/output.css';   // Import generated CSS styles (compiled Tailwind or similar output).
import App from './App'; // Import the main App component which contains the application's root component.

// Get the root DOM element where the React app will be mounted.
const container = document.getElementById('root');
// If the root element is not found, throw an error to halt execution.
if (!container) throw new Error('Root element not found');

// Create a React root using the container element.
const root = createRoot(container);

// Render the application within the React.StrictMode wrapper for highlighting potential problems.
root.render(
  <React.StrictMode>
    <App /> {/* The main App component is rendered here */}
  </React.StrictMode>
);
