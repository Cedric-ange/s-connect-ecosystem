import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const tenantId = ref<string | null>(localStorage.getItem('tenantId'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'COMPANY_ADMIN' || user.value?.role === 'ADMIN' || user.value?.role === 'SUP')
  const isSup = computed(() => user.value?.role === 'SUP')

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await authService.login(email, password)
      token.value = response.access_token
      refreshToken.value = response.refresh_token
      user.value = response.user
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('refreshToken', response.refresh_token)
      if (response.tenantId) {
        tenantId.value = response.tenantId
        localStorage.setItem('tenantId', response.tenantId)
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    loading.value = true
    try {
      user.value = await authService.getProfile()
    } catch {
      logout()
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  return { user, token, refreshToken, tenantId, loading, isAuthenticated, isAdmin, isSup, login, fetchProfile, logout }
})
