import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../common/types/prisma-types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {


        manager: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByMatricule(matricule: string) {
    return this.prisma.user.findUnique({
      where: { matricule },
    });
  }

  async findAll(filters?: { role?: UserRole; territoryId?: string; managerId?: string }) {
    const where: any = {};
    
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

  async getTeamMembers(managerId: string) {
    return this.prisma.user.findMany({
      where: {
        managerId,
        role: { in: [UserRole.REP, UserRole.ADMIN] },
      },
      include: {


      },
    });
  }

  async create(data: any) {
    // Check if email exists
    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if matricule exists
    const existingMatricule = await this.findByMatricule(data.matricule);
    if (existingMatricule) {
      throw new ConflictException('Matricule already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        hireDate: data.hireDate ? new Date(data.hireDate) : null,
      },
      include: {


        manager: true,
      },
    });
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

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

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
  }

  async getPerformance(id: string) {
    // TODO: Implement actual performance calculation
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

  async uploadPhoto(id: string, photoUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { photoUrl },
    });
  }

  async getManager(userId: string) {
    const user = await this.findById(userId);
    if (!user?.managerId) {
      return null;
    }

    return this.findById(user.managerId);
  }
}