import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffLoginPage from '../pages/auth/StaffLoginPage';
import StaffSalaryView from '../pages/staff/StaffSalaryView';
import StaffAttendance from '../pages/staff/StaffAttendance';
import { AuthProvider } from '../context/AuthContext';
import '@testing-library/jest-dom';

// Mock useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ state: null })
}));

// Mock AuthContext
const mockStaffLogin = jest.fn();
const mockLogin = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    staffLogin: mockStaffLogin,
    login: mockLogin,
    user: null
  }),
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

describe('Staff Functionality Comprehensive Tests', () => {
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
    console.log('\n=== STAFF FUNCTIONALITY COMPREHENSIVE TEST RESULTS ===');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    console.log('\nDetailed Results:');
    testResults.details.forEach(result => {
      console.log(`${result.status}: ${result.test}${result.error ? ` - ${result.error}` : ''}`);
    });
    console.log('======================================================\n');
  });

  const renderStaffLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <StaffLoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const renderStaffSalaryView = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <StaffSalaryView />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const renderStaffAttendance = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <StaffAttendance />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('1. Staff Login Page Tests', () => {
    it('should render staff login form', () => {
      try {
        renderStaffLoginPage();
        
        expect(screen.getByText(/staff login/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/staff id/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        trackTestResult('Staff login form renders correctly', true);
      } catch (error) {
        trackTestResult('Staff login form renders correctly', false, error);
        throw error;
      }
    });

    it('should validate staff ID field', async () => {
      try {
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        
        // Test empty staff ID
        fireEvent.blur(staffIdInput);
        await waitFor(() => {
          expect(screen.getByText(/staff id is required/i)).toBeInTheDocument();
        });
        trackTestResult('Staff ID validation works', true);
      } catch (error) {
        trackTestResult('Staff ID validation works', false, error);
        throw error;
      }
    });

    it('should submit staff login form', async () => {
      try {
        mockStaffLogin.mockResolvedValue({ user: { role: 'field_staff' } });
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(staffIdInput, { target: { value: 'STF-0001' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockStaffLogin).toHaveBeenCalledWith('STF-0001');
        });
        trackTestResult('Staff login form submission works', true);
      } catch (error) {
        trackTestResult('Staff login form submission works', false, error);
        throw error;
      }
    });

    it('should navigate to staff dashboard after successful login', async () => {
      try {
        mockStaffLogin.mockResolvedValue({ user: { role: 'field_staff' } });
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(staffIdInput, { target: { value: 'STF-0001' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/staff/dashboard', { replace: true });
        });
        trackTestResult('Staff login navigation works', true);
      } catch (error) {
        trackTestResult('Staff login navigation works', false, error);
        throw error;
      }
    });

    it('should handle staff login error', async () => {
      try {
        mockStaffLogin.mockRejectedValue({
          response: { data: { message: 'Invalid Staff ID' } }
        });
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(staffIdInput, { target: { value: 'INVALID-ID' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/invalid staff id/i)).toBeInTheDocument();
        });
        trackTestResult('Staff login error handling works', true);
      } catch (error) {
        trackTestResult('Staff login error handling works', false, error);
        throw error;
      }
    });

    it('should render back to home link', () => {
      try {
        renderStaffLoginPage();
        
        const backLink = screen.getByText(/back to home/i);
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/');
        trackTestResult('Staff login back to home link works', true);
      } catch (error) {
        trackTestResult('Staff login back to home link works', false, error);
        throw error;
      }
    });
  });

  describe('2. Staff Salary View Tests', () => {
    beforeEach(() => {
      // Mock successful API responses for salary data
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          salary: {
            basicSalary: 25000,
            allowances: 5000,
            deductions: 2000,
            netSalary: 28000
          },
          history: [
            {
              month: 'January 2024',
              basicSalary: 25000,
              allowances: 5000,
              deductions: 2000,
              netSalary: 28000
            }
          ]
        }
      });
    });

    it('should render salary view page', () => {
      try {
        renderStaffSalaryView();
        
        expect(screen.getByText(/salary details/i)).toBeInTheDocument();
        trackTestResult('Staff salary view page renders correctly', true);
      } catch (error) {
        trackTestResult('Staff salary view page renders correctly', false, error);
        throw error;
      }
    });

    it('should display current salary information', async () => {
      try {
        renderStaffSalaryView();
        
        await waitFor(() => {
          expect(screen.getByText(/basic salary/i)).toBeInTheDocument();
          expect(screen.getByText(/allowances/i)).toBeInTheDocument();
          expect(screen.getByText(/deductions/i)).toBeInTheDocument();
          expect(screen.getByText(/net salary/i)).toBeInTheDocument();
        });
        trackTestResult('Staff salary information displays correctly', true);
      } catch (error) {
        trackTestResult('Staff salary information displays correctly', false, error);
        throw error;
      }
    });

    it('should display salary history', async () => {
      try {
        renderStaffSalaryView();
        
        await waitFor(() => {
          expect(screen.getByText(/salary history/i)).toBeInTheDocument();
          expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
        });
        trackTestResult('Staff salary history displays correctly', true);
      } catch (error) {
        trackTestResult('Staff salary history displays correctly', false, error);
        throw error;
      }
    });

    it('should handle salary data loading', async () => {
      try {
        renderStaffSalaryView();
        
        // Should show loading state initially
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
        trackTestResult('Staff salary loading state works', true);
      } catch (error) {
        trackTestResult('Staff salary loading state works', false, error);
        throw error;
      }
    });

    it('should handle salary data error', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.get.mockRejectedValue(new Error('Failed to fetch salary data'));
        
        renderStaffSalaryView();
        
        await waitFor(() => {
          expect(screen.getByText(/error loading salary data/i)).toBeInTheDocument();
        });
        trackTestResult('Staff salary error handling works', true);
      } catch (error) {
        trackTestResult('Staff salary error handling works', false, error);
        throw error;
      }
    });

    it('should allow salary data refresh', async () => {
      try {
        renderStaffSalaryView();
        
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
        
        fireEvent.click(refreshButton);
        
        await waitFor(() => {
          expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });
        trackTestResult('Staff salary refresh functionality works', true);
      } catch (error) {
        trackTestResult('Staff salary refresh functionality works', false, error);
        throw error;
      }
    });
  });

  describe('3. Staff Attendance Tests', () => {
    beforeEach(() => {
      // Mock successful API responses for attendance data
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          attendance: [
            {
              date: '2024-01-15',
              checkIn: '09:00',
              checkOut: '18:00',
              status: 'Present',
              hours: 9
            }
          ],
          summary: {
            totalDays: 22,
            presentDays: 20,
            absentDays: 2,
            attendancePercentage: 90.9
          }
        }
      });
    });

    it('should render attendance page', () => {
      try {
        renderStaffAttendance();
        
        expect(screen.getByText(/attendance/i)).toBeInTheDocument();
        trackTestResult('Staff attendance page renders correctly', true);
      } catch (error) {
        trackTestResult('Staff attendance page renders correctly', false, error);
        throw error;
      }
    });

    it('should display attendance summary', async () => {
      try {
        renderStaffAttendance();
        
        await waitFor(() => {
          expect(screen.getByText(/total days/i)).toBeInTheDocument();
          expect(screen.getByText(/present days/i)).toBeInTheDocument();
          expect(screen.getByText(/absent days/i)).toBeInTheDocument();
          expect(screen.getByText(/attendance percentage/i)).toBeInTheDocument();
        });
        trackTestResult('Staff attendance summary displays correctly', true);
      } catch (error) {
        trackTestResult('Staff attendance summary displays correctly', false, error);
        throw error;
      }
    });

    it('should display attendance history', async () => {
      try {
        renderStaffAttendance();
        
        await waitFor(() => {
          expect(screen.getByText(/attendance history/i)).toBeInTheDocument();
          expect(screen.getByText(/2024-01-15/i)).toBeInTheDocument();
          expect(screen.getByText(/present/i)).toBeInTheDocument();
        });
        trackTestResult('Staff attendance history displays correctly', true);
      } catch (error) {
        trackTestResult('Staff attendance history displays correctly', false, error);
        throw error;
      }
    });

    it('should handle check-in functionality', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.post.mockResolvedValue({ data: { success: true } });
        
        renderStaffAttendance();
        
        const checkInButton = screen.getByRole('button', { name: /check in/i });
        expect(checkInButton).toBeInTheDocument();
        
        fireEvent.click(checkInButton);
        
        await waitFor(() => {
          expect(mockAxios.post).toHaveBeenCalledWith('/api/staff/checkin');
        });
        trackTestResult('Staff check-in functionality works', true);
      } catch (error) {
        trackTestResult('Staff check-in functionality works', false, error);
        throw error;
      }
    });

    it('should handle check-out functionality', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.post.mockResolvedValue({ data: { success: true } });
        
        renderStaffAttendance();
        
        const checkOutButton = screen.getByRole('button', { name: /check out/i });
        expect(checkOutButton).toBeInTheDocument();
        
        fireEvent.click(checkOutButton);
        
        await waitFor(() => {
          expect(mockAxios.post).toHaveBeenCalledWith('/api/staff/checkout');
        });
        trackTestResult('Staff check-out functionality works', true);
      } catch (error) {
        trackTestResult('Staff check-out functionality works', false, error);
        throw error;
      }
    });

    it('should handle attendance data loading', async () => {
      try {
        renderStaffAttendance();
        
        // Should show loading state initially
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
        trackTestResult('Staff attendance loading state works', true);
      } catch (error) {
        trackTestResult('Staff attendance loading state works', false, error);
        throw error;
      }
    });

    it('should handle attendance data error', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.get.mockRejectedValue(new Error('Failed to fetch attendance data'));
        
        renderStaffAttendance();
        
        await waitFor(() => {
          expect(screen.getByText(/error loading attendance data/i)).toBeInTheDocument();
        });
        trackTestResult('Staff attendance error handling works', true);
      } catch (error) {
        trackTestResult('Staff attendance error handling works', false, error);
        throw error;
      }
    });
  });

  describe('4. Staff Role-Based Access Tests', () => {
    it('should allow field_staff role access', async () => {
      try {
        mockStaffLogin.mockResolvedValue({ user: { role: 'field_staff', staffId: 'STF-0001' } });
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(staffIdInput, { target: { value: 'STF-0001' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/staff/dashboard', { replace: true });
        });
        trackTestResult('Field staff role access works', true);
      } catch (error) {
        trackTestResult('Field staff role access works', false, error);
        throw error;
      }
    });

    it('should allow delivery_staff role access', async () => {
      try {
        mockStaffLogin.mockResolvedValue({ user: { role: 'delivery_staff', staffId: 'DEL-0001' } });
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(staffIdInput, { target: { value: 'DEL-0001' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith('/staff/dashboard', { replace: true });
        });
        trackTestResult('Delivery staff role access works', true);
      } catch (error) {
        trackTestResult('Delivery staff role access works', false, error);
        throw error;
      }
    });

    it('should deny non-staff role access', async () => {
      try {
        mockStaffLogin.mockRejectedValue({
          response: { data: { message: 'This Staff ID is not permitted for staff portal' } }
        });
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        fireEvent.change(staffIdInput, { target: { value: 'USER-001' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/not permitted for staff portal/i)).toBeInTheDocument();
        });
        trackTestResult('Non-staff role access denial works', true);
      } catch (error) {
        trackTestResult('Non-staff role access denial works', false, error);
        throw error;
      }
    });
  });

  describe('5. Staff Data Security Tests', () => {
    it('should not expose sensitive salary data in console', () => {
      try {
        const consoleSpy = jest.spyOn(console, 'log');
        renderStaffSalaryView();
        
        // Check that sensitive data is not logged
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('28000'));
        trackTestResult('Staff salary data security works', true);
        
        consoleSpy.mockRestore();
      } catch (error) {
        trackTestResult('Staff salary data security works', false, error);
        throw error;
      }
    });

    it('should validate staff ID format', async () => {
      try {
        renderStaffLoginPage();
        
        const staffIdInput = screen.getByPlaceholderText(/staff id/i);
        
        // Test invalid format
        fireEvent.change(staffIdInput, { target: { value: 'invalid-format' } });
        fireEvent.blur(staffIdInput);
        
        await waitFor(() => {
          expect(screen.getByText(/invalid staff id format/i)).toBeInTheDocument();
        });
        trackTestResult('Staff ID format validation works', true);
      } catch (error) {
        trackTestResult('Staff ID format validation works', false, error);
        throw error;
      }
    });
  });
});
