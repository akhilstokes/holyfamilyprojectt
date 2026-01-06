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

describe('LoginPage Component', () => {
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
    console.log('\n=== LOGIN PAGE TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('\nDetailed Results:');
    testResults.details.forEach(result => {
      console.log(`${result.status}: ${result.test}${result.error ? ` - ${result.error}` : ''}`);
    });
    console.log('====\n');
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

  describe('Rendering', () => {
    it('should render login form', () => {
      try {
        renderLoginPage();
        
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        trackTestResult('Login form renders correctly', true);
      } catch (error) {
        trackTestResult('Login form renders correctly', false, error);
        throw error;
      }
    });

    it('should render back to home link', () => {
      renderLoginPage();
      
      const backLink = screen.getByText(/back to home/i);
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });

    it('should render company logo', () => {
      renderLoginPage();
      
      const logo = screen.getByAltText(/holy family polymers logo/i);
      expect(logo).toBeInTheDocument();
    });

    it('should render Google login button', () => {
      renderLoginPage();
      
      expect(screen.getByTestId('google-login')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is empty', async () => {
      renderLoginPage();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      renderLoginPage();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      fireEvent.change(passwordInput, { target: { name: 'password', value: '123' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should show valid indicator for correct email', async () => {
      renderLoginPage();
      
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(emailInput).toHaveClass('valid');
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login function with correct credentials', async () => {
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
    });

    it('should not submit form with invalid data', async () => {
      renderLoginPage();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });

    it('should show error message on login failure', async () => {
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
    });

    it('should navigate to user dashboard after successful login', async () => {
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
    });

    it('should navigate to admin dashboard for admin users', async () => {
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
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      renderLoginPage();
      
      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByLabelText(/show password/i);
      fireEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');

      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Loading State', () => {
    it('should show loading state during login', async () => {
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
    });
  });
});
