// Test setup file
const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: console.error, // Keep error logging
};

// Clean up database connections after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
