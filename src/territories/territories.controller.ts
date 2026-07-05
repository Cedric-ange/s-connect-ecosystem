import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Query, 
  Patch, 
  HttpCode, 
  HttpStatus, 
  ParseUUIDPipe 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TerritoriesService } from './territories.service';
import { TenantId } from '../common/decorators/tenant-id.decorator'; // Extracteur d'organisation (KPI unique entreprise)
import { RolesGuard } from '../auth/guards/roles.guard';             // Validation des permissions métiers
import { Roles } from '../auth/decorators/roles.decorator';           // Décorateur d'autorisation
import { GetUser } from '../auth/decorators/get-user.decorator';       // Extracteur de l'utilisateur connecté
import { RoleEnum } from '../common/types/user-hierarchy.types';

@ApiTags('Territories')
@Controller('territories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class TerritoriesController {
  constructor(private readonly territoriesService: TerritoriesService) {}

  // ==========================================
  // 🗺️ GESTION DES TERRITOIRES / ZONES GLOBALES
  // ==========================================

  @Get()
  @Roles(RoleEnum.SUP, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all territories (Filtered by organizational tenant)' })
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

  @Get(':id')
  @Roles(RoleEnum.SUP, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get territory by ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.findById(id, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Territory retrieved successfully',
    };
  }

  @Post()
  @Roles(RoleEnum.SUP)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new territory zone' })
  async create(@Body() data: any, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.create(data, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Territory created successfully',
    };
  }

  @Put(':id')
  @Roles(RoleEnum.SUP)
  @ApiOperation({ summary: 'Update territory' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: any, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.update(id, data, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Territory updated successfully',
    };
  }

  @Delete(':id')
  @Roles(RoleEnum.SUP)
  @ApiOperation({ summary: 'Delete territory (Soft-Delete & Cascade sector archiving)' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    await this.territoriesService.delete(id, tenantId);
    return {
      success: true,
      message: 'Territory deleted successfully',
    };
  }

  @Get(':id/geo-info')
  @Roles(RoleEnum.SUP, RoleEnum.ADMIN, RoleEnum.REP)
  @ApiOperation({ summary: 'Get territory geographic info' })
  async getTerritoryGeoInfo(@Param('id', ParseUUIDPipe) territoryId: string, @TenantId() tenantId: string) {
    const geoInfo = await this.territoriesService.getTerritoryGeoInfo(territoryId, tenantId);
    return {
      success: true,
      data: geoInfo,
      message: 'Geographic info retrieved successfully',
    };
  }

  // ==========================================
  // 🏢 ASSIGNATIONS DES ADMINISTRATEURS (ZONES)
  // ==========================================

  @Patch(':id/assign-admin')
  @Roles(RoleEnum.SUP)
  @ApiOperation({ summary: 'Assign admin to territory' })
  async assignAdmin(
    @Param('id', ParseUUIDPipe) territoryId: string, 
    @Body('adminId', ParseUUIDPipe) adminId: string,
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
  @Roles(RoleEnum.SUP)
  @ApiOperation({ summary: 'Reassign admin to territory (Atomic transaction)' })
  async reassignAdmin(
    @Param('id', ParseUUIDPipe) territoryId: string, 
    @Body('adminId', ParseUUIDPipe) adminId: string,
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
  @Roles(RoleEnum.SUP)
  @ApiOperation({ summary: 'Remove admin from territory' })
  async removeAdmin(@Param('id', ParseUUIDPipe) territoryId: string, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.removeAdmin(territoryId, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Admin removed successfully',
    };
  }

  @Get('admins/available')
  @Roles(RoleEnum.SUP)
  @ApiOperation({ summary: 'Get available admins' })
  async getAvailableAdmins(@TenantId() tenantId: string, @Query('excludeTerritoryId') excludeTerritoryId?: string) {
    const admins = await this.territoriesService.getAvailableAdmins(tenantId, excludeTerritoryId);
    return {
      success: true,
      data: admins,
      message: 'Available admins retrieved successfully',
    };
  }

  @Get('users/managers/list')
  @Roles(RoleEnum.SUP, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all managers' })
  async getManagers(@TenantId() tenantId: string) {
    const managers = await this.territoriesService.getManagers(tenantId);
    return {
      success: true,
      data: managers,
      message: 'Managers retrieved successfully',
    };
  }

  // ==========================================
  // 📍 GESTION DES SECTEURS ET DES VENDEURS (REPs)
  // ==========================================

  @Get('sectors')
  @Roles(RoleEnum.SUP, RoleEnum.ADMIN)
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
  @Roles(RoleEnum.SUP, RoleEnum.ADMIN, RoleEnum.REP)
  @ApiOperation({ summary: 'Get sector by ID' })
  async getSectorById(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    const sector = await this.territoriesService.getSectorById(id, tenantId);
    return {
      success: true,
      data: sector,
      message: 'Sector retrieved successfully',
    };
  }

  @Post('sectors')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new sector (Stricly limited to admin territory)' })
  async createSector(
    @Body() data: any, 
    @TenantId() tenantId: string,
    @GetUser('id') adminId: string // Récupération sécurisée du token utilisateur connecté
  ) {
    // On passe le vrai adminId pour valider qu'il détient les droits de création sur cette Zone
    const sector = await this.territoriesService.createSector({ ...data, adminId }, tenantId);
    return {
      success: true,
      data: sector,
      message: 'Sector created successfully',
    };
  }

  @Post('sectors/assign-vendor')
  @Roles(RoleEnum.ADMIN)
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

  @Patch('sectors/:id/reassign-vendor')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Reassign vendor to sector' })
  async reassignSectorVendor(
    @Param('id', ParseUUIDPipe) sectorId: string, 
    @Body('vendorId', ParseUUIDPipe) vendorId: string,
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
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Unassign vendor from sector' })
  async unassignSectorVendor(@Param('id', ParseUUIDPipe) sectorId: string, @TenantId() tenantId: string) {
    const territory = await this.territoriesService.unassignSectorVendor(sectorId, tenantId);
    return {
      success: true,
      data: territory,
      message: 'Vendor unassigned successfully',
    };
  }

  @Get('vendors/with-sectors')
  @Roles(RoleEnum.SUP, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get all vendors with sectors' })
  async getAllVendorsWithSectors(@TenantId() tenantId: string) {
    const vendors = await this.territoriesService.getAllVendorsWithSectors(tenantId);
    return {
      success: true,
      data: vendors,
      message: 'Vendors with sectors retrieved successfully',
    };
  }

  @Delete('vendors/:vendorId/sector')
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Remove sector from vendor' })
  async removeSectorFromVendor(@Param('vendorId', ParseUUIDPipe) vendorId: string, @TenantId() tenantId: string) {
    const result = await this.territoriesService.removeSectorFromVendor(vendorId, tenantId);
    return {
      success: true,
      data: result,
      message: 'Sector removed from vendor successfully',
    };
  }

  @Get('vendors/:vendorId/assigned-sector')
  @Roles(RoleEnum.ADMIN, RoleEnum.REP)
  @ApiOperation({ summary: 'Get vendor assigned sector' })
  async getVendorAssignedSector(@Param('vendorId', ParseUUIDPipe) vendorId: string, @TenantId() tenantId: string) {
    return await this.territoriesService.getVendorAssignedSector(vendorId, tenantId);
  }

  // ==========================================
  // 🛍️ ACTIONS DE MAILLAGE : POINTS DE VENTE (OUTLETS)
  // ==========================================

  @Post('sectors/assign-outlets')
  @Roles(RoleEnum.ADMIN)
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

  @Post('sectors/remove-outlets')
  @Roles(RoleEnum.ADMIN)
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
  @Roles(RoleEnum.ADMIN)
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

  @Get('vendors/:vendorId/outlets')
  @Roles(RoleEnum.ADMIN, RoleEnum.REP)
  @ApiOperation({ summary: 'Get vendor outlets' })
  async getVendorOutlets(@Param('vendorId', ParseUUIDPipe) vendorId: string, @TenantId() tenantId: string) {
    const result = await this.territoriesService.getVendorOutlets(vendorId, tenantId);
    return {
      success: true,
      data: result,
      message: 'Vendor outlets retrieved successfully',
    };
  }
}