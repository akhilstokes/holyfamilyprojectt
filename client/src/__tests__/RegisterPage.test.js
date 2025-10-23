import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../pages/auth/RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import '@testing-library/jest-dom';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({ state: null })
}));

const mockRegister = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    user: null
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('Rendering', () => {
    it('should render registration form', () => {
      renderRegisterPage();
      
      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
    });

    it('should render progress indicator', () => {
      renderRegisterPage();
      
      // Progress bars should be present
      const progressBars = screen.getAllByRole('progressbar', { hidden: true });
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should render company logo', () => {
      renderRegisterPage();
      
      const logo = screen.getByAltText(/company logo/i);
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Form Validation - Name', () => {
    it('should validate name field', async () => {
      renderRegisterPage();
      
      const nameInput = screen.getByPlaceholderText(/full name/i);
      
      // Test empty name
      fireEvent.change(nameInput, { target: { value: '' } });
      await waitFor(() => {
        expect(screen.getByText(/letters only/i)).toBeInTheDocument();
      });

      // Test valid name
      fireEvent.change(nameInput, { target: { value: 'JohnDoe' } });
      await waitFor(() => {
        expect(screen.getByText(/valid name/i)).toBeInTheDocument();
      });
    });

    it('should not allow spaces in name', () => {
      renderRegisterPage();
      
      const nameInput = screen.getByPlaceholderText(/full name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      // Spaces should be removed
      expect(nameInput.value).toBe('JohnDoe');
    });

    it('should prevent space key in name field', () => {
      renderRegisterPage();
      
      const nameInput = screen.getByPlaceholderText(/full name/i);
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      
      Object.defineProperty(spaceEvent, 'target', { value: nameInput, configurable: true });
      const preventDefaultSpy = jest.spyOn(spaceEvent, 'preventDefault');
      
      fireEvent.keyDown(nameInput, spaceEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Form Validation - Email', () => {
    it('should validate email format', async () => {
      renderRegisterPage();
      
      const emailInput = screen.getByPlaceholderText(/email address/i);
      
      // Invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      await waitFor(() => {
        expect(emailInput).toHaveClass('error');
      });

      // Valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('should show helper text for email', () => {
      renderRegisterPage();
      
      expect(screen.getByText(/we'll send confirmations here/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation - Phone Number', () => {
    it('should validate Indian phone number', async () => {
      renderRegisterPage();
      
      const phoneInput = screen.getByPlaceholderText(/phone number/i);
      
      // Invalid phone
      fireEvent.change(phoneInput, { target: { value: '123' } });
      await waitFor(() => {
        expect(phoneInput).toHaveClass('error');
      });

      // Valid phone
      fireEvent.change(phoneInput, { target: { value: '9876543210' } });
      await waitFor(() => {
        expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
      });
    });

    it('should limit phone number length', () => {
      renderRegisterPage();
      
      const phoneInput = screen.getByPlaceholderText(/phone number/i);
      expect(phoneInput).toHaveAttribute('maxLength', '15');
    });
  });

  describe('Form Validation - Password', () => {
    it('should validate password strength', async () => {
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
    });

    it('should check password confirmation match', async () => {
      renderRegisterPage();
      
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      const confirmInput = screen.getByPlaceholderText(/confirm password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'Test@1234' } });
      fireEvent.change(confirmInput, { target: { value: 'Different@1234' } });

      await waitFor(() => {
        expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
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
    });

    it('should navigate to login after successful registration', async () => {
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
    });

    it('should handle registration error', async () => {
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
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      renderRegisterPage();
      
      const passwordInput = screen.getByPlaceholderText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getAllByRole('button', { name: /toggle/i })[0];
      fireEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });
});
