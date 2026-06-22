import { Controller, Post, Body, Get, UseGuards, Request, Param, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { Query } from '@nestjs/common';

@ApiTags('Orders & Sales')
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Enregistrer une vente terrain (Direct-Van ou Pre-selling)' })
  async create(
    @Request() req,
    @TenantId() tenantId: string,
    @Body() createOrderDto: any,
  ) {
    if (!createOrderDto.visitId) {
      throw new BadRequestException("Une commande terrain doit obligatoirement être rattachée à une visite active.");
    }
    return this.ordersService.createOrderFromVan(req.user.id, tenantId, createOrderDto);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Générer les données et la structure du reçu PDF (Vente ou Pré-commande)' })
  async getReceiptData(@Param('id') id: string, @Request() req, @TenantId() tenantId: string) {
    return this.ordersService.generateOrderReceipt(id, req.user.id, tenantId);
  }

  @Get('kpis/rtm')
  @ApiOperation({ summary: 'Calculer les KPIs RTM et l\'état de l\'inventaire valorisé' })
  async getRtmKpis(@Request() req, @TenantId() tenantId: string) {
    return this.ordersService.calculateRtmKpis(req.user.id, tenantId);
  }

  @Post('van/chargement')
  @ApiOperation({ summary: "Accuser réception ou valider le chargement d'un Van depuis le KD" })
  async loadVan(
    @Request() req,
    @TenantId() tenantId: string,
    @Body() loadingDto: {
      items: Array<{ skuId: string; quantity: number }>;
    },
  ) {
    return this.ordersService.loadVendorVan(req.user.id, tenantId, loadingDto.items);
  }
@Post('admin/onboard-tenant')
  @ApiOperation({ summary: "Route de test industriel : Provisionner un nouveau Tenant et son Admin" })
  async testTenantOnboarding(
    @Body() body: { 
      tenantData: { companyName: string; industry: string; logoUrl?: string }; 
      adminData: any 
    }
  ) {
    return this.ordersService.provisionNewTenant(body.tenantData, body.adminData);
  }
@Post('rtm/targets')
  @ApiOperation({ summary: 'Fixer les objectifs commerciaux RTM standards' })
  async createRtmTarget(@TenantId() tenantId: string, @Body() data: any) {
    return this.ordersService.upsertRtmTarget(tenantId, data);
  }

  @Post('van/signature-load')
  @ApiOperation({ summary: 'Validation logistique double signature KD -> Camion' })
  async signatureLoadVan(@TenantId() tenantId: string, @Body() body: any) {
    return this.ordersService.acknowledgeAndSignStock(body.vendeurId, tenantId, body);
  }

  @Get('rtm/performance-consolidated')
  @ApiOperation({ summary: 'Calculer la performance consolidée multiniveau' })
  async getRtmPerformance(
    @TenantId() tenantId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('filterType') filterType: 'GLOBAL' | 'SUPERVISOR' | 'TERRITORY',
    @Query('referenceId') referenceId?: string,
  ) {
    return this.ordersService.getRtmPerformanceConsolidated(
      tenantId,
      Number(month),
      Number(year),
      filterType,
      referenceId,
    );
  }
}