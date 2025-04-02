// src/setupTests.ts
import '@testing-library/jest-dom/extend-expect';

// Polyfill for window.matchMedia to prevent errors in tests.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // or set to true if you want to simulate dark mode by default
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
