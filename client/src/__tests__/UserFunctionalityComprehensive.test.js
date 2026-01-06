import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserDashboard from '../pages/user_dashboard/UserDashboard';
import Profile from '../pages/user_dashboard/Profile';
import UserTransactions from '../pages/user_dashboard/UserTransactions';
import UserLiveRate from '../UserLiveRate';
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
const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  phoneNumber: '9876543210'
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: jest.fn()
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

describe('User Functionality Comprehensive Tests', () => {
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
    console.log('\n=== USER FUNCTIONALITY COMPREHENSIVE TEST RESULTS ===');
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

  const renderUserDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <UserDashboard />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const renderUserProfile = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Profile />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const renderUserTransactions = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <UserTransactions />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const renderUserLiveRate = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <UserLiveRate />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('1. User Dashboard Tests', () => {
    beforeEach(() => {
      // Mock successful API responses for dashboard data
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          stats: {
            totalTransactions: 15,
            totalAmount: 125000,
            pendingRequests: 3,
            completedTransactions: 12
          },
          recentTransactions: [
            {
              id: 'TXN001',
              type: 'Buy',
              amount: 5000,
              status: 'Completed',
              date: '2024-01-15'
            }
          ]
        }
      });
    });

    it('should render user dashboard', () => {
      try {
        renderUserDashboard();
        
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
        trackTestResult('User dashboard renders correctly', true);
      } catch (error) {
        trackTestResult('User dashboard renders correctly', false, error);
        throw error;
      }
    });

    it('should display user statistics', async () => {
      try {
        renderUserDashboard();
        
        await waitFor(() => {
          expect(screen.getByText(/total transactions/i)).toBeInTheDocument();
          expect(screen.getByText(/total amount/i)).toBeInTheDocument();
          expect(screen.getByText(/pending requests/i)).toBeInTheDocument();
          expect(screen.getByText(/completed transactions/i)).toBeInTheDocument();
        });
        trackTestResult('User dashboard statistics display correctly', true);
      } catch (error) {
        trackTestResult('User dashboard statistics display correctly', false, error);
        throw error;
      }
    });

    it('should display recent transactions', async () => {
      try {
        renderUserDashboard();
        
        await waitFor(() => {
          expect(screen.getByText(/recent transactions/i)).toBeInTheDocument();
          expect(screen.getByText(/TXN001/i)).toBeInTheDocument();
          expect(screen.getByText(/buy/i)).toBeInTheDocument();
        });
        trackTestResult('User dashboard recent transactions display correctly', true);
      } catch (error) {
        trackTestResult('User dashboard recent transactions display correctly', false, error);
        throw error;
      }
    });

    it('should handle dashboard data loading', async () => {
      try {
        renderUserDashboard();
        
        // Should show loading state initially
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
        trackTestResult('User dashboard loading state works', true);
      } catch (error) {
        trackTestResult('User dashboard loading state works', false, error);
        throw error;
      }
    });

    it('should handle dashboard data error', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.get.mockRejectedValue(new Error('Failed to fetch dashboard data'));
        
        renderUserDashboard();
        
        await waitFor(() => {
          expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
        });
        trackTestResult('User dashboard error handling works', true);
      } catch (error) {
        trackTestResult('User dashboard error handling works', false, error);
        throw error;
      }
    });

    it('should allow dashboard refresh', async () => {
      try {
        renderUserDashboard();
        
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
        
        fireEvent.click(refreshButton);
        
        await waitFor(() => {
          expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });
        trackTestResult('User dashboard refresh functionality works', true);
      } catch (error) {
        trackTestResult('User dashboard refresh functionality works', false, error);
        throw error;
      }
    });
  });

  describe('2. User Profile Tests', () => {
    beforeEach(() => {
      // Mock successful API responses for profile data
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          profile: {
            name: 'John Doe',
            email: 'john@example.com',
            phoneNumber: '9876543210',
            address: '123 Main St, City',
            createdAt: '2024-01-01'
          }
        }
      });
    });

    it('should render user profile page', () => {
      try {
        renderUserProfile();
        
        expect(screen.getByText(/profile/i)).toBeInTheDocument();
        expect(screen.getByText(/personal information/i)).toBeInTheDocument();
        trackTestResult('User profile page renders correctly', true);
      } catch (error) {
        trackTestResult('User profile page renders correctly', false, error);
        throw error;
      }
    });

    it('should display user profile information', async () => {
      try {
        renderUserProfile();
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
          expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
          expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
        });
        trackTestResult('User profile information displays correctly', true);
      } catch (error) {
        trackTestResult('User profile information displays correctly', false, error);
        throw error;
      }
    });

    it('should allow profile editing', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.put.mockResolvedValue({ data: { success: true } });
        
        renderUserProfile();
        
        const nameInput = screen.getByDisplayValue('John Doe');
        fireEvent.change(nameInput, { target: { value: 'John Smith' } });
        
        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);
        
        await waitFor(() => {
          expect(mockAxios.put).toHaveBeenCalledWith('/api/user/profile', 
            expect.objectContaining({ name: 'John Smith' })
          );
        });
        trackTestResult('User profile editing works', true);
      } catch (error) {
        trackTestResult('User profile editing works', false, error);
        throw error;
      }
    });

    it('should validate profile form fields', async () => {
      try {
        renderUserProfile();
        
        const emailInput = screen.getByDisplayValue('john@example.com');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
        
        await waitFor(() => {
          expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        });
        trackTestResult('User profile form validation works', true);
      } catch (error) {
        trackTestResult('User profile form validation works', false, error);
        throw error;
      }
    });

    it('should handle profile update error', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.put.mockRejectedValue(new Error('Failed to update profile'));
        
        renderUserProfile();
        
        const nameInput = screen.getByDisplayValue('John Doe');
        fireEvent.change(nameInput, { target: { value: 'John Smith' } });
        
        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);
        
        await waitFor(() => {
          expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
        });
        trackTestResult('User profile update error handling works', true);
      } catch (error) {
        trackTestResult('User profile update error handling works', false, error);
        throw error;
      }
    });

    it('should allow profile reset', () => {
      try {
        renderUserProfile();
        
        const nameInput = screen.getByDisplayValue('John Doe');
        fireEvent.change(nameInput, { target: { value: 'Modified Name' } });
        
        const resetButton = screen.getByRole('button', { name: /reset/i });
        fireEvent.click(resetButton);
        
        expect(nameInput.value).toBe('John Doe');
        trackTestResult('User profile reset functionality works', true);
      } catch (error) {
        trackTestResult('User profile reset functionality works', false, error);
        throw error;
      }
    });
  });

  describe('3. User Transactions Tests', () => {
    beforeEach(() => {
      // Mock successful API responses for transaction data
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          transactions: [
            {
              id: 'TXN001',
              type: 'Buy',
              amount: 5000,
              status: 'Completed',
              date: '2024-01-15',
              description: 'Purchase of materials'
            },
            {
              id: 'TXN002',
              type: 'Sell',
              amount: 3000,
              status: 'Pending',
              date: '2024-01-16',
              description: 'Sale of products'
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 5,
            totalItems: 25
          }
        }
      });
    });

    it('should render user transactions page', () => {
      try {
        renderUserTransactions();
        
        expect(screen.getByText(/transactions/i)).toBeInTheDocument();
        expect(screen.getByText(/transaction history/i)).toBeInTheDocument();
        trackTestResult('User transactions page renders correctly', true);
      } catch (error) {
        trackTestResult('User transactions page renders correctly', false, error);
        throw error;
      }
    });

    it('should display transaction list', async () => {
      try {
        renderUserTransactions();
        
        await waitFor(() => {
          expect(screen.getByText(/TXN001/i)).toBeInTheDocument();
          expect(screen.getByText(/TXN002/i)).toBeInTheDocument();
          expect(screen.getByText(/buy/i)).toBeInTheDocument();
          expect(screen.getByText(/sell/i)).toBeInTheDocument();
        });
        trackTestResult('User transaction list displays correctly', true);
      } catch (error) {
        trackTestResult('User transaction list displays correctly', false, error);
        throw error;
      }
    });

    it('should filter transactions by type', async () => {
      try {
        renderUserTransactions();
        
        await waitFor(() => {
          const buyFilter = screen.getByRole('button', { name: /buy/i });
          fireEvent.click(buyFilter);
          
          expect(screen.getByText(/TXN001/i)).toBeInTheDocument();
          expect(screen.queryByText(/TXN002/i)).not.toBeInTheDocument();
        });
        trackTestResult('User transaction filtering by type works', true);
      } catch (error) {
        trackTestResult('User transaction filtering by type works', false, error);
        throw error;
      }
    });

    it('should filter transactions by status', async () => {
      try {
        renderUserTransactions();
        
        await waitFor(() => {
          const completedFilter = screen.getByRole('button', { name: /completed/i });
          fireEvent.click(completedFilter);
          
          expect(screen.getByText(/TXN001/i)).toBeInTheDocument();
          expect(screen.queryByText(/TXN002/i)).not.toBeInTheDocument();
        });
        trackTestResult('User transaction filtering by status works', true);
      } catch (error) {
        trackTestResult('User transaction filtering by status works', false, error);
        throw error;
      }
    });

    it('should handle transaction pagination', async () => {
      try {
        renderUserTransactions();
        
        await waitFor(() => {
          const nextButton = screen.getByRole('button', { name: /next/i });
          expect(nextButton).toBeInTheDocument();
          
          fireEvent.click(nextButton);
          
          expect(screen.getByText(/page 2/i)).toBeInTheDocument();
        });
        trackTestResult('User transaction pagination works', true);
      } catch (error) {
        trackTestResult('User transaction pagination works', false, error);
        throw error;
      }
    });

    it('should allow transaction search', async () => {
      try {
        renderUserTransactions();
        
        const searchInput = screen.getByPlaceholderText(/search transactions/i);
        fireEvent.change(searchInput, { target: { value: 'TXN001' } });
        
        await waitFor(() => {
          expect(screen.getByText(/TXN001/i)).toBeInTheDocument();
          expect(screen.queryByText(/TXN002/i)).not.toBeInTheDocument();
        });
        trackTestResult('User transaction search works', true);
      } catch (error) {
        trackTestResult('User transaction search works', false, error);
        throw error;
      }
    });

    it('should handle transaction data loading', async () => {
      try {
        renderUserTransactions();
        
        // Should show loading state initially
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
        trackTestResult('User transaction loading state works', true);
      } catch (error) {
        trackTestResult('User transaction loading state works', false, error);
        throw error;
      }
    });

    it('should handle transaction data error', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.get.mockRejectedValue(new Error('Failed to fetch transactions'));
        
        renderUserTransactions();
        
        await waitFor(() => {
          expect(screen.getByText(/error loading transactions/i)).toBeInTheDocument();
        });
        trackTestResult('User transaction error handling works', true);
      } catch (error) {
        trackTestResult('User transaction error handling works', false, error);
        throw error;
      }
    });
  });

  describe('4. User Live Rate Tests', () => {
    beforeEach(() => {
      // Mock successful API responses for live rate data
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          rates: {
            HDPE: { buy: 45.50, sell: 47.00 },
            LDPE: { buy: 42.30, sell: 44.00 },
            PP: { buy: 38.75, sell: 40.50 }
          },
          lastUpdated: '2024-01-15T10:30:00Z'
        }
      });
    });

    it('should render live rate page', () => {
      try {
        renderUserLiveRate();
        
        expect(screen.getByText(/live rates/i)).toBeInTheDocument();
        expect(screen.getByText(/current market rates/i)).toBeInTheDocument();
        trackTestResult('User live rate page renders correctly', true);
      } catch (error) {
        trackTestResult('User live rate page renders correctly', false, error);
        throw error;
      }
    });

    it('should display live rates', async () => {
      try {
        renderUserLiveRate();
        
        await waitFor(() => {
          expect(screen.getByText(/HDPE/i)).toBeInTheDocument();
          expect(screen.getByText(/LDPE/i)).toBeInTheDocument();
          expect(screen.getByText(/PP/i)).toBeInTheDocument();
          expect(screen.getByText(/45.50/i)).toBeInTheDocument();
          expect(screen.getByText(/47.00/i)).toBeInTheDocument();
        });
        trackTestResult('User live rates display correctly', true);
      } catch (error) {
        trackTestResult('User live rates display correctly', false, error);
        throw error;
      }
    });

    it('should show last updated time', async () => {
      try {
        renderUserLiveRate();
        
        await waitFor(() => {
          expect(screen.getByText(/last updated/i)).toBeInTheDocument();
          expect(screen.getByText(/2024-01-15/i)).toBeInTheDocument();
        });
        trackTestResult('User live rate last updated time displays correctly', true);
      } catch (error) {
        trackTestResult('User live rate last updated time displays correctly', false, error);
        throw error;
      }
    });

    it('should allow rate refresh', async () => {
      try {
        renderUserLiveRate();
        
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
        
        fireEvent.click(refreshButton);
        
        await waitFor(() => {
          expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });
        trackTestResult('User live rate refresh functionality works', true);
      } catch (error) {
        trackTestResult('User live rate refresh functionality works', false, error);
        throw error;
      }
    });

    it('should handle live rate data loading', async () => {
      try {
        renderUserLiveRate();
        
        // Should show loading state initially
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        await waitFor(() => {
          expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        });
        trackTestResult('User live rate loading state works', true);
      } catch (error) {
        trackTestResult('User live rate loading state works', false, error);
        throw error;
      }
    });

    it('should handle live rate data error', async () => {
      try {
        const mockAxios = require('axios');
        mockAxios.get.mockRejectedValue(new Error('Failed to fetch live rates'));
        
        renderUserLiveRate();
        
        await waitFor(() => {
          expect(screen.getByText(/error loading live rates/i)).toBeInTheDocument();
        });
        trackTestResult('User live rate error handling works', true);
      } catch (error) {
        trackTestResult('User live rate error handling works', false, error);
        throw error;
      }
    });
  });

  describe('5. User Navigation Tests', () => {
    it('should navigate to profile from dashboard', () => {
      try {
        renderUserDashboard();
        
        const profileLink = screen.getByRole('link', { name: /profile/i });
        fireEvent.click(profileLink);
        
        expect(mockedNavigate).toHaveBeenCalledWith('/user/profile');
        trackTestResult('User navigation to profile works', true);
      } catch (error) {
        trackTestResult('User navigation to profile works', false, error);
        throw error;
      }
    });

    it('should navigate to transactions from dashboard', () => {
      try {
        renderUserDashboard();
        
        const transactionsLink = screen.getByRole('link', { name: /transactions/i });
        fireEvent.click(transactionsLink);
        
        expect(mockedNavigate).toHaveBeenCalledWith('/user/transactions');
        trackTestResult('User navigation to transactions works', true);
      } catch (error) {
        trackTestResult('User navigation to transactions works', false, error);
        throw error;
      }
    });

    it('should navigate to live rates from dashboard', () => {
      try {
        renderUserDashboard();
        
        const liveRatesLink = screen.getByRole('link', { name: /live rates/i });
        fireEvent.click(liveRatesLink);
        
        expect(mockedNavigate).toHaveBeenCalledWith('/user/live-rates');
        trackTestResult('User navigation to live rates works', true);
      } catch (error) {
        trackTestResult('User navigation to live rates works', false, error);
        throw error;
      }
    });
  });

  describe('6. User Data Security Tests', () => {
    it('should not expose sensitive transaction data in console', () => {
      try {
        const consoleSpy = jest.spyOn(console, 'log');
        renderUserTransactions();
        
        // Check that sensitive data is not logged
        expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('5000'));
        trackTestResult('User transaction data security works', true);
        
        consoleSpy.mockRestore();
      } catch (error) {
        trackTestResult('User transaction data security works', false, error);
        throw error;
      }
    });

    it('should validate user permissions', () => {
      try {
        renderUserDashboard();
        
        // User should not see admin-only features
        expect(screen.queryByText(/admin panel/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/staff management/i)).not.toBeInTheDocument();
        trackTestResult('User permission validation works', true);
      } catch (error) {
        trackTestResult('User permission validation works', false, error);
        throw error;
      }
    });
  });
});

