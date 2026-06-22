import { Controller, Post, Body, Get, UseGuards, Param, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service'; 
import { TenantId } from '../common/decorators/tenant-id.decorator';

@ApiTags('RTM Dynamic Audits & Commando Workflows')
@Controller('dynamic-forms')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DynamicFormsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Créer un Workflow Commando / Formulaire No-Code (Admin)" })
  async createForm(@TenantId() tenantId: string, @Body() data: any) {
    return this.ordersService.createNoCodeForm(tenantId, data);
  }

  @Post(':id/targets')
  @ApiOperation({ summary: "Fixer les objectifs d'une activité commando par Agent" })
  async setWorkflowTargets(
    @Param('id') formId: string, 
    @Body() targetsDto: { userId: string; targetValue: number }[]
  ) {
    return this.ordersService.setWorkflowTargets(formId, targetsDto);
  }

  @Get(':id/foreign-options')
  @ApiOperation({ summary: "Récupérer les clés primaires d'un formulaire pour alimenter une liste déroulante (Clé Secondaire)" })
  async getForeignOptions(@Param('id') formId: string) {
    return this.ordersService.getForeignKeyOptions(formId);
  }

  @Get('analytics/cross-compare')
  @ApiOperation({ summary: "Générer un rapport Target vs Actual dynamique entre deux formulaires liés" })
  async getCrossAnalysis(
    @Query('targetFormId') targetFormId: string,
    @Query('actualFormId') actualFormId: string,
    @Query('targetFieldName') targetFieldName: string,
    @Query('actualFieldName') actualFieldName: string,
  ) {
    return this.ordersService.getCrossFormAnalytics(targetFormId, actualFormId, targetFieldName, actualFieldName);
  }

  @Get(':id/excel-template')
  @ApiOperation({ summary: "Générer la structure stricte du template Excel (xlsx) pour remplissage hors-système" })
  async getExcelTemplate(@Param('id') formId: string, @TenantId() tenantId: string) {
    return this.ordersService.generateExcelTemplateStructure(formId, tenantId);
  }

  @Post(':id/excel-import')
  @ApiOperation({ summary: "Importation stricte d'un fichier Excel avec validation des types et variables" })
  async importExcelData(@Param('id') formId: string, @Request() req, @Body() importDto: { rows: any[] }) {
    return this.ordersService.importExcelToWorkflow(formId, req.user.id, importDto.rows);
  }

  @Post('submissions')
  @ApiOperation({ summary: "Soumettre une ligne de performance Commando (Mobile ou Manuel)" })
  async submitAudit(@Request() req, @Body() data: { formId: string; outletId?: string; payload: any }) {
    return this.ordersService.submitNoCodeAudit({ ...data, userId: req.user.id });
  }

  @Get(':id/performance')
  @ApiOperation({ summary: "Suivre en temps réel l'atteinte des objectifs Commando par agent" })
  async getWorkflowPerformance(@Param('id') formId: string) {
    return this.ordersService.getWorkflowPerformance(formId);
  }

  @Get()
  @ApiOperation({ summary: "Récupérer les formulaires d'audit actifs pour le catalogue mobile" })
  async getForms(@TenantId() tenantId: string) {
    return this.ordersService.getNoCodeForms(tenantId);
  }
}