import api from './api'
import type { AuthResponse, User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login-auto', { email, password })
    return data
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<{ success: boolean; user: User }>('/auth/profile')
    return data.user
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const { data } = await api.post('/auth/refresh', { refreshToken })
    return data
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken })
  },
}
