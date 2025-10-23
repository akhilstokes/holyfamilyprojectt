const authController = require('../../controllers/authController');
const User = require('../../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../utils/sendEmail');

// Mock dependencies
jest.mock('../../models/userModel');
jest.mock('jsonwebtoken');
jest.mock('../../utils/sendEmail');

describe('Auth Controller - Unit Tests', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
      params: {},
      user: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock JWT secret
    process.env.JWT_SECRET = 'test_secret_key';
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      };
      
      req.body = userData;

      const mockUser = {
        _id: 'user123',
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        role: 'user'
      };

      User.findOne.mockResolvedValue(null); // User doesn't exist
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');
      sendEmail.mockResolvedValue(true);

      // Act
      await authController.register(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock_token',
        user: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role
        }
      });
    });

    it('should return 400 if password is missing', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210'
        // password is missing
      };

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password is required' });
    });

    it('should return 400 if user already exists', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'existing@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      };

      User.findOne.mockResolvedValue({ email: 'existing@example.com' });

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'User with this email already exists' 
      });
    });

    it('should return 400 if phone number is missing', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@1234'
        // phoneNumber is missing
      };

      User.findOne.mockResolvedValue(null);

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Phone number is required' });
    });

    it('should handle phone number with country code', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '919876543210', // with country code
        password: 'Test@1234'
      };

      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210', // cleaned
        role: 'user'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');
      sendEmail.mockResolvedValue(true);

      // Act
      await authController.register(req, res);

      // Assert
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '9876543210' // country code removed
        })
      );
    });

    it('should handle validation errors', async () => {
      // Arrange
      req.body = {
        name: 'J', // too short
        email: 'invalid-email',
        phoneNumber: '123', // invalid
        password: 'weak'
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.errors = {
        name: { message: 'Name must be at least 2 characters long' },
        email: { message: 'Please provide a valid email address' }
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(validationError);

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: expect.objectContaining({
          name: expect.any(String),
          email: expect.any(String)
        })
      });
    });

    it('should handle duplicate key errors', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'duplicate@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      };

      const duplicateError = new Error('Duplicate key');
      duplicateError.code = 11000;

      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(duplicateError);

      // Act
      await authController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'User with this email already exists' 
      });
    });

    it('should handle email sending failure gracefully', async () => {
      // Arrange
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      };

      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        role: 'user'
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mock_token');
      sendEmail.mockRejectedValue(new Error('Email service down'));

      // Act
      await authController.register(req, res);

      // Assert
      // Should still return success even if email fails
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock_token',
        user: expect.objectContaining({
          email: 'john@example.com'
        })
      });
    });
  });

  // Buyer registration tests removed - buyer role no longer supported
});
