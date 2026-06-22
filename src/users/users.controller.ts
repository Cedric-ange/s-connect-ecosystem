import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { TenantId } from '../common/decorators/tenant-id.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(
    @TenantId() tenantId: string,
    @Query('role') role?: string, 
    @Query('territoryId') territoryId?: string
  ) {
    const users = await this.usersService.findAll(tenantId, { role: role as any, territoryId });
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
  }

  @Get('team/all')
  @ApiOperation({ summary: 'Get team members' })
  async getTeamMembers(@Request() req, @TenantId() tenantId: string) {
    const users = await this.usersService.getTeamMembers(req.user.id, tenantId);
    return {
      success: true,
      data: users,
      message: 'Team members retrieved successfully',
    };
  }

  @Get('managers/list')
  @ApiOperation({ summary: 'Get all managers' })
  async getManagers(@TenantId() tenantId: string) {
    const users = await this.usersService.findAll(tenantId, { role: 'SUP' as any });
    return {
      success: true,
      data: users,
      message: 'Managers retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string, @TenantId() tenantId: string) {
    const user = await this.usersService.findById(id, tenantId);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  async create(@Body() userData: any, @TenantId() tenantId: string) {
    const user = await this.usersService.create(userData, tenantId);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() userData: any, @TenantId() tenantId: string) {
    const user = await this.usersService.update(id, userData, tenantId);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async delete(@Param('id') id: string, @TenantId() tenantId: string) {
    await this.usersService.delete(id, tenantId);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user status' })
  async toggleStatus(@Param('id') id: string, @TenantId() tenantId: string) {
    const user = await this.usersService.toggleStatus(id, tenantId);
    return {
      success: true,
      data: user,
      message: 'User status toggled successfully',
    };
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get user performance' })
  async getPerformance(@Param('id') id: string, @TenantId() tenantId: string) {
    const performance = await this.usersService.getPerformance(id, tenantId);
    return {
      success: true,
      data: performance,
      message: 'Performance retrieved successfully',
    };
  }

  @Post(':id/upload-photo')
  @ApiOperation({ summary: 'Upload user photo' })
  async uploadPhoto(@Param('id') id: string, @Body('photoUrl') photoUrl: string, @TenantId() tenantId: string) {
    const user = await this.usersService.uploadPhoto(id, photoUrl, tenantId);
    return {
      success: true,
      data: { photoUrl: user.photoUrl },
      message: 'Photo uploaded successfully',
    };
  }

  @Get(':id/manager')
  @ApiOperation({ summary: 'Get user manager' })
  async getManager(@Param('id') id: string, @TenantId() tenantId: string) {
    const manager = await this.usersService.getManager(id, tenantId);
    return {
      success: true,
      data: manager,
      message: 'Manager retrieved successfully',
    };
  }
}