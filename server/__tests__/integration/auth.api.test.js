const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/userModel');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API - Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database connection
    const testDbUri = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/holy-family-test';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri);
    }
  });

  afterAll(async () => {
    // Cleanup and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.role).toBe('user');
    });

    it('should return 400 if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      };

      // Register first time
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 if password is missing', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210'
        // password missing
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('Password is required');
    });

    it('should return 400 if phone number is missing', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@1234'
        // phoneNumber missing
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('Phone number is required');
    });

    it('should clean phone number with country code', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '919876543210', // with country code
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Verify user in database
      const user = await User.findOne({ email: userData.email });
      expect(user.phoneNumber).toBe('9876543210'); // country code removed
    });

    it('should handle validation errors properly', async () => {
      const invalidData = {
        name: 'J', // too short
        email: 'invalid-email',
        phoneNumber: '123',
        password: 'weak'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before login tests
      await User.create({
        name: 'Test User',
        email: 'testuser@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test@1234'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });

    it('should return 401 with invalid password', async () => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('POST /api/auth/register-buyer', () => {
    // Buyer registration test removed - buyer role no longer supported
  });
});
