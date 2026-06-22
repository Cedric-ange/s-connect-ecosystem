import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AnalyticsService {
  constructor(private readonly httpService: HttpService) {}

  async getDashboardData(tenantId: string) {
    // Les futurs calculs appelleront : this.prisma.order.aggregate({ where: { tenantId } })
    return {
      totalSales: 125000,
      totalOrders: 450,
      averageOrderValue: 278,
      conversionRate: 0.15,
      activeOutlets: 120,
      activeVendors: 45,
      tenantContext: tenantId, // 🎯 Traceur
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

  async getSalesAnalytics(
    tenantId: string,
    params: {
      startDate?: string;
      endDate?: string;
      territoryId?: string;
      vendorId?: string;
    },
  ) {
    const daysBetween = params.startDate && params.endDate
      ? Math.floor((new Date(params.endDate).getTime() - new Date(params.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    return {
      totalSales: 50000 + daysBetween * 1000,
      totalOrders: 200 + daysBetween * 5,
      averageOrderValue: 250 + Math.random() * 50,
      topProducts: [
        { sku: 'SKU-FC-70', name: 'Fan Choco Classique', sales: 15000, orders: 50 },
        { sku: 'SKU002', name: 'Produit B', sales: 12000, orders: 40 },
      ],
      salesByChannel: {
        RETAIL: 20000,
        KD: 15000,
        GMS: 15000,
      },
      trends: this.generateDailyTrend(daysBetween),
    };
  }

  async getPerformanceAnalytics(
    tenantId: string,
    params: {
      userId?: string;
      territoryId?: string;
      period?: string;
    },
  ) {
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
      ],
      trends: this.generateWeeklyTrend(8),
    };
  }

  async getTerritoryAnalytics(territoryId: string, tenantId: string) {
    return {
      territoryId,
      totalSales: 75000,
      totalOutlets: 25,
      totalVendors: 8,
      outletPerformance: this.generateOutletPerformance(25),
      marketShare: 0.35,
      penetrationRate: 0.42,
    };
  }

  async generateReport(
    tenantId: string,
    params: {
      type: 'sales' | 'performance' | 'territory';
      startDate: string;
      endDate: string;
      filters?: any;
    },
  ) {
    const reportId = `RPT-${tenantId}-${Date.now()}`;
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      reportId,
      status: 'completed',
      downloadUrl: `/api/analytics/reports/${reportId}`,
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  private generateDailyTrend(days: number) {
    const trend: any[] = [];
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
    const trend: any[] = [];
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
    const performance: any[] = [];
    for (let i = 0; i < count; i++) {
      performance.push({
        outletId: `OUT${String(i + 1).padStart(3, '0')}`,
        name: `Outlet ${i + 1}`,
        sales: 2000 + Math.random() * 8000,
        orders: Math.floor(10 + Math.random() * 30),
      });
    }
    return performance.sort((a, b) => b.sales - a.sales);
  }
}