import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from './api'
import type { User } from '../types'

interface AuthResponse {
  access_token: string
  refresh_token: string
  tenantId?: string
  user: User
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>('/auth/login-auto', { email, password })
    await AsyncStorage.setItem('token', data.access_token)
    await AsyncStorage.setItem('refreshToken', data.refresh_token)
    await AsyncStorage.setItem('user', JSON.stringify(data.user))
    if (data.tenantId) {
      await AsyncStorage.setItem('tenantId', data.tenantId)
    }
    return data
  },

  async getProfile(): Promise<User> {
    const data = await api.get<{ success: boolean; user: User }>('/auth/profile')
    return data.user
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['token', 'refreshToken', 'user'])
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('token')
    return !!token
  },
}
