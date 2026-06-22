import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OutletsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    tenantId: string,
    filters?: {
      status?: string;
      territoryId?: string;
      channel?: string;
      proposedBy?: string;
    },
  ) {
    const where: any = { tenantId }; // 🎯 Filtre obligatoire global

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.territoryId) {
      where.territoryId = filters.territoryId;
    }

    if (filters?.channel) {
      where.channel = filters.channel;
    }

    if (filters?.proposedBy) {
      where.proposedBy = filters.proposedBy;
    }

    return this.prisma.outlet.findMany({
      where,
      include: {
        territory: true,
        proposer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyTerritoryOutlets(
    tenantId: string,
    filters?: {
      status?: string;
      channel?: string;
    },
  ) {
    const where: any = { tenantId }; // 🎯 Isolation multi-tenant assurée

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.channel) {
      where.channel = filters.channel;
    }

    return this.prisma.outlet.findMany({
      where,
      include: {
        territory: true,
        proposer: true,
        validator: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    // Utilisez findFirst pour garantir que l'élément appartienne bien au bon tenant
    const outlet = await this.prisma.outlet.findFirst({
      where: { id, tenantId },
      include: {
        territory: true,
        proposer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        validator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found within this tenant organization');
    }

    return outlet;
  }

  async create(data: any, tenantId: string, userId: string) {
    // Le code doit être unique au sein du même tenant
    const existingCode = await this.prisma.outlet.findFirst({
      where: { code: data.code, tenantId },
    });

    if (existingCode) {
      throw new ConflictException('Outlet code already exists for your company');
    }

    return this.prisma.outlet.create({
      data: {
        ...data,
        tenantId, // 🎯 Ancre multi-tenant forcée
        proposedBy: data.proposedBy || userId, // 👥 Proposer automatique si non défini
        status: data.status || 'PENDING',
      },
      include: {
        territory: true,
        proposer: true,
      },
    });
  }

  async update(id: string, data: any, tenantId: string) {
    const outlet = await this.findById(id, tenantId);

    if (data.code && data.code !== outlet.code) {
      const existingCode = await this.prisma.outlet.findFirst({
        where: { code: data.code, tenantId },
      });

      if (existingCode) {
        throw new ConflictException('Outlet code already exists for your company');
      }
    }

    // On évite d'altérer par mégarde le tenant lors d'une modification
    delete data.tenantId;

    return this.prisma.outlet.update({
      where: { id },
      data,
      include: {
        territory: true,
        proposer: true,
        validator: true,
      },
    });
  }

  async approve(id: string, tenantId: string, userId: string) {
    const outlet = await this.findById(id, tenantId);

    if (outlet.status !== 'PENDING') {
      throw new ConflictException('Outlet can only be approved when pending');
    }

    return this.prisma.outlet.update({
      where: { id },
      data: {
        status: 'APPROVED',
        validatedBy: userId,
        validatedAt: new Date(),
      },
    });
  }

  async reject(id: string, reason: string | undefined, tenantId: string, userId: string) {
    const outlet = await this.findById(id, tenantId);

    if (outlet.status !== 'PENDING') {
      throw new ConflictException('Outlet can only be rejected when pending');
    }

    return this.prisma.outlet.update({
      where: { id },
      data: {
        status: 'REJECTED',
        validatedBy: userId,
        validatedAt: new Date(),
        validationComment: reason,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);

    // Vérifier les dépendances liées
    const ordersCount = await this.prisma.order.count({
      where: { outletId: id, tenantId },
    });

    const visitsCount = await this.prisma.visit.count({
      where: { outletId: id, tenantId },
    });

    if (ordersCount > 0 || visitsCount > 0) {
      throw new ConflictException('Cannot delete outlet with associated orders or visits');
    }

    return this.prisma.outlet.delete({
      where: { id },
    });
  }

  async getStats(
    tenantId: string,
    filters?: {
      territoryId?: string;
      proposedBy?: string;
    },
  ) {
    const where: any = { tenantId };

    if (filters?.territoryId) {
      where.territoryId = filters.territoryId;
    }

    if (filters?.proposedBy) {
      where.proposedBy = filters.proposedBy;
    }

    const total = await this.prisma.outlet.count({ where });
    const pending = await this.prisma.outlet.count({
      where: { ...where, status: 'PENDING' },
    });
    const approved = await this.prisma.outlet.count({
      where: { ...where, status: 'APPROVED' },
    });
    const rejected = await this.prisma.outlet.count({
      where: { ...where, status: 'REJECTED' },
    });
    const inactive = await this.prisma.outlet.count({
      where: { ...where, status: 'INACTIVE' },
    });

    return {
      total,
      pending,
      approved,
      rejected,
      inactive,
    };
  }
}