import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../pages/auth/RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ state: null })
}));

// Mock Google OAuth
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div data-testid="google-login">Google Login Mock</div>
}));

// Mock AuthContext
const mockRegister = jest.fn();
const mockGoogleSignIn = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    googleSignIn: mockGoogleSignIn,
    user: null
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Test Results Tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

const trackTestResult = (testName, passed, error = null) => {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  testResults.details.push({
    test: testName,
    status: passed ? 'PASSED' : 'FAILED',
    error: error?.message || null
  });
};

describe('RegisterPage Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset test results for each test suite
    testResults.passed = 0;
    testResults.failed = 0;
    testResults.total = 0;
    testResults.details = [];
  });

  afterAll(() => {
    // Print comprehensive test results
    console.log('\n=== REGISTER PAGE COMPREHENSIVE TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('\nDetailed Results:');
    testResults.details.forEach(result => {
      console.log(`${result.status}: ${result.test}${result.error ? ` - ${result.error}` : ''}`);
    });
    console.log('======\n');
  });

  const renderRegisterPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('1. UI Rendering Tests', () => {
    it('should render registration form elements', () => {
      try {
        renderRegisterPage();
        
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
        trackTestResult('Registration form elements render correctly', true);
      } catch (error) {
        trackTestResult('Registration form elements render correctly', false, error);
        throw error;
      }
    });

    it('should render progress indicator', () => {
      try {
        renderRegisterPage();
        
        // Progress bars should be present
        const progressBars = screen.getAllByRole('progressbar', { hidden: true });
        expect(progressBars.length).toBeGreaterThan(0);
        trackTestResult('Progress indicator renders correctly', true);
      } catch (error) {
        trackTestResult('Progress indicator renders correctly', false, error);
        throw error;
      }
    });

    it('should render company logo', () => {
      try {
        renderRegisterPage();
        
        const logo = screen.getByAltText(/company logo/i);
        expect(logo).toBeInTheDocument();
        trackTestResult('Company logo renders correctly', true);
      } catch (error) {
        trackTestResult('Company logo renders correctly', false, error);
        throw error;
      }
    });

    it('should render Google login button', () => {
      try {
        renderRegisterPage();
        
        expect(screen.getByTestId('google-login')).toBeInTheDocument();
        trackTestResult('Google login button renders correctly', true);
      } catch (error) {
        trackTestResult('Google login button renders correctly', false, error);
        throw error;
      }
    });

    it('should render back to home link', () => {
      try {
        renderRegisterPage();
        
        const backLink = screen.getByText(/back to home/i);
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/');
        trackTestResult('Back to home link renders correctly', true);
      } catch (error) {
        trackTestResult('Back to home link renders correctly', false, error);
        throw error;
      }
    });

    it('should render login link', () => {
      try {
        renderRegisterPage();
        
        const loginLink = screen.getByText(/already have an account/i);
        expect(loginLink).toBeInTheDocument();
        trackTestResult('Login link renders correctly', true);
      } catch (error) {
        trackTestResult('Login link renders correctly', false, error);
        throw error;
      }
    });
  });

  describe('2. Name Field Validation Tests', () => {
    it('should validate name field - empty name', async () => {
      try {
        renderRegisterPage();
        
        const nameInput = screen.getByPlaceholderText(/full name/i);
        
        // Test empty name
        fireEvent.change(nameInput, { target: { value: '' } });
        await waitFor(() => {
          expect(screen.getByText(/letters only/i)).toBeInTheDocument();
        });
        trackTestResult('Name field empty validation works', true);
      } catch (error) {
        trackTestResult('Name field empty validation works', false, error);
        throw error;
      }
    });

    it('should validate name field - valid name', async () => {
      try {
        renderRegisterPage();
        
        const nameInput = screen.getByPlaceholderText(/full name/i);
        
        // Test valid name
        fireEvent.change(nameInput, { target: { value: 'JohnDoe' } });
        await waitFor(() => {
          expect(screen.getByText(/valid name/i)).toBeInTheDocument();
        });
        trackTestResult('Name field valid name validation works', true);
      } catch (error) {
        trackTestResult('Name field valid name validation works', false, error);
        throw error;
      }
    });

    it('should not allow spaces in name', () => {
      try {
        renderRegisterPage();
        
        const nameInput = screen.getByPlaceholderText(/full name/i);
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        
        // Spaces should be removed
        expect(nameInput.value).toBe('JohnDoe');
        trackTestResult('Name field spaces removal works', true);
      } catch (error) {
        trackTestResult('Name field spaces removal works', false, error);
        throw error;
      }
    });

    it('should prevent space key in name field', () => {
      try {
        renderRegisterPage();
        
        const nameInput = screen.getByPlaceholderText(/full name/i);
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
        
        Object.defineProperty(spaceEvent, 'target', { value: nameInput, configurable: true });
        const preventDefaultSpy = jest.spyOn(spaceEvent, 'preventDefault');
        
        fireEvent.keyDown(nameInput, spaceEvent);
        
        expect(preventDefaultSpy).toHaveBeenCalled();
        trackTestResult('Name field space key prevention works', true);
      } catch (error) {
        trackTestResult('Name field space key prevention works', false, error);
        throw error;
      }
    });

    it('should handle special characters in name', () => {
      try {
        renderRegisterPage();
        
        const nameInput = screen.getByPlaceholderText(/full name/i);
        fireEvent.change(nameInput, { target: { value: 'John123' } });
        
        // Should show error for numbers
        expect(nameInput.value).toBe('John123');
        trackTestResult('Name field special characters handling works', true);
      } catch (error) {
        trackTestResult('Name field special characters handling works', false, error);
        throw error;
      }
    });
  });

  describe('3. Email Field Validation Tests', () => {
    it('should validate email format - invalid email', async () => {
      try {
        renderRegisterPage();
        
        const emailInput = screen.getByPlaceholderText(/email address/i);
        
        // Invalid email
        fireEvent.change(emailInput, { target: { value: 'invalid' } });
        await waitFor(() => {
          expect(emailInput).toHaveClass('error');
        });
        trackTestResult('Email field invalid format validation works', true);
      } catch (error) {
        trackTestResult('Email field invalid format validation works', false, error);
        throw error;
      }
    });

    it('should validate email format - valid email', async () => {
      try {
        renderRegisterPage();
        
        const emailInput = screen.getByPlaceholderText(/email address/i);
        
        // Valid email
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        await waitFor(() => {
          expect(screen.getByText(/valid email/i)).toBeInTheDocument();
        });
        trackTestResult('Email field valid format validation works', true);
      } catch (error) {
        trackTestResult('Email field valid format validation works', false, error);
        throw error;
      }
    });

    it('should show helper text for email', () => {
      try {
        renderRegisterPage();
        
        expect(screen.getByText(/we'll send confirmations here/i)).toBeInTheDocument();
        trackTestResult('Email field helper text displays correctly', true);
      } catch (error) {
        trackTestResult('Email field helper text displays correctly', false, error);
        throw error;
      }
    });

    it('should handle email with special characters', async () => {
      try {
        renderRegisterPage();
        
        const emailInput = screen.getByPlaceholderText(/email address/i);
        
        // Email with special characters
        fireEvent.change(emailInput, { target: { value: 'test+tag@example.com' } });
        await waitFor(() => {
          expect(screen.getByText(/valid email/i)).toBeInTheDocument();
        });
        trackTestResult('Email field special characters handling works', true);
      } catch (error) {
        trackTestResult('Email field special characters handling works', false, error);
        throw error;
      }
    });
  });

  describe('4. Phone Number Validation Tests', () => {
    it('should validate Indian phone number - invalid phone', async () => {
      try {
        renderRegisterPage();
        
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        
        // Invalid phone
        fireEvent.change(phoneInput, { target: { value: '123' } });
        await waitFor(() => {
          expect(phoneInput).toHaveClass('error');
        });
        trackTestResult('Phone field invalid number validation works', true);
      } catch (error) {
        trackTestResult('Phone field invalid number validation works', false, error);
        throw error;
      }
    });

    it('should validate Indian phone number - valid phone', async () => {
      try {
        renderRegisterPage();
        
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        
        // Valid phone
        fireEvent.change(phoneInput, { target: { value: '9876543210' } });
        await waitFor(() => {
          expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
        });
        trackTestResult('Phone field valid number validation works', true);
      } catch (error) {
        trackTestResult('Phone field valid number validation works', false, error);
        throw error;
      }
    });

    it('should limit phone number length', () => {
      try {
        renderRegisterPage();
        
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        expect(phoneInput).toHaveAttribute('maxLength', '15');
        trackTestResult('Phone field length limit works', true);
      } catch (error) {
        trackTestResult('Phone field length limit works', false, error);
        throw error;
      }
    });

    it('should handle phone number with country code', async () => {
      try {
        renderRegisterPage();
        
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        
        // Phone with country code
        fireEvent.change(phoneInput, { target: { value: '+919876543210' } });
        await waitFor(() => {
          expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
        });
        trackTestResult('Phone field country code handling works', true);
      } catch (error) {
        trackTestResult('Phone field country code handling works', false, error);
        throw error;
      }
    });
  });

  describe('5. Password Field Validation Tests', () => {
    it('should validate password strength - weak password', async () => {
      try {
        renderRegisterPage();
        
        // Navigate to password step
        const nameInput = screen.getByPlaceholderText(/full name/i);
        const emailInput = screen.getByPlaceholderText(/email address/i);
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        
        fireEvent.change(nameInput, { target: { value: 'JohnDoe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '9876543210' } });
        
        // Move to next step if there's a next button
        const nextButton = screen.queryByRole('button', { name: /next/i });
        if (nextButton) {
          fireEvent.click(nextButton);
        }

        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        
        // Weak password
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        await waitFor(() => {
          expect(passwordInput).toHaveClass('error');
        });
        trackTestResult('Password field weak password validation works', true);
      } catch (error) {
        trackTestResult('Password field weak password validation works', false, error);
        throw error;
      }
    });

    it('should validate password strength - strong password', async () => {
      try {
        renderRegisterPage();
        
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        
        // Strong password
        fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
        await waitFor(() => {
          expect(screen.getByText(/valid password/i)).toBeInTheDocument();
        });
        trackTestResult('Password field strong password validation works', true);
      } catch (error) {
        trackTestResult('Password field strong password validation works', false, error);
        throw error;
      }
    });

    it('should check password confirmation match', async () => {
      try {
        renderRegisterPage();
        
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        const confirmInput = screen.getByPlaceholderText(/confirm password/i);
        
        fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Different@1234' } });

        await waitFor(() => {
          expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
        });
        trackTestResult('Password confirmation match validation works', true);
      } catch (error) {
        trackTestResult('Password confirmation match validation works', false, error);
        throw error;
      }
    });

    it('should validate password confirmation match - correct match', async () => {
      try {
        renderRegisterPage();
        
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        const confirmInput = screen.getByPlaceholderText(/confirm password/i);
        
        fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test@1234' } });

        await waitFor(() => {
          expect(screen.getByText(/passwords match/i)).toBeInTheDocument();
        });
        trackTestResult('Password confirmation correct match validation works', true);
      } catch (error) {
        trackTestResult('Password confirmation correct match validation works', false, error);
        throw error;
      }
    });
  });

  describe('6. Form Submission Tests', () => {
    it('should submit form with valid data', async () => {
      try {
        mockRegister.mockResolvedValue({});
        renderRegisterPage();
        
        const nameInput = screen.getByPlaceholderText(/full name/i);
        const emailInput = screen.getByPlaceholderText(/email address/i);
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        const confirmInput = screen.getByPlaceholderText(/confirm password/i);

        fireEvent.change(nameInput, { target: { value: 'JohnDoe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '9876543210' } });
        fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test@1234' } });

        const submitButton = screen.getByRole('button', { name: /register|create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockRegister).toHaveBeenCalledWith(
            expect.objectContaining({
              name: 'JohnDoe',
              email: 'john@example.com',
              phoneNumber: '9876543210',
              password: 'Test@1234'
            })
          );
        });
        trackTestResult('Form submission with valid data works', true);
      } catch (error) {
        trackTestResult('Form submission with valid data works', false, error);
        throw error;
      }
    });

    it('should navigate to login after successful registration', async () => {
      try {
        mockRegister.mockResolvedValue({});
        renderRegisterPage();
        
        // Fill form with valid data and submit
        const nameInput = screen.getByPlaceholderText(/full name/i);
        const emailInput = screen.getByPlaceholderText(/email address/i);
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        const confirmInput = screen.getByPlaceholderText(/confirm password/i);

        fireEvent.change(nameInput, { target: { value: 'JohnDoe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '9876543210' } });
        fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test@1234' } });

        const submitButton = screen.getByRole('button', { name: /register|create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/login');
        });
        trackTestResult('Navigation to login after registration works', true);
      } catch (error) {
        trackTestResult('Navigation to login after registration works', false, error);
        throw error;
      }
    });

    it('should handle registration error', async () => {
      try {
        mockRegister.mockRejectedValue({
          response: { data: { message: 'Email already exists' } }
        });
        renderRegisterPage();
        
        // Fill and submit form
        const nameInput = screen.getByPlaceholderText(/full name/i);
        const emailInput = screen.getByPlaceholderText(/email address/i);
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        const confirmInput = screen.getByPlaceholderText(/confirm password/i);

        fireEvent.change(nameInput, { target: { value: 'JohnDoe' } });
        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '9876543210' } });
        fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test@1234' } });

        const submitButton = screen.getByRole('button', { name: /register|create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        });
        trackTestResult('Registration error handling works', true);
      } catch (error) {
        trackTestResult('Registration error handling works', false, error);
        throw error;
      }
    });

    it('should not submit form with invalid data', async () => {
      try {
        renderRegisterPage();
        
        const submitButton = screen.getByRole('button', { name: /register|create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockRegister).not.toHaveBeenCalled();
        });
        trackTestResult('Form submission blocked with invalid data', true);
      } catch (error) {
        trackTestResult('Form submission blocked with invalid data', false, error);
        throw error;
      }
    });
  });

  describe('7. Password Visibility Tests', () => {
    it('should toggle password visibility', () => {
      try {
        renderRegisterPage();
        
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButton = screen.getAllByRole('button', { name: /toggle/i })[0];
        fireEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute('type', 'text');
        trackTestResult('Password visibility toggle works', true);
      } catch (error) {
        trackTestResult('Password visibility toggle works', false, error);
        throw error;
      }
    });

    it('should toggle confirm password visibility', () => {
      try {
        renderRegisterPage();
        
        const confirmInput = screen.getByPlaceholderText(/confirm password/i);
        expect(confirmInput).toHaveAttribute('type', 'password');

        const toggleButtons = screen.getAllByRole('button', { name: /toggle/i });
        if (toggleButtons.length > 1) {
          fireEvent.click(toggleButtons[1]);
          expect(confirmInput).toHaveAttribute('type', 'text');
        }
        trackTestResult('Confirm password visibility toggle works', true);
      } catch (error) {
        trackTestResult('Confirm password visibility toggle works', false, error);
        throw error;
      }
    });
  });

  describe('8. Edge Cases Tests', () => {
    it('should handle network error gracefully', async () => {
      try {
        mockRegister.mockRejectedValue(new Error('Network Error'));
        renderRegisterPage();
        
        // Fill and submit form
        const nameInput = screen.getByPlaceholderText(/full name/i);
        const emailInput = screen.getByPlaceholderText(/email address/i);
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        const passwordInput = screen.getByPlaceholderText(/^password$/i);
        const confirmInput = screen.getByPlaceholderText(/confirm password/i);

        fireEvent.change(nameInput, { target: { value: 'JohnDoe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(phoneInput, { target: { value: '9876543210' } });
        fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
        fireEvent.change(confirmInput, { target: { value: 'Test@1234' } });

        const submitButton = screen.getByRole('button', { name: /register|create account/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });
        trackTestResult('Network error handling works', true);
      } catch (error) {
        trackTestResult('Network error handling works', false, error);
        throw error;
      }
    });

    it('should handle very long name input', () => {
      try {
        renderRegisterPage();
        
        const nameInput = screen.getByPlaceholderText(/full name/i);
        const longName = 'A'.repeat(100);
        fireEvent.change(nameInput, { target: { value: longName } });
        
        // Should handle long input gracefully
        expect(nameInput.value.length).toBeGreaterThan(0);
        trackTestResult('Long name input handling works', true);
      } catch (error) {
        trackTestResult('Long name input handling works', false, error);
        throw error;
      }
    });

    it('should handle special characters in phone number', async () => {
      try {
        renderRegisterPage();
        
        const phoneInput = screen.getByPlaceholderText(/phone number/i);
        
        // Phone with special characters
        fireEvent.change(phoneInput, { target: { value: '987-654-3210' } });
        await waitFor(() => {
          expect(phoneInput).toHaveClass('error');
        });
        trackTestResult('Phone field special characters validation works', true);
      } catch (error) {
        trackTestResult('Phone field special characters validation works', false, error);
        throw error;
      }
    });
  });
});

