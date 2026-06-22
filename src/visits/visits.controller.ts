import { Controller, Post, Body, Get, UseGuards, Request, Param, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { TenantId } from '../common/decorators/tenant-id.decorator'; // 🎯 Import essentiel

@ApiTags('Visits')
@Controller('visits')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new visit' })
  async create(
    @Request() req, 
    @Body() createVisitDto: CreateVisitDto, 
    @TenantId() tenantId: string
  ) {
    return this.visitsService.create(req.user.id, createVisitDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all visits for current user' })
  async findAll(@Request() req, @TenantId() tenantId: string) {
    return this.visitsService.findAll(req.user.id, tenantId);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's visits for current user" })
  async getTodaysVisits(@Request() req, @TenantId() tenantId: string) {
    return this.visitsService.getTodaysVisits(req.user.id, tenantId);
  }

  @Get('outlet/:outletId')
  @ApiOperation({ summary: 'Get visits by outlet' })
  async getVisitsByOutlet(
    @Param('outletId') outletId: string,
    @Request() req,
    @TenantId() tenantId: string
  ) {
    return this.visitsService.getVisitsByOutlet(outletId, req.user.id, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific visit by ID' })
  async findOne(
    @Param('id') id: string, 
    @Request() req, 
    @TenantId() tenantId: string
  ) {
    return this.visitsService.findOne(id, req.user.id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a visit' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateVisitDto: UpdateVisitDto,
    @TenantId() tenantId: string
  ) {
    return this.visitsService.update(id, req.user.id, updateVisitDto, tenantId);
  }

  @Post(':id/checkin')
  @ApiOperation({ summary: 'Check-in to a visit' })
  async checkin(
    @Param('id') id: string,
    @Request() req,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
    @TenantId() tenantId: string
  ) {
    return this.visitsService.checkin(id, req.user.id, lat, lng, tenantId);
  }

  @Post(':id/checkout')
  @ApiOperation({ summary: 'Check-out from a visit' })
  async checkout(
    @Param('id') id: string,
    @Request() req,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
    @TenantId() tenantId: string
  ) {
    return this.visitsService.checkout(id, req.user.id, lat, lng, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a visit' })
  async remove(
    @Param('id') id: string, 
    @Request() req, 
    @TenantId() tenantId: string
  ) {
    return this.visitsService.remove(id, req.user.id, tenantId);
  }
}