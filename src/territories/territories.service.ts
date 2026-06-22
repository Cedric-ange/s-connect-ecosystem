import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TerritoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, filters?: { level?: string; parentId?: string }) {
    const where: any = { tenantId }; // 🎯 Isolation Multi-Tenant
    
    if (filters?.level) {
      where.level = filters.level;
    }
    
    if (filters?.parentId) {
      where.parentId = filters.parentId;
    }

    return this.prisma.territory.findMany({
      where,
      include: {
        parent: true,
        children: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllSectors(tenantId: string, filters?: { level?: string }) {
    const where: any = { tenantId, level: 'SECTEUR' };
    
    if (filters?.level) {
      where.level = filters.level;
    }

    return this.prisma.territory.findMany({
      where,
      include: {
        parent: true,
        outlets: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const territory = await this.prisma.territory.findFirst({
      where: { id, tenantId }, // 🎯 Vérification stricte
      include: {
        parent: true,
        children: true,
        outlets: true,
      },
    });

    if (!territory) {
      throw new NotFoundException('Territory not found within your organization');
    }

    return territory;
  }

  async getSectorById(id: string, tenantId: string) {
    return this.findById(id, tenantId);
  }

  async create(data: any, tenantId: string) {
    // Le code doit être unique au sein du même tenant
    const existing = await this.prisma.territory.findFirst({
      where: { code: data.code, tenantId },
    });

    if (existing) {
      throw new ConflictException('Territory code already exists for your company');
    }

    return this.prisma.territory.create({
      data: {
        ...data,
        tenantId, // 🎯 Ancre multi-tenant forcée
      },
      include: {
        parent: true,
      },
    });
  }

  async createSector(data: any, tenantId: string) {
    data.level = 'SECTEUR';
    return this.create(data, tenantId);
  }

  async update(id: string, data: any, tenantId: string) {
    const territory = await this.findById(id, tenantId);

    if (data.code && data.code !== territory.code) {
      const existing = await this.prisma.territory.findFirst({
        where: { code: data.code, tenantId },
      });

      if (existing) {
        throw new ConflictException('Territory code already exists for your company');
      }
    }

    delete data.tenantId;

    return this.prisma.territory.update({
      where: { id },
      data,
      include: {
        parent: true,
      },
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);

    const childrenCount = await this.prisma.territory.count({
      where: { parentId: id, tenantId },
    });

    if (childrenCount > 0) {
      throw new ConflictException('Cannot delete territory with child territories');
    }

    return this.prisma.territory.delete({
      where: { id },
    });
  }

  async assignOutletsToSector(data: { sectorId: string; outletIds: string[] }, tenantId: string) {
    await this.getSectorById(data.sectorId, tenantId);

    const outlets = await this.prisma.outlet.findMany({
      where: { id: { in: data.outletIds }, tenantId },
    });

    if (outlets.length !== data.outletIds.length) {
      throw new NotFoundException('Some outlets were not found in your organization');
    }

    await this.prisma.outlet.updateMany({
      where: { id: { in: data.outletIds }, tenantId },
      data: { sectorId: data.sectorId },
    });

    return this.getSectorById(data.sectorId, tenantId);
  }

  async assignSectorToVendor(data: { vendorId: string; sectorId: string }, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: data.vendorId, tenantId },
    });

    if (!user) {
      throw new NotFoundException('User not found in your company context');
    }

    const sector = await this.getSectorById(data.sectorId, tenantId);

    return this.prisma.user.update({
      where: { id: data.vendorId },
      data: {
        assignedSectorId: data.sectorId,
        territoryId: sector.parentId,
      },
    });
  }

  async getVendorOutlets(vendorId: string, tenantId: string) {
    const vendor = await this.prisma.user.findFirst({
      where: { id: vendorId, tenantId },
      include: {
        manager: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found in your company context');
    }

    let sector: any = null;
    let outlets = [];

    if (vendor.assignedSectorId) {
      sector = await this.prisma.territory.findFirst({
        where: { id: vendor.assignedSectorId, tenantId },
        include: {
          outlets: true,
        },
      });
      outlets = sector?.outlets || [];
    }

    return {
      vendor: {
        id: vendor.id,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        email: vendor.email,
        role: vendor.role,
      },
      sector,
      outlets,
    };
  }

  async getManagers(tenantId: string) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['MANAGER', 'ADMIN'] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        photoUrl: true,
      },
    });
  }

  async getAvailableAdmins(tenantId: string, excludeTerritoryId?: string) {
    const where: any = {
      tenantId,
      role: 'ADMIN',
      isActive: true,
    };

    if (excludeTerritoryId) {
      where.territoryId = { not: excludeTerritoryId };
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
  }

  async assignAdmin(territoryId: string, adminId: string, tenantId: string) {
    await this.findById(territoryId, tenantId);
    
    const admin = await this.prisma.user.findFirst({
      where: { id: adminId, tenantId, role: 'ADMIN' },
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found in your company context');
    }

    return this.prisma.territory.update({
      where: { id: territoryId },
      data: { adminId },
    });
  }

  async reassignAdmin(territoryId: string, adminId: string, tenantId: string) {
    return this.assignAdmin(territoryId, adminId, tenantId);
  }

  async removeAdmin(territoryId: string, tenantId: string) {
    await this.findById(territoryId, tenantId);
    return this.prisma.territory.update({
      where: { id: territoryId },
      data: { adminId: null },
    });
  }

  async reassignSectorVendor(sectorId: string, vendorId: string, tenantId: string) {
    return this.assignSectorToVendor({ vendorId, sectorId }, tenantId);
  }

  async unassignSectorVendor(sectorId: string, tenantId: string) {
    const sector = await this.getSectorById(sectorId, tenantId);

    await this.prisma.user.updateMany({
      where: { assignedSectorId: sectorId, tenantId },
      data: { assignedSectorId: null },
    });

    return sector;
  }

  async getAllVendorsWithSectors(tenantId: string) {
    const vendors = await this.prisma.user.findMany({
      where: {
        tenantId,
        role: 'REP',
        isActive: true,
      },
      include: {
        manager: true,
      },
    });

    return Promise.all(
      vendors.map(async (vendor) => {
        let assignedSector: any = null;
        if (vendor.assignedSectorId) {
          assignedSector = await this.prisma.territory.findFirst({
            where: { id: vendor.assignedSectorId, tenantId },
            include: {
              outlets: true,
            },
          });
        }

        return {
          ...vendor,
          assignedSector,
        };
      })
    );
  }

  async getTerritoryGeoInfo(territoryId: string, tenantId: string) {
    const territory = await this.findById(territoryId, tenantId);

    // Extraction sécurisée si ce sont des chaînes stockées sous format JSON ou texte
    const parseGeoField = (field: string | null) => {
      if (!field) return [];
      try {
        return JSON.parse(field);
      } catch {
        return field.split(',').map(s => s.trim());
      }
    };

    return {
      regions: parseGeoField(territory.regions),
      communes: parseGeoField(territory.communes),
      villes: parseGeoField(territory.villes),
      quartiers: parseGeoField(territory.quartiers),
      codesPostaux: parseGeoField(territory.codesPostaux),
    };
  }

  async removeOutletsFromSector(data: { sectorId: string; outletIds: string[] }, tenantId: string) {
    await this.getSectorById(data.sectorId, tenantId);

    await this.prisma.outlet.updateMany({
      where: {
        id: { in: data.outletIds },
        sectorId: data.sectorId,
        tenantId,
      },
      data: { sectorId: null },
    });

    return {
      success: true,
      removedCount: data.outletIds.length,
      message: `${data.outletIds.length} outlets removed from sector`,
    };
  }

  async assignOutletsToVendor(data: { vendorId: string; outletIds: string[] }, tenantId: string) {
    const vendor = await this.prisma.user.findFirst({
      where: { id: data.vendorId, tenantId },
    });

    if (!vendor || !vendor.assignedSectorId) {
      throw new NotFoundException('Vendor or sector association missing');
    }

    return this.assignOutletsToSector({
      sectorId: vendor.assignedSectorId,
      outletIds: data.outletIds,
    }, tenantId);
  }

  async removeSectorFromVendor(vendorId: string, tenantId: string) {
    const vendor = await this.prisma.user.findFirst({
      where: { id: vendorId, tenantId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    await this.prisma.user.update({
      where: { id: vendorId },
      data: { assignedSectorId: null },
    });

    return {
      success: true,
      message: 'Vendor removed from sector mapping',
    };
  }

  async getVendorAssignedSector(vendorId: string, tenantId: string) {
    const vendor = await this.prisma.user.findFirst({
      where: { id: vendorId, tenantId },
      select: {
        assignedSectorId: true,
      },
    });

    if (!vendor || !vendor.assignedSectorId) {
      return null;
    }

    return this.prisma.territory.findFirst({
      where: { id: vendor.assignedSectorId, tenantId },
      include: {
        parent: true,
        outlets: true,
      },
    });
  }
}