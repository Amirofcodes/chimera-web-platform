import api from '../../services/api';
import { authService } from '../../services/authService';

// Mock the entire api module
jest.mock('../../services/api', () => ({
  post: jest.fn()
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requestPasswordReset calls the correct API endpoint', async () => {
    const mockResponse = { data: { success: true } };
    (api.post as jest.Mock).mockResolvedValue(mockResponse);

    const email = 'test@example.com';
    await authService.requestPasswordReset(email);

    expect(api.post).toHaveBeenCalledWith('/auth/request-reset', { email });
  });
});
