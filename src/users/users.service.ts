import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/types/prisma-types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

async findById(id: string, tenantId?: string) {
    const where: any = { id };
    
    // 🎯 Si le tenantId est fourni, on applique la barrière multi-tenant strict
    if (tenantId) {
      where.tenantId = tenantId;
    }

    const user = await this.prisma.user.findFirst({
      where,
      include: {
        manager: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  async findByMatricule(matricule: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { matricule, tenantId },
    });
  }

  async findAll(tenantId: string, filters?: { role?: UserRole; territoryId?: string; managerId?: string }) {
    const where: any = { tenantId }; // 🎯 Isolation global obligatoire
    
    if (filters?.role) {
      where.role = filters.role;
    }
    
    if (filters?.territoryId) {
      where.territoryId = filters.territoryId;
    }
    
    if (filters?.managerId) {
      where.managerId = filters.managerId;
    }

    return this.prisma.user.findMany({
      where,
      include: {
        manager: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeamMembers(managerId: string, tenantId: string) {
    return this.prisma.user.findMany({
      where: {
        tenantId, // 🎯
        managerId,
        role: { in: [UserRole.REP, UserRole.ADMIN] },
      },
    });
  }

  async create(data: any, tenantId: string) {
    const existingEmail = await this.findByEmail(data.email, tenantId);
    if (existingEmail) {
      throw new ConflictException('Email already exists in your company');
    }

    const existingMatricule = await this.findByMatricule(data.matricule, tenantId);
    if (existingMatricule) {
      throw new ConflictException('Matricule already exists in your company');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        tenantId, // 🎯 Lien multi-tenant strict
        password: hashedPassword,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
      },
      include: {
        manager: true,
      },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    await this.findById(id, tenantId); // Garantit l'appartenance

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    delete data.tenantId; // Protection anti-fuite

    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      },
      include: {
        manager: true,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string, tenantId: string) {
    const user = await this.findById(id, tenantId);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  async getPerformance(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    // TODO: Connecter aux vrais calculs Orders/Visits filtrés par tenantId
    return {
      coverage: 85,
      strikeRate: 75,
      visitsThisMonth: 45,
      salesThisMonth: 150000,
      perfectStoreScore: 80,
      totalOutlets: 50,
      visitedOutlets: 42,
      ordersThisMonth: 35,
      averageOrderValue: 4285,
    };
  }

  async uploadPhoto(id: string, photoUrl: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.prisma.user.update({
      where: { id },
      data: { photoUrl },
    });
  }

  async getManager(userId: string, tenantId: string) {
    const user = await this.findById(userId, tenantId);
    if (!user?.managerId) {
      return null;
    }
    return this.findById(user.managerId, tenantId);
  }
}