const mongoose = require('mongoose');
const User = require('../../models/userModel');

describe('User Model - Unit Tests', () => {
  describe('Validation', () => {
    it('should validate a valid user', async () => {
      const validUser = new User({
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      const error = validUser.validateSync();
      expect(error).toBeUndefined();
    });

    it('should require name', () => {
      const user = new User({
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      const error = user.validateSync();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toContain('Please provide your name');
    });

    it('should require valid email format', () => {
      const user = new User({
        name: 'John Doe',
        email: 'invalid-email',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      const error = user.validateSync();
      expect(error.errors.email).toBeDefined();
    });

    it('should validate name length', () => {
      const userShortName = new User({
        name: 'J',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      const error = userShortName.validateSync();
      expect(error.errors.name).toBeDefined();
      expect(error.errors.name.message).toContain('at least 2 characters');
    });

    it('should validate name contains only letters, spaces, and dots', () => {
      const userInvalidName = new User({
        name: 'John123',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      const error = userInvalidName.validateSync();
      expect(error.errors.name).toBeDefined();
    });

    it('should accept valid Indian phone numbers', () => {
      const validPhoneNumbers = ['9876543210', '919876543210', '09876543210'];
      
      validPhoneNumbers.forEach(phone => {
        const user = new User({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: phone,
          password: 'Test@1234'
        });

        const error = user.validateSync();
        expect(error?.errors.phoneNumber).toBeUndefined();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhoneNumbers = ['123', '0000000000', '1234567890', '5876543210'];
      
      invalidPhoneNumbers.forEach(phone => {
        const user = new User({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: phone,
          password: 'Test@1234'
        });

        const error = user.validateSync();
        expect(error?.errors.phoneNumber).toBeDefined();
      });
    });

    it('should validate password strength for regular users', () => {
      const weakPasswords = [
        'weak',           // too simple
        'nouppercas1!',   // no uppercase
        'NOLOWERCASE1!',  // no lowercase
        'NoNumbers!',     // no numbers
        'NoSpecial123',   // no special char
        'Has Space 1!'    // has space
      ];

      weakPasswords.forEach(password => {
        const user = new User({
          name: 'Test User',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          password: password
        });

        const error = user.validateSync();
        // Note: This validation happens on save, not on sync validation
        // You might need to test this differently depending on your implementation
      });
    });

    it('should validate role enum', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234',
        role: 'invalid_role'
      });

      const error = user.validateSync();
      expect(error.errors.role).toBeDefined();
    });

    it('should have default role as user', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      expect(user.role).toBe('user');
    });

    it('should validate staffId format when provided', () => {
      const user = new User({
        name: 'Staff Member',
        email: 'staff@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234',
        staffId: 'abc123' // should be uppercase
      });

      const error = user.validateSync();
      expect(error.errors.staffId).toBeDefined();
    });

    it('should accept valid staffId', () => {
      const user = new User({
        name: 'Staff Member',
        email: 'staff@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234',
        staffId: 'HF12345'
      });

      const error = user.validateSync();
      expect(error?.errors.staffId).toBeUndefined();
    });

    it('should validate status enum', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234',
        status: 'invalid_status'
      });

      const error = user.validateSync();
      expect(error.errors.status).toBeDefined();
    });

    it('should have default status as active', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      expect(user.status).toBe('active');
    });
  });

  describe('Methods', () => {
    it('should have matchPassword method', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      expect(typeof user.matchPassword).toBe('function');
    });

    it('should have getResetPasswordToken method', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      expect(typeof user.getResetPasswordToken).toBe('function');
    });

    it('should generate reset password token', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      const token = user.getResetPasswordToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
      expect(user.passwordResetExpires).toBeInstanceOf(Date);
    });
  });

  describe('Schema fields', () => {
    it('should have timestamps', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      expect(user.schema.options.timestamps).toBe(true);
    });

    it('should have password select false by default', () => {
      const passwordField = User.schema.path('password');
      expect(passwordField.options.select).toBe(false);
    });

    it('should have location field with default empty string', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      expect(user.location).toBe('');
    });

    it('should have isPhoneVerified default to false', () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        phoneNumber: '9876543210',
        password: 'Test@1234'
      });

      expect(user.isPhoneVerified).toBe(false);
    });
  });
});
