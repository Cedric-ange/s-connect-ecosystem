import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderIntelligenceService } from './order-intelligence.service';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@ApiTags('Order Intelligence')
@Controller('order-intelligence')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OrderIntelligenceController {
  constructor(private readonly orderIntelligenceService: OrderIntelligenceService) {}

  @Post('predict')
  @ApiOperation({ summary: 'Predict optimal order quantities' })
  async predict(@TenantId() tenantId: string, @Body() data: any) {
    return this.orderIntelligenceService.predictOrder(data, tenantId);
  }

  @Post('optimize')
  @ApiOperation({ summary: 'Optimize current order lines' })
  async optimize(@TenantId() tenantId: string, @Body() data: any) {
    return this.orderIntelligenceService.optimizeOrder(data, tenantId);
  }

  @Get('recommendations/:outletId')
  @ApiOperation({ summary: 'Get product recommendations for an outlet' })
  async getRecommendations(@Param('outletId') outletId: string, @TenantId() tenantId: string) {
    return this.orderIntelligenceService.getRecommendations(outletId, tenantId);
  }

  @Post('anomalies')
  @ApiOperation({ summary: 'Detect order volume anomalies' })
  async detectAnomalies(@TenantId() tenantId: string, @Body() data: any) {
    return this.orderIntelligenceService.detectAnomalies(data, tenantId);
  }
}