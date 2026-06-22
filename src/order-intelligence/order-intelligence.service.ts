import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OrderIntelligenceService {
  private readonly mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  constructor(private readonly httpService: HttpService) {}

  // Prédire la quantité optimale de commande
async predictOrder(data: { outletId: string; historicalData: any }) {
    try {
      const response = await this.httpService.post(`${this.mlServiceUrl}/api/orders/predict`, data).toPromise();
      return response?.data; // Corrigé
    } catch (error) {
      console.log('ML Service non disponible, utilisation de simulation');
      return this.simulatePrediction(data);
    }
  }

  async optimizeOrder(data: any) {
    try {
      const response = await this.httpService.post(`${this.mlServiceUrl}/api/orders/optimize`, data).toPromise();
      return response?.data; // Corrigé
    } catch (error) {
      console.log('ML Service non disponible, utilisation de simulation');
      return this.simulateOptimization(data);
    }
  }

  async getRecommendations(outletId: string) {
    try {
      const response = await this.httpService.get(`${this.mlServiceUrl}/api/orders/recommendations/${outletId}`).toPromise();
      return response?.data; // Corrigé
    } catch (error) {
      console.log('ML Service non disponible, utilisation de simulation');
      return this.simulateRecommendations(outletId);
    }
  }

  async detectAnomalies(data: any) {
    try {
      const response = await this.httpService.post(`${this.mlServiceUrl}/api/orders/anomalies`, data).toPromise();
      return response?.data; // Corrigé
    } catch (error) {
      console.log('ML Service non disponible, utilisation de simulation');
      return this.simulateAnomalies(data);
    }
  }

  // Simulation de prédiction (fallback)
  private simulatePrediction(data: any) {
    const { historicalData } = data;
    const baseQty = historicalData.avgOrderQty || 50;
    const frequencyFactor = historicalData.orderFrequency > 5 ? 1.2 : 0.9;
    const recencyFactor = historicalData.lastOrderDays < 7 ? 1.1 : 0.95;
    
    return {
      recommendedQuantity: Math.round(baseQty * frequencyFactor * recencyFactor),
      confidence: 0.85 + Math.random() * 0.1,
      factors: {
        frequency: frequencyFactor,
        recency: recencyFactor,
        seasonality: 1.0 + Math.random() * 0.2,
      },
      recommendation: 'INCREASE',
    };
  }

  // Simulation d'optimisation (fallback)
  private simulateOptimization(data: any) {
    const { currentOrder } = data;
    return {
      optimizedOrder: currentOrder.map((item: any) => ({
        ...item,
        recommendedQty: Math.round(item.quantity * (0.9 + Math.random() * 0.2)),
        savings: Math.round(item.quantity * item.price * 0.05),
      })),
      totalSavings: Math.round(
        currentOrder.reduce((sum: number, item: any) => sum + item.quantity * item.price, 0) * 0.05,
      ),
      efficiency: 0.85 + Math.random() * 0.1,
    };
  }

  // Simulation de recommandations (fallback)
  private simulateRecommendations(outletId: string) {
    return {
      outletId,
      recommendations: [
        {
          sku: 'SKU001',
          currentStock: 50,
          recommendedStock: 75,
          reason: 'HIGH_DEMAND',
          urgency: 'MEDIUM',
        },
        {
          sku: 'SKU002',
          currentStock: 30,
          recommendedStock: 45,
          reason: 'SEASONAL_TREND',
          urgency: 'LOW',
        },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }

  // Simulation de détection d'anomalies (fallback)
  private simulateAnomalies(data: any) {
    const { orders } = data;
    const anomalies = orders.filter((order: any) => order.quantity > 100 || order.quantity < 5);
    
    return {
      totalOrders: orders.length,
      anomaliesDetected: anomalies.length,
      anomalyRate: anomalies.length / orders.length,
      anomalies: anomalies.map((order: any) => ({
        orderId: order.id,
        type: order.quantity > 100 ? 'HIGH_VALUE' : 'LOW_VALUE',
        value: order.quantity,
        threshold: order.quantity > 100 ? 100 : 5,
        severity: order.quantity > 200 || order.quantity < 3 ? 'HIGH' : 'MEDIUM',
      })),
      summary: {
        needsInvestigation: anomalies.length > 0,
        riskLevel: anomalies.length > 5 ? 'HIGH' : anomalies.length > 2 ? 'MEDIUM' : 'LOW',
      },
    };
  }
}