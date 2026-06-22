import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TerritoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { level?: string; parentId?: string }) {
    const where: any = {};
    
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

  async findAllSectors(filters?: { level?: string }) {
    const where: any = { level: 'SECTEUR' };
    
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

  async findById(id: string) {
    const territory = await this.prisma.territory.findUnique({
      where: { id },
      include: {
        parent: true,

        children: true,
        outlets: true,
      },
    });

    if (!territory) {
      throw new NotFoundException('Territory not found');
    }

    return territory;
  }

  async getSectorById(id: string) {
    return this.findById(id);
  }

  async create(data: any) {
    // Check if code exists
    const existing = await this.prisma.territory.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('Territory code already exists');
    }

    return this.prisma.territory.create({
      data,
      include: {
        parent: true,

      },
    });
  }

  async createSector(data: any) {
    data.level = 'SECTEUR';
    return this.create(data);
  }

  async update(id: string, data: any) {
    const territory = await this.findById(id);

    if (data.code && data.code !== territory.code) {
      const existing = await this.prisma.territory.findUnique({
        where: { code: data.code },
      });

      if (existing) {
        throw new ConflictException('Territory code already exists');
      }
    }

    return this.prisma.territory.update({
      where: { id },
      data,
      include: {
        parent: true,

      },
    });
  }

  async delete(id: string) {
    const territory = await this.findById(id);

    // Check if territory has children
    const childrenCount = await this.prisma.territory.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new ConflictException('Cannot delete territory with child territories');
    }

    return this.prisma.territory.delete({
      where: { id },
    });
  }

  async assignOutletsToSector(data: { sectorId: string; outletIds: string[] }) {
    const sector = await this.getSectorById(data.sectorId);

    const outlets = await this.prisma.outlet.findMany({
      where: { id: { in: data.outletIds } },
    });

    if (outlets.length !== data.outletIds.length) {
      throw new NotFoundException('Some outlets not found');
    }

    // Update all outlets with the sector ID
    await this.prisma.outlet.updateMany({
      where: { id: { in: data.outletIds } },
      data: { sectorId: data.sectorId },
    });

    return this.getSectorById(data.sectorId);
  }

  async assignSectorToVendor(data: { vendorId: string; sectorId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.vendorId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const sector = await this.getSectorById(data.sectorId);

    return this.prisma.user.update({
      where: { id: data.vendorId },
      data: {
        assignedSectorId: data.sectorId,
        territoryId: sector.parentId,
      },
    });
  }

  async getVendorOutlets(vendorId: string) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: vendorId },
      include: {
        manager: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Récupérer le secteur assigné si assignedSectorId existe
    let sector: any = null; // Corrigé
    let outlets = [];
    if (vendor.assignedSectorId) {
      sector = await this.prisma.territory.findUnique({
        where: { id: vendor.assignedSectorId },
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

  async getManagers() {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['SUP', 'ADMIN'] },
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

  async getAvailableAdmins(excludeTerritoryId?: string) {
    const where: any = {
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

  async assignAdmin(territoryId: string, adminId: string) {
    const territory = await this.findById(territoryId);
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.role !== 'ADMIN') {
      throw new NotFoundException('Admin not found');
    }

    return this.prisma.territory.update({
      where: { id: territoryId },
      data: { adminId },
    });
  }

  async reassignAdmin(territoryId: string, adminId: string) {
    return this.assignAdmin(territoryId, adminId);
  }

  async removeAdmin(territoryId: string) {
    return this.prisma.territory.update({
      where: { id: territoryId },
      data: { adminId: null },
    });
  }

  async reassignSectorVendor(sectorId: string, vendorId: string) {
    return this.assignSectorToVendor({ vendorId, sectorId });
  }

  async unassignSectorVendor(sectorId: string) {
    const sector = await this.getSectorById(sectorId);

    if (!sector) {
      throw new NotFoundException('Sector not found');
    }

    // Find all vendors assigned to this sector and unassign them
    await this.prisma.user.updateMany({
      where: { assignedSectorId: sectorId },
      data: { assignedSectorId: null },
    });

    return sector;
  }

  async getAllVendorsWithSectors() {
    const vendors = await this.prisma.user.findMany({
      where: {
        role: 'REP',
        isActive: true,
      },
      include: {
        manager: true,
      },
    });

    // Pour chaque vendor, récupérer son secteur si assignedSectorId existe
    const vendorsWithSectors = await Promise.all(
      vendors.map(async (vendor) => {
        let assignedSector: any = null;
        if (vendor.assignedSectorId) {
          assignedSector = await this.prisma.territory.findUnique({
            where: { id: vendor.assignedSectorId },
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

    return vendorsWithSectors;
  }

  async getTerritoryGeoInfo(territoryId: string) {
    const territory = await this.findById(territoryId);

    return {
      regions: territory.regions || [],
      communes: territory.communes || [],
      villes: territory.villes || [],
      quartiers: territory.quartiers || [],
      codesPostaux: territory.codesPostaux || [],
    };
  }

  async removeOutletsFromSector(data: { sectorId: string; outletIds: string[] }) {
    const sector = await this.getSectorById(data.sectorId);

    await this.prisma.outlet.updateMany({
      where: {
        id: { in: data.outletIds },
        sectorId: data.sectorId,
      },
      data: { sectorId: null },
    });

    return {
      success: true,
      removedCount: data.outletIds.length,
      message: `${data.outletIds.length} outlets removed from sector`,
    };
  }

  async assignOutletsToVendor(data: { vendorId: string; outletIds: string[] }) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: data.vendorId },
    });

    if (!vendor || !vendor.assignedSectorId) {
      throw new NotFoundException('Vendor or sector not found');
    }

    return this.assignOutletsToSector({
      sectorId: vendor.assignedSectorId,
      outletIds: data.outletIds,
    });
  }

  async removeSectorFromVendor(vendorId: string) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    const sectorId = vendor.assignedSectorId;

    await this.prisma.user.update({
      where: { id: vendorId },
      data: { assignedSectorId: null },
    });

    return {
      success: true,
      message: 'Vendor removed from sector',
    };
  }

  async getVendorAssignedSector(vendorId: string) {
    const vendor = await this.prisma.user.findUnique({
      where: { id: vendorId },
      select: {
        assignedSectorId: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (!vendor.assignedSectorId) {
      return null;
    }

    // Récupérer le secteur avec ses détails
    const sector = await this.prisma.territory.findUnique({
      where: { id: vendor.assignedSectorId },
      include: {
        parent: true,
        outlets: true,
      },
    });

    return sector;
  }
}