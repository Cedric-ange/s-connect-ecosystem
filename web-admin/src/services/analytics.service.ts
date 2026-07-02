import api from './api'
import type { DashboardMetrics } from '@/types'

export interface TimeSeriesData {
  labels: string[]
  datasets: { label: string; data: number[] }[]
}

export interface TopItem {
  id: string
  name: string
  value: number
  change?: number
}

export const analyticsService = {
  // 🎯 Appelle l'endpoint GET /analytics/dashboard du Backend
  async getDashboardMetrics(period?: string): Promise<DashboardMetrics> {
    const { data } = await api.get<DashboardMetrics>('/analytics/dashboard', { params: { period } })
    return data
  },

  async getSalesTimeSeries(params?: { period?: string; granularity?: string }): Promise<TimeSeriesData> {
    const { data } = await api.get<TimeSeriesData>('/analytics/time-series/sales', { params })
    return data
  },

  async getTopProducts(params?: { period?: string; limit?: number }): Promise<TopItem[]> {
    const { data } = await api.get<TopItem[]>('/analytics/top-products', { params })
    return data
  },

  async getTopOutlets(params?: { period?: string; limit?: number }): Promise<TopItem[]> {
    const { data } = await api.get<TopItem[]>('/analytics/top-outlets', { params })
    return data
  },

  async getPerformanceByTerritory(params?: { period?: string }): Promise<TopItem[]> {
    const { data } = await api.get<TopItem[]>('/analytics/territory', { params })
    return data
  }
}