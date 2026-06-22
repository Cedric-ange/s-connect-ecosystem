import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overview dashboard metrics' })
  async getDashboard(@TenantId() tenantId: string) {
    return this.analyticsService.getDashboardData(tenantId);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get detailed sales analytics' })
  async getSalesAnalytics(
    @TenantId() tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('territoryId') territoryId?: string,
    @Query('vendorId') vendorId?: string,
  ) {
    return this.analyticsService.getSalesAnalytics(tenantId, {
      startDate,
      endDate,
      territoryId,
      vendorId,
    });
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get representative KPIs performance' })
  async getPerformanceAnalytics(
    @TenantId() tenantId: string,
    @Query('userId') userId?: string,
    @Query('territoryId') territoryId?: string,
    @Query('period') period?: string,
  ) {
    return this.analyticsService.getPerformanceAnalytics(tenantId, {
      userId,
      territoryId,
      period,
    });
  }

  @Get('territories/:territoryId')
  @ApiOperation({ summary: 'Get regional territory insights' })
  async getTerritoryAnalytics(@Param('territoryId') territoryId: string, @TenantId() tenantId: string) {
    return this.analyticsService.getTerritoryAnalytics(territoryId, tenantId);
  }

  @Post('reports')
  @ApiOperation({ summary: 'Trigger an export report generation' })
  async generateReport(@TenantId() tenantId: string, @Body() data: any) {
    return this.analyticsService.generateReport(tenantId, data);
  }
}