// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    // Use <rootDir>/src/setupTests.ts because jest.config.js is in the frontend folder.
    setupFiles: ['<rootDir>/src/setupTests.ts'],
    // ... any other Jest options you may need
  };
  