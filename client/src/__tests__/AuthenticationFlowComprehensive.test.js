import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import StaffLoginPage from '../pages/auth/StaffLoginPage';
import UserDashboard from '../pages/user_dashboard/UserDashboard';
import StaffSalaryView from '../pages/staff/StaffSalaryView';
import { AuthProvider } from '../context/AuthContext';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ state: null })
}));

// Mock AuthContext with state management
let mockUser = null;
let mockToken = null;

const mockAuthContext = {
  user: mockUser,
  token: mockToken,
  login: jest.fn(),
  register: jest.fn(),
  staffLogin: jest.fn(),
  googleSignIn: jest.fn(),
  logout: jest.fn()
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock axios for API calls
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }))
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

describe('End-to-End Authentication Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset auth state
    mockUser = null;
    mockToken = null;
    mockAuthContext.user = mockUser;
    mockAuthContext.token = mockToken;
    
    // Reset test results for each test suite
    testResults.passed = 0;
    testResults.failed = 0;
    testResults.total = 0;
    testResults.details = [];
  });

  afterAll(() => {
    // Print comprehensive test results
    console.log('\n=== E2E AUTHENTICATION FLOW TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('\nDetailed Results:');
    testResults.details.forEach(result => {
      console.log(`${result.status}: ${result.test}${result.error ? ` - ${result.error}` : ''}`);
    });
    console.log('=============================================\n');
  });

  const renderWithRouter = (component, initialRoute = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          {component}
        </AuthProvider>
      </MemoryRouter>
    );
  };

  describe('1. Complete User Registration Flow', () => {
    it('should complete full user registration process', async () => {
      try {
        // Mock successful registration
        mockAuthContext.register.mockResolvedValue({ success: true });
        
        renderWithRouter(<RegisterPage />);
        
        // Step 1: Fill registration form
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

        // Step 2: Submit registration
        const submitButton = screen.getByRole('button', { name: /register|create account/i });
        fireEvent.click(submitButton);

        // Step 3: Verify registration call
        await waitFor(() => {
          expect(mockAuthContext.register).toHaveBeenCalledWith(
            expect.objectContaining({
              name: 'JohnDoe',
              email: 'john@example.com',
              phoneNumber: '9876543210',
              password: 'Test@1234'
            })
          );
        });

        // Step 4: Verify navigation to login
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/login');
        });

        trackTestResult('Complete user registration flow works', true);
      } catch (error) {
        trackTestResult('Complete user registration flow works', false, error);
        throw error;
      }
    });

    it('should handle registration with existing email', async () => {
      try {
        // Mock registration failure
        mockAuthContext.register.mockRejectedValue({
          response: { data: { message: 'Email already exists' } }
        });
        
        renderWithRouter(<RegisterPage />);
        
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

        // Verify error message
        await waitFor(() => {
          expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        });

        // Verify no navigation occurred
        expect(mockedNavigate).not.toHaveBeenCalled();

        trackTestResult('Registration with existing email handling works', true);
      } catch (error) {
        trackTestResult('Registration with existing email handling works', false, error);
        throw error;
      }
    });
  });

  describe('2. Complete User Login Flow', () => {
    it('should complete full user login process', async () => {
      try {
        // Mock successful login
        const mockUserData = {
          _id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user'
        };
        
        mockAuthContext.login.mockResolvedValue({
          user: mockUserData,
          token: 'mock-token-123'
        });
        
        renderWithRouter(<LoginPage />);
        
        // Step 1: Fill login form
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);

        fireEvent.change(emailInput, { target: { name: 'email', value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'Test@1234' } });

        // Step 2: Submit login
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Step 3: Verify login call
        await waitFor(() => {
          expect(mockAuthContext.login).toHaveBeenCalledWith('john@example.com', 'Test@1234');
        });

        // Step 4: Verify navigation to user dashboard
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/user', { replace: true });
        });

        trackTestResult('Complete user login flow works', true);
      } catch (error) {
        trackTestResult('Complete user login flow works', false, error);
        throw error;
      }
    });

    it('should handle login with invalid credentials', async () => {
      try {
        // Mock login failure
        mockAuthContext.login.mockRejectedValue({
          response: { data: { message: 'Invalid email or password' } }
        });
        
        renderWithRouter(<LoginPage />);
        
        // Fill and submit form
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);

        fireEvent.change(emailInput, { target: { name: 'email', value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'wrongpassword' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Verify error message
        await waitFor(() => {
          expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
        });

        // Verify no navigation occurred
        expect(mockedNavigate).not.toHaveBeenCalled();

        trackTestResult('Login with invalid credentials handling works', true);
      } catch (error) {
        trackTestResult('Login with invalid credentials handling works', false, error);
        throw error;
      }
    });

    it('should handle admin login flow', async () => {
      try {
        // Mock successful admin login
        const mockAdminData = {
          _id: 'admin123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        };
        
        mockAuthContext.login.mockResolvedValue({
          user: mockAdminData,
          token: 'mock-admin-token-123'
        });
        
        renderWithRouter(<LoginPage />);
        
        // Fill and submit form
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);

        fireEvent.change(emailInput, { target: { name: 'email', value: 'admin@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'Admin@1234' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Verify navigation to admin dashboard
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/admin/home', { replace: true });
        });

        trackTestResult('Admin login flow works', true);
      } catch (error) {
        trackTestResult('Admin login flow works', false, error);
        throw error;
      }
    });
  });

  describe('3. Complete Staff Login Flow', () => {
    it('should complete full staff login process', async () => {
      try {
        // Mock successful staff login
        const mockStaffData = {
          _id: 'staff123',
          name: 'Staff Member',
          email: 'staff@example.com',
          role: 'field_staff',
          staffId: 'STF-0001'
        };
        
        mockAuthContext.staffLogin.mockResolvedValue({
          user: mockStaffData,
          token: 'mock-staff-token-123'
        });
        
        renderWithRouter(<StaffLoginPage />);
        
        // Step 1: Fill staff login form
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);

        fireEvent.change(staffIdInput, { target: { value: 'STF-0001' } });

        // Step 2: Submit staff login
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Step 3: Verify staff login call
        await waitFor(() => {
          expect(mockAuthContext.staffLogin).toHaveBeenCalledWith('STF-0001');
        });

        // Step 4: Verify navigation to staff dashboard
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/staff/dashboard', { replace: true });
        });

        trackTestResult('Complete staff login flow works', true);
      } catch (error) {
        trackTestResult('Complete staff login flow works', false, error);
        throw error;
      }
    });

    it('should handle staff login with invalid staff ID', async () => {
      try {
        // Mock staff login failure
        mockAuthContext.staffLogin.mockRejectedValue({
          response: { data: { message: 'Invalid Staff ID' } }
        });
        
        renderWithRouter(<StaffLoginPage />);
        
        // Fill and submit form
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);

        fireEvent.change(staffIdInput, { target: { value: 'INVALID-ID' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Verify error message
        await waitFor(() => {
          expect(screen.getByText(/invalid staff id/i)).toBeInTheDocument();
        });

        // Verify no navigation occurred
        expect(mockedNavigate).not.toHaveBeenCalled();

        trackTestResult('Staff login with invalid ID handling works', true);
      } catch (error) {
        trackTestResult('Staff login with invalid ID handling works', false, error);
        throw error;
      }
    });
  });

  describe('4. Cross-Role Authentication Flow', () => {
    it('should prevent user from accessing staff portal', async () => {
      try {
        // Mock user login
        const mockUserData = {
          _id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user'
        };
        
        mockAuthContext.login.mockResolvedValue({
          user: mockUserData,
          token: 'mock-token-123'
        });
        
        renderWithRouter(<LoginPage />);
        
        // Login as user
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);

        fireEvent.change(emailInput, { target: { name: 'email', value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'Test@1234' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Verify navigation to user dashboard (not staff)
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/user', { replace: true });
        });

        // Verify no staff portal access
        expect(mockedNavigate).not.toHaveBeenCalledWith('/staff/dashboard', { replace: true });

        trackTestResult('User role restriction works', true);
      } catch (error) {
        trackTestResult('User role restriction works', false, error);
        throw error;
      }
    });

    it('should prevent staff from accessing admin portal', async () => {
      try {
        // Mock staff login
        const mockStaffData = {
          _id: 'staff123',
          name: 'Staff Member',
          email: 'staff@example.com',
          role: 'field_staff',
          staffId: 'STF-0001'
        };
        
        mockAuthContext.staffLogin.mockResolvedValue({
          user: mockStaffData,
          token: 'mock-staff-token-123'
        });
        
        renderWithRouter(<StaffLoginPage />);
        
        // Login as staff
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);

        fireEvent.change(staffIdInput, { target: { value: 'STF-0001' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(submitButton);

        // Verify navigation to staff dashboard (not admin)
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/staff/dashboard', { replace: true });
        });

        // Verify no admin portal access
        expect(mockedNavigate).not.toHaveBeenCalledWith('/admin/home', { replace: true });

        trackTestResult('Staff role restriction works', true);
      } catch (error) {
        trackTestResult('Staff role restriction works', false, error);
        throw error;
      }
    });
  });

  describe('5. Session Management Flow', () => {
    it('should maintain user session across page refreshes', async () => {
      try {
        // Mock existing user session
        const mockUserData = {
          _id: 'user123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user'
        };
        
        mockUser = mockUserData;
        mockToken = 'mock-token-123';
        mockAuthContext.user = mockUser;
        mockAuthContext.token = mockToken;
        
        renderWithRouter(<UserDashboard />);
        
        // Verify user is logged in
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();

        trackTestResult('User session persistence works', true);
      } catch (error) {
        trackTestResult('User session persistence works', false, error);
        throw error;
      }
    });

    it('should handle session expiration', async () => {
      try {
        // Mock expired session
        mockUser = null;
        mockToken = null;
        mockAuthContext.user = mockUser;
        mockAuthContext.token = mockToken;
        
        renderWithRouter(<UserDashboard />);
        
        // Verify redirect to login
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/login');
        });

        trackTestResult('Session expiration handling works', true);
      } catch (error) {
        trackTestResult('Session expiration handling works', false, error);
        throw error;
      }
    });
  });

  describe('6. Multi-Step Authentication Flow', () => {
    it('should complete registration -> login -> dashboard flow', async () => {
      try {
        // Step 1: Registration
        mockAuthContext.register.mockResolvedValue({ success: true });
        
        renderWithRouter(<RegisterPage />);
        
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

        const registerButton = screen.getByRole('button', { name: /register|create account/i });
        fireEvent.click(registerButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/login');
        });

        // Step 2: Login
        mockAuthContext.login.mockResolvedValue({
          user: { _id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'user' },
          token: 'mock-token-123'
        });
        
        renderWithRouter(<LoginPage />);
        
        const loginEmailInput = screen.getByLabelText(/email address/i);
        const loginPasswordInput = screen.getByLabelText(/^password$/i);

        fireEvent.change(loginEmailInput, { target: { name: 'email', value: 'john@example.com' } });
        fireEvent.change(loginPasswordInput, { target: { name: 'password', value: 'Test@1234' } });

        const loginButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/user', { replace: true });
        });

        // Step 3: Dashboard access
        mockUser = { _id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'user' };
        mockToken = 'mock-token-123';
        mockAuthContext.user = mockUser;
        mockAuthContext.token = mockToken;
        
        renderWithRouter(<UserDashboard />);
        
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();

        trackTestResult('Complete registration -> login -> dashboard flow works', true);
      } catch (error) {
        trackTestResult('Complete registration -> login -> dashboard flow works', false, error);
        throw error;
      }
    });
  });

  describe('7. Error Recovery Flow', () => {
    it('should recover from network errors during login', async () => {
      try {
        // Mock network error then success
        mockAuthContext.login
          .mockRejectedValueOnce(new Error('Network Error'))
          .mockResolvedValueOnce({
            user: { _id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'user' },
            token: 'mock-token-123'
          });
        
        renderWithRouter(<LoginPage />);
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);

        fireEvent.change(emailInput, { target: { name: 'email', value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'Test@1234' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        
        // First attempt - network error
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(screen.getByText(/network error/i)).toBeInTheDocument();
        });

        // Second attempt - success
        fireEvent.click(submitButton);
        
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/user', { replace: true });
        });

        trackTestResult('Network error recovery during login works', true);
      } catch (error) {
        trackTestResult('Network error recovery during login works', false, error);
        throw error;
      }
    });

    it('should handle concurrent login attempts', async () => {
      try {
        // Mock delayed login response
        mockAuthContext.login.mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve({
            user: { _id: 'user123', name: 'John Doe', email: 'john@example.com', role: 'user' },
            token: 'mock-token-123'
          }), 1000))
        );
        
        renderWithRouter(<LoginPage />);
        
        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);

        fireEvent.change(emailInput, { target: { name: 'email', value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'Test@1234' } });

        const submitButton = screen.getByRole('button', { name: /sign in/i });
        
        // Multiple rapid clicks
        fireEvent.click(submitButton);
        fireEvent.click(submitButton);
        fireEvent.click(submitButton);
        
        // Should only call login once
        await waitFor(() => {
          expect(mockAuthContext.login).toHaveBeenCalledTimes(1);
        });

        trackTestResult('Concurrent login attempt handling works', true);
      } catch (error) {
        trackTestResult('Concurrent login attempt handling works', false, error);
        throw error;
      }
    });
  });
});
