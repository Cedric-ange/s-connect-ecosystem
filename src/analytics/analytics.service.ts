import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AnalyticsService {
  constructor(private readonly httpService: HttpService) {}

  async getDashboardData() {
    return {
      totalSales: 125000,
      totalOrders: 450,
      averageOrderValue: 278,
      conversionRate: 0.15,
      activeOutlets: 120,
      activeVendors: 45,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      trends: {
        salesGrowth: 12.5,
        ordersGrowth: 8.3,
        conversionGrowth: -2.1,
      },
    };
  }

  async getSalesAnalytics(params: {
    startDate?: string;
    endDate?: string;
    territoryId?: string;
    vendorId?: string;
  }) {
    // Simulation d'analytics de ventes
    const daysBetween = params.startDate && params.endDate
      ? Math.floor((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    return {
      totalSales: 50000 + daysBetween * 1000,
      totalOrders: 200 + daysBetween * 5,
      averageOrderValue: 250 + Math.random() * 50,
      topProducts: [
        { sku: 'SKU001', name: 'Produit A', sales: 15000, orders: 50 },
        { sku: 'SKU002', name: 'Produit B', sales: 12000, orders: 40 },
        { sku: 'SKU003', name: 'Produit C', sales: 8000, orders: 35 },
      ],
      salesByChannel: {
        GT: 20000,
        MT: 15000,
        HORECA: 10000,
        PROXI: 5000,
      },
      trends: this.generateDailyTrend(daysBetween),
    };
  }

  async getPerformanceAnalytics(params: {
    userId?: string;
    territoryId?: string;
    period?: string;
  }) {
    return {
      kpis: {
        visitsCompleted: 45,
        visitsScheduled: 50,
        visitRate: 0.9,
        averageVisitDuration: 25,
        ordersPerVisit: 1.2,
        averageOrderValue: 278,
      },
      ranking: {
        position: 5,
        total: 20,
        percentile: 75,
      },
      performance: [
        { metric: 'Visits', value: 45, target: 40, achieved: true },
        { metric: 'Orders', value: 54, target: 50, achieved: true },
        { metric: 'Sales', value: 15000, target: 12000, achieved: true },
        { metric: 'New Outlets', value: 3, target: 5, achieved: false },
      ],
      trends: this.generateWeeklyTrend(8),
    };
  }

  async getTerritoryAnalytics(territoryId: string) {
    return {
      territoryId,
      totalSales: 75000,
      totalOutlets: 25,
      totalVendors: 8,
      outletPerformance: this.generateOutletPerformance(25),
      marketShare: 0.35,
      penetrationRate: 0.42,
      growthPotential: 0.25,
      topPerformers: [
        { outletId: 'OUT001', name: 'Outlet A', sales: 15000 },
        { outletId: 'OUT002', name: 'Outlet B', sales: 12000 },
        { outletId: 'OUT003', name: 'Outlet C', sales: 10000 },
      ],
      underPerformers: [
        { outletId: 'OUT004', name: 'Outlet D', sales: 2000 },
        { outletId: 'OUT005', name: 'Outlet E', sales: 3000 },
      ],
    };
  }

  async generateReport(params: {
    type: 'sales' | 'performance' | 'territory';
    startDate: string;
    endDate: string;
    filters?: any;
  }) {
    const reportId = `RPT-${Date.now()}`;
    
    // Simulation de génération de rapport
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      reportId,
      status: 'completed',
      downloadUrl: `/api/analytics/reports/${reportId}`,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      summary: {
        totalRecords: 450,
        dataPoints: 30,
        period: {
          start: params.startDate,
          end: params.endDate,
        },
      },
    };
  }

  // Remplacer les 3 méthodes privées tout en bas du fichier
  private generateDailyTrend(days: number) {
    const trend: any[] = []; // Corrigé
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trend.push({
        date: date.toISOString().split('T')[0],
        sales: 1000 + Math.random() * 500,
        orders: Math.floor(10 + Math.random() * 20),
      });
    }
    return trend;
  }

  private generateWeeklyTrend(weeks: number) {
    const trend: any[] = []; // Corrigé
    for (let i = weeks; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      trend.push({
        week: `Week ${weeks - i}`,
        visits: Math.floor(20 + Math.random() * 30),
        orders: Math.floor(25 + Math.random() * 40),
        sales: 5000 + Math.random() * 2000,
      });
    }
    return trend;
  }

  private generateOutletPerformance(count: number) {
    const performance: any[] = []; // Corrigé
    for (let i = 0; i < count; i++) {
      performance.push({
        outletId: `OUT${String(i + 1).padStart(3, '0')}`,
        name: `Outlet ${i + 1}`,
        sales: 2000 + Math.random() * 8000,
        orders: Math.floor(10 + Math.random() * 30),
        visits: Math.floor(15 + Math.random() * 20),
        growth: -10 + Math.random() * 30,
      });
    }
    return performance.sort((a, b) => b.sales - a.sales);
  }}