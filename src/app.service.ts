import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSystemStatus() {
    return {
      status: 'healthy',
      service: 'Salesconnected SFA API',
      version: '1.0.0-beta',
      timestamp: new Date().toISOString(),
      architecture: 'Multi-Tenant (X-Tenant-ID isolation enabled)',
    };
  }
}