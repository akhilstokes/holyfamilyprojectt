import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
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
const mockLogin = jest.fn();
const mockGoogleSignIn = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
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

describe('LoginPage Comprehensive Tests', () => {
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
    console.log('\n=== LOGIN PAGE COMPREHENSIVE TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('\nDetailed Results:');
    testResults.details.forEach(result => {
      console.log(`${result.status}: ${result.test}${result.error ? ` - ${result.error}` : ''}`);
    });
    console.log('===============================================\n');
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('1. UI Rendering Tests', () => {
    it('should render login form elements', () => {
      try {
        renderLoginPage();
        
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        trackTestResult('Login form elements render correctly', true);
      } catch (error) {
        trackTestResult('Login form elements render correctly', false, error);
        throw error;
      }
    });

    it('should render back to home link', () => {
      try {
        renderLoginPage();
        
        const backLink = screen.getByText(/back to home/i);
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/');
        trackTestResult('Back to home link renders correctly', true);
      } catch (error) {
        trackTestResult('Back to home link renders correctly', false, error);
        throw error;
      }
    });

    it('should render company logo', () => {
      try {
        renderLoginPage();
        
        const logo = screen.getByAltText(/holy family polymers logo/i);
        expect(logo).toBeInTheDocument();
        trackTestResult('Company logo renders correctly', true);
      } catch (error) {
        trackTestResult('Company logo renders correctly', false, error);
        throw error;
      }
    });

    it('should render Google login button', () => {
      try {
        renderLoginPage();
        
        expect(screen.getByTestId('google-login')).toBeInTheDocument();
        trackTestResult('Google login button renders correctly', true);
      } catch (error) {
        trackTestResult('Google login button renders correctly', false, error);
        throw error;
      }
    });

    it('should render forgot password link', () => {
      try {
        renderLoginPage();
        
        const forgotLink = screen.getByText(/forgot password/i);
        expect(forgotLink).toBeInTheDocument();
        expect(forgotLink.closest('a')).toHaveAttribute('href', '/forgot-password');
        trackTestResult('Forgot password link renders correctly', true);
      } catch (error) {
        trackTestResult('Forgot password link renders correctly', false, error);
        throw error;
      }
    });

    it('should render register link', () => {
      try {
        renderLoginPage();
        
        const registerLink = screen.getByText(/don't have an account/i);
        expect(registerLink).toBeInTheDocument();
        trackTestResult('Register link renders correctly', true);
      } catch (error) {
        trackTestResult('Register link renders correctly', false, error);
        throw error;
      }
    });
  });

  describe('2. Form Validation Tests', () => {
    it('should show error when email is empty', async () => {
      try {
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.blur(emailInput);

        await waitFor(() => {
          expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
        trackTestResult('Email empty validation works', true);
      } catch (error) {
        trackTestResult('Email empty validation works', false, error);
        throw error;
      }
    });

    it('should show error for invalid email format', async () => {
      try {
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { name: 'email', value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
          expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        });
        trackTestResult('Email format validation works', true);
      } catch (error) {
        trackTestResult('Email format validation works', false, error);
        throw error;
      }
    });

    it('should show error when password is empty', async () => {
      try {
        renderLoginPage();
        
        const passwordInput = screen.getByLabelText(/^password$/i);
        fireEvent.blur(passwordInput);

        await waitFor(() => {
          expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });
        trackTestResult('Password empty validation works', true);
      } catch (error) {
        trackTestResult('Password empty validation works', false, error);
        throw error;
      }
    });

    it('should show error for short password', async () => {
      try {
        renderLoginPage();
        
        const passwordInput = screen.getByLabelText(/^password$/i);
        fireEvent.change(passwordInput, { target: { name: 'password', value: '123' } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
          expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
        });
        trackTestResult('Password length validation works', true);
      } catch (error) {
        trackTestResult('Password length validation works', false, error);
        throw error;
      }
    });

    it('should show valid indicator for correct email', async () => {
      try {
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
          expect(emailInput).toHaveClass('valid');
        });
        trackTestResult('Valid email indicator works', true);
      } catch (error) {
        trackTestResult('Valid email indicator works', false, error);
        throw error;
      }
    });

    it('should show valid indicator for correct password', async () => {
      try {
        renderLoginPage();
        
        const passwordInput = screen.getByLabelText(/^password$/i);
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.blur(passwordInput);

        await waitFor(() => {
          expect(passwordInput).toHaveClass('valid');
        });
        trackTestResult('Valid password indicator works', true);
      } catch (error) {
        trackTestResult('Valid password indicator works', false, error);
        throw error;
      }
    });
  });

  describe('3. Form Submission Tests', () => {
    it('should call login function with correct credentials', async () => {
      try {
        mockLogin.mockResolvedValue({ user: { role: 'user' } });
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
        trackTestResult('Login function called with correct credentials', true);
      } catch (error) {
        trackTestResult('Login function called with correct credentials', false, error);
        throw error;
      }
    });

    it('should not submit form with invalid data', async () => {
      try {
        renderLoginPage();
        
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockLogin).not.toHaveBeenCalled();
        });
        trackTestResult('Form submission blocked with invalid data', true);
      } catch (error) {
        trackTestResult('Form submission blocked with invalid data', false, error);
        throw error;
      }
    });

    it('should show error message on login failure', async () => {
      try {
        mockLogin.mockRejectedValue({
          response: { data: { message: 'Invalid credentials' } }
        });
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });
        trackTestResult('Error message displayed on login failure', true);
      } catch (error) {
        trackTestResult('Error message displayed on login failure', false, error);
        throw error;
      }
    });

    it('should navigate to user dashboard after successful login', async () => {
      try {
        mockLogin.mockResolvedValue({ user: { role: 'user' } });
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/user', { replace: true });
        });
        trackTestResult('Navigation to user dashboard works', true);
      } catch (error) {
        trackTestResult('Navigation to user dashboard works', false, error);
        throw error;
      }
    });

    it('should navigate to admin dashboard for admin users', async () => {
      try {
        mockLogin.mockResolvedValue({ user: { role: 'admin' } });
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'admin@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/admin/home', { replace: true });
        });
        trackTestResult('Navigation to admin dashboard works', true);
      } catch (error) {
        trackTestResult('Navigation to admin dashboard works', false, error);
        throw error;
      }
    });

    it('should navigate to manager dashboard for manager users', async () => {
      try {
        mockLogin.mockResolvedValue({ user: { role: 'manager' } });
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'manager@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/manager/home', { replace: true });
        });
        trackTestResult('Navigation to manager dashboard works', true);
      } catch (error) {
        trackTestResult('Navigation to manager dashboard works', false, error);
        throw error;
      }
    });
  });

  describe('4. Password Visibility Tests', () => {
    it('should toggle password visibility', () => {
      try {
        renderLoginPage();
        
        const passwordInput = screen.getByLabelText(/^password$/i);
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButton = screen.getByLabelText(/show password/i);
        fireEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
        trackTestResult('Password visibility toggle works', true);
      } catch (error) {
        trackTestResult('Password visibility toggle works', false, error);
        throw error;
      }
    });
  });

  describe('5. Loading State Tests', () => {
    it('should show loading state during login', async () => {
      try {
        mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(submitButton).toBeDisabled();
        });
        trackTestResult('Loading state displayed during login', true);
      } catch (error) {
        trackTestResult('Loading state displayed during login', false, error);
        throw error;
      }
    });
  });

  describe('6. Edge Cases Tests', () => {
    it('should handle network error gracefully', async () => {
      try {
        mockLogin.mockRejectedValue(new Error('Network Error'));
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });
        trackTestResult('Network error handled gracefully', true);
      } catch (error) {
        trackTestResult('Network error handled gracefully', false, error);
        throw error;
      }
    });

    it('should handle empty form submission', async () => {
      try {
        renderLoginPage();
        
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockLogin).not.toHaveBeenCalled();
        });
        trackTestResult('Empty form submission handled correctly', true);
      } catch (error) {
        trackTestResult('Empty form submission handled correctly', false, error);
        throw error;
      }
    });

    it('should handle special characters in email', async () => {
      try {
        renderLoginPage();
        
        const emailInput = screen.getByLabelText(/email address/i);
        fireEvent.change(emailInput, { target: { name: 'email', value: 'test+tag@example.com' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
          expect(emailInput).toHaveClass('valid');
        });
        trackTestResult('Special characters in email handled correctly', true);
      } catch (error) {
        trackTestResult('Special characters in email handled correctly', false, error);
        throw error;
      }
    });
  });
});

