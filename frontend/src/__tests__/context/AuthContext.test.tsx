import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: { headers: { common: {} } }
}));

// Test component that uses the useAuth hook
const TestComponent = () => {
  const { isAuthenticated, login } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('provides authentication status and login function', async () => {
    (api.post as jest.Mock).mockResolvedValue({ 
      data: {
        success: true, 
        user: { id: 1, email: 'test@example.com' }, 
        access_token: 'mock-token' 
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');

    // Click the login button
    await act(async () => {
      screen.getByText('Login').click();
    });

    // Verify that the state is updated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(localStorage.getItem('token')).toBe('mock-token');
  });
});
