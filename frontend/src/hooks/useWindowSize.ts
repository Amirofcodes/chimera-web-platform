import { useState, useEffect } from 'react';

// Define an interface for the window size object.
interface WindowSize {
  width: number;
  height: number;
}

/**
 * useWindowSize Hook
 *
 * This hook returns the current window dimensions (width and height).
 * It sets up an event listener for window resize events and updates
 * the state accordingly. The listener is cleaned up when the component unmounts.
 *
 * @returns {WindowSize} The current window width and height.
 */
export const useWindowSize = (): WindowSize => {
  // Initialize the state with the current window dimensions.
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Define a handler function to update the state when the window is resized.
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener for the 'resize' event.
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts.
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  return windowSize;
};
