import apiService from './api.service';
import { LoginCredentials, AuthResponse, User } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<{ success: boolean; data: { user: any; accessToken: string; refreshToken: string } }>('/auth/login', credentials);
    // Transformar la respuesta del backend al formato que espera el frontend
    return {
      user: response.data.user,
      token: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  async verifyToken(): Promise<User> {
    const response = await apiService.get<{ success: boolean; data: { user: User } }>('/auth/verify');
    return response.data.user;
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await apiService.post<{ success: boolean; data: { accessToken: string; refreshToken: string } }>('/auth/refresh', { refreshToken });
    return { token: response.data.accessToken };
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', { currentPassword, newPassword });
  }

  async resetPasswordRequest(email: string): Promise<void> {
    await apiService.post('/auth/reset-password-request', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', { token, newPassword });
  }
}

export default new AuthService();
