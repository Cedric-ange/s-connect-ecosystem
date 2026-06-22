import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TerritoriesService } from './territories.service';
import { TenantId } from '../common/decorators/tenant-id.decorator'; // 🎯 Extracteur d'organisation

@ApiTags('Territories')
@Controller('territories')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class TerritoriesController {
  constructor(private territoriesService: TerritoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all territories' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('level') level?: string, 
    @Query('parentId') parentId?: string
  ) {
    const territories = await this.territoriesService.findAll(tenantId, { level, parentId });
    return {
      success: true,
      data: territories,
      message: 'Territories retrieved successfully',
    };
  }

  @Get('sectors')
  @ApiOperation({ summary: 'Get all sectors' })
  async getAllSectors(@TenantId() tenantId: string, @Query('level') level?: string) {
    const sectors = await this.territoriesService.findAllSectors(tenantId, { level });
    return {
      success: true,
      data: sectors,
      message: 'Sectors retrieved successfully',
    };
  }

  @Get('sectors/:id')
  @ApiOperation({ summary: 'Get sector by ID' })
  async getSectorById(@Param('id') id: string, @TenantId() tenantId: string) {
    const sector = await this.territoriesService.getSectorById(id, tenantId);
    return {
      success: true,
      data: sector,
      message: 'Sector retrieved successfully',
    };
  }

  @Post('sectors')
  @ApiOperation({ summary: 'Create a new sector' })
  async createSector(@Body() data: any, @TenantId() tenantId: string) {
    const sector = await this.territoriesService.createSector(data, tenantId);
    return {
      success: true,
      data: sector,
      message: 'Sector created successfully',
    };
  }

  @Post('sectors/assign-outlets')
  @ApiOperation({ summary: 'Assign outlets to sector' })
  async assignOutletsToSector(
    @Body() data: { sectorId: string; outletIds: string[] },
    @TenantId() tenantId: string
  ) {
    const result = await this.territoriesService.assignOutletsToSector(data, tenantId);
    return {
      success: true,
      data: result,
      message: 'Outlets assigned to sector successfully',
    };
  }

  @Post('sectors/assign-vendor')
  @ApiOperation({ summary: 'Assign sector to vendor' })
  async assignSectorToVendor(
    @Body() data: { vendorId: string; sectorId: string },
    @TenantId() tenantId: string
  ) {
    const user = await this.territoriesService.assignSectorToVendor(data, tenantId);
    return {
      success: true,
      data: user,
      message: 'Sector assigned to vendor successfully',
    };
  }

  @Get('vendors/:vendorId/outlets')
  @ApiOperation({ summary: 'Get vendor outlets' })
  async getVendorOutlets(@Param('vendorId') vendorId: string, @TenantId() tenantId: string) {
    const result = await this.territoriesService.getVendorOutlets(vendorId, tenantId);
    return {
      success: true,
      data: result,
      message: 'Vendor outlets retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get territory by ID' })
  async findById(@Param('id') id: string, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.findById(id, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Territory retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new territory' })
  async create(@Body() data: any, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.create(data, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Territory created successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update territory' })
  async update(@Param('id') id: string, @Body() data: any, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.update(id, data, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Territory updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete territory' })
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.territoriesService.delete(id, tenantId);
    return {
      success: true,
      message: 'Territory deleted successfully',
    };
  }

  @Get('users/managers/list')
  @ApiOperation({ summary: 'Get all managers' })
  async getManagers(@TenantId() tenantId: string) {
    const managers = await this.territoriesService.getManagers(tenantId);
    return {
      success: true,
      data: managers,
      message: 'Managers retrieved successfully',
    };
  }

  @Get('admins/available')
  @ApiOperation({ summary: 'Get available admins' })
  async getAvailableAdmins(@TenantId() tenantId: string, @Query('excludeTerritoryId') excludeTerritoryId?: string) {
    const admins = await this.territoriesService.getAvailableAdmins(tenantId, excludeTerritoryId);
    return {
      success: true,
      data: admins,
      message: 'Available admins retrieved successfully',
    };
  }

  @Patch(':id/assign-admin')
  @ApiOperation({ summary: 'Assign admin to territory' })
  async assignAdmin(
    @Param('id') territoryId: string, 
    @Body('adminId') adminId: string,
    @TenantId() tenantId: string
  ) {
    const territory = await this.territoriesService.assignAdmin(territoryId, adminId, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Admin assigned successfully',
    };
  }

  @Patch(':id/reassign-admin')
  @ApiOperation({ summary: 'Reassign admin to territory' })
  async reassignAdmin(
    @Param('id') territoryId: string, 
    @Body('adminId') adminId: string,
    @TenantId() tenantId: string
  ) {
    const territory = await this.territoriesService.reassignAdmin(territoryId, adminId, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Admin reassigned successfully',
    };
  }

  @Delete(':id/remove-admin')
  @ApiOperation({ summary: 'Remove admin from territory' })
  async removeAdmin(@Param('id') territoryId: string, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.removeAdmin(territoryId, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Admin removed successfully',
    };
  }

  @Patch('sectors/:id/reassign-vendor')
  @ApiOperation({ summary: 'Reassign vendor to sector' })
  async reassignSectorVendor(
    @Param('id') sectorId: string, 
    @Body('vendorId') vendorId: string,
    @TenantId() tenantId: string
  ) {
    const territory = await this.territoriesService.reassignSectorVendor(sectorId, vendorId, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Vendor reassigned successfully',
    };
  }

  @Delete('sectors/:id/unassign-vendor')
  @ApiOperation({ summary: 'Unassign vendor from sector' })
  async unassignSectorVendor(@Param('id') sectorId: string, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.unassignSectorVendor(sectorId, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Vendor unassigned successfully',
    };
  }

  @Get('vendors/with-sectors')
  @ApiOperation({ summary: 'Get all vendors with sectors' })
  async getAllVendorsWithSectors(@TenantId() tenantId: string) {
    const vendors = await this.territoriesService.getAllVendorsWithSectors(tenantId);
    return {
      success: true,
      data: vendors,
      message: 'Vendors with sectors retrieved successfully',
    };
  }

  @Get(':id/geo-info')
  @ApiOperation({ summary: 'Get territory geographic info' })
  async getTerritoryGeoInfo(@Param('id') territoryId: string, @TenantId() tenantId: string) {
    const geoInfo = await this.territoriesService.getTerritoryGeoInfo(territoryId, tenantId);
    return {
      success: true,
      data: geoInfo,
      message: 'Geographic info retrieved successfully',
    };
  }

  @Post('sectors/remove-outlets')
  @ApiOperation({ summary: 'Remove outlets from sector' })
  async removeOutletsFromSector(
    @Body() data: { sectorId: string; outletIds: string[] },
    @TenantId() tenantId: string
  ) {
    const result = await this.territoriesService.removeOutletsFromSector(data, tenantId);
    return {
      success: true,
      data: result,
      message: 'Outlets removed successfully',
    };
  }

  @Post('vendors/assign-outlets')
  @ApiOperation({ summary: 'Assign outlets to vendor' })
  async assignOutletsToVendor(
    @Body() data: { vendorId: string; outletIds: string[] },
    @TenantId() tenantId: string
  ) {
    const result = await this.territoriesService.assignOutletsToVendor(data, tenantId);
    return {
      success: true,
      data: result,
      message: 'Outlets assigned to vendor successfully',
    };
  }

  @Delete('vendors/:vendorId/sector')
  @ApiOperation({ summary: 'Remove sector from vendor' })
  async removeSectorFromVendor(@Param('vendorId') vendorId: string, @TenantId() tenantId: string) {
    const result = await this.territoriesService.removeSectorFromVendor(vendorId, tenantId);
    return {
      success: true,
      data: result,
      message: 'Sector removed from vendor successfully',
    };
  }

  @Get('vendors/:vendorId/assigned-sector')
  @ApiOperation({ summary: 'Get vendor assigned sector' })
  async getVendorAssignedSector(@Param('vendorId') vendorId: string, @TenantId() tenantId: string) {
    const sector = await this.territoriesService.getVendorAssignedSector(vendorId, tenantId);
    return sector;
  }
}