const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

/**
 * Test Helper Utilities
 */

// Generate a test JWT token
const generateTestToken = (userId, role = 'user') => {
  const jwtSecret = process.env.JWT_SECRET || 'test_secret_key';
  return jwt.sign({ id: userId, role }, jwtSecret, { expiresIn: '1h' });
};

// Create a test user
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    phoneNumber: '9876543210',
    password: 'Test@1234',
    role: 'user'
  };

  const user = await User.create({ ...defaultUser, ...userData });
  return user;
};

// Create multiple test users
const createTestUsers = async (count = 3) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      name: `Test User ${i + 1}`,
      email: `testuser${i + 1}${Date.now()}@example.com`,
      phoneNumber: `987654${String(i).padStart(4, '0')}`
    });
    users.push(user);
  }
  return users;
};

// Clear all test data
const clearTestData = async () => {
  const collections = ['users', 'orders', 'products', 'workers'];
  
  for (const collection of collections) {
    try {
      await require('../../models/userModel').db.collection(collection).deleteMany({});
    } catch (error) {
      // Collection might not exist, ignore
    }
  }
};

// Mock request object
const mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    user: data.user || {},
    headers: data.headers || {},
    get: jest.fn((header) => data.headers?.[header]),
    ...data
  };
};

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

// Wait for async operations
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format (Indian)
const isValidPhoneNumber = (phone) => {
  const cleanPhone = String(phone).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleanPhone) || 
         (cleanPhone.startsWith('91') && /^[6-9]\d{9}$/.test(cleanPhone.substring(2)));
};

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random email
const generateRandomEmail = () => {
  return `test${Date.now()}${Math.random().toString(36).substring(7)}@example.com`;
};

// Mock next function for middleware
const mockNext = () => jest.fn();

module.exports = {
  generateTestToken,
  createTestUser,
  createTestUsers,
  clearTestData,
  mockRequest,
  mockResponse,
  mockNext,
  waitFor,
  isValidEmail,
  isValidPhoneNumber,
  generateRandomString,
  generateRandomEmail
};
