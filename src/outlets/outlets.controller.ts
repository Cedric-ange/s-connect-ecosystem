import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards, Query, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OutletsService } from './outlets.service';
import { TenantId } from '../common/decorators/tenant-id.decorator'; // 🎯 Extracteur d'organisation

@ApiTags('Outlets')
@Controller('outlets')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OutletsController {
  constructor(private outletsService: OutletsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all outlets' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('territoryId') territoryId?: string,
    @Query('channel') channel?: string,
    @Query('proposedBy') proposedBy?: string,
  ) {
    return this.outletsService.findAll(tenantId, {
      status,
      territoryId,
      channel,
      proposedBy,
    });
  }

  @Get('my-territory')
  @ApiOperation({ summary: 'Get outlets from my territory' })
  async getMyTerritoryOutlets(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('channel') channel?: string,
  ) {
    return this.outletsService.getMyTerritoryOutlets(tenantId, { status, channel });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get outlets statistics' })
  async getStats(
    @TenantId() tenantId: string,
    @Query('territoryId') territoryId?: string,
    @Query('proposedBy') proposedBy?: string,
  ) {
    return this.outletsService.getStats(tenantId, { territoryId, proposedBy });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get outlet by ID' })
  async findById(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.outletsService.findById(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new outlet' })
  async create(
    @Request() req,
    @TenantId() tenantId: string,
    @Body() data: any
  ) {
    return this.outletsService.create(data, tenantId, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update outlet' })
  async update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() data: any
  ) {
    return this.outletsService.update(id, data, tenantId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve outlet' })
  async approve(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Request() req
  ) {
    return this.outletsService.approve(id, tenantId, req.user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject outlet' })
  async reject(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Request() req,
    @Body('reason') reason?: string
  ) {
    return this.outletsService.reject(id, reason, tenantId, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete outlet' })
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.outletsService.delete(id, tenantId);
    return {
      success: true,
      message: 'Outlet deleted successfully within company boundaries',
    };
  }
}