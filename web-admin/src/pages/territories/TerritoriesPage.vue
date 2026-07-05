import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajuste le chemin selon ton projet
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { AssignAdminDto } from './dto/assign-admin.dto';
import { CreateSectorDto } from './dto/create-sector.dto';
import { RoleEnum } from '../users/enums/role.enum'; // Ajuste le chemin selon tes enums

@Injectable()
export class TerritoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * FLUX 1 : Création d'une ZONE (Réservé au Superviseur SUP)
   */
  async createZone(dto: CreateTerritoryDto) {
    return this.prisma.territory.create({
      data: {
        name: dto.name,
        type: 'ZONE',
        potential: dto.potential || 0,
        // Si un adminId est fourni dès le départ, on le lie
        ...(dto.adminId && { adminId: dto.adminId }),
      },
    });
  }

  /**
   * FLUX 1.2 : Assignation d'un ADMIN à une ZONE (Opération Atomique)
   * Règle critique : Un ADMIN ne peut gérer qu'UN SEUL territoire à la fois.
   */
  async assignAdminToZone(zoneId: string, dto: AssignAdminDto) {
    // 1. Vérifier que la zone existe bien
    const zone = await this.prisma.territory.findUnique({ where: { id: zoneId } });
    if (!zone || zone.type !== 'ZONE') {
      throw new NotFoundException("La zone spécifiée n'existe pas.");
    }

    // 2. Vérifier que l'utilisateur est bien un ADMIN
    const user = await this.prisma.user.findUnique({ where: { id: dto.adminId } });
    if (!user || user.role !== RoleEnum.ADMIN) {
      throw new BadRequestException("L'utilisateur sélectionné doit posséder le rôle ADMIN.");
    }

    // 3. Règle Métier : Vérifier si cet ADMIN gère déjà une autre zone
    const existingZone = await this.prisma.territory.findFirst({
      where: { adminId: dto.adminId, NOT: { id: zoneId } },
    });
    if (existingZone) {
      throw new BadRequestException(`Cet administrateur gère déjà une autre zone (${existingZone.name}).`);
    }

    // 4. TRANSACTION ATOMIQUE : Assigner l'ADMIN et mettre à jour la hiérarchie managériale des REPs
    return this.prisma.$transaction(async (tx) => {
      // Étape A : Mettre à jour la Zone avec le nouvel adminId
      const updatedZone = await tx.territory.update({
        where: { id: zoneId },
        data: { adminId: dto.adminId },
      });

      // Étape B : Mettre à jour le managerId de tous les REPs travaillant dans les secteurs de cette zone
      const sectors = await tx.territory.findMany({ where: { parentId: zoneId } });
      const sectorIds = sectors.map((s) => s.id);

      if (sectorIds.length > 0) {
        await tx.user.updateMany({
          where: {
            role: RoleEnum.REP,
            assignedSectorId: { in: sectorIds },
          },
          data: {
            managerId: dto.adminId, // Le nouvel ADMIN devient le manager direct des REPs
          },
        });
      }

      // Étape C : Log d'audit
      await tx.auditLog.create({
        data: {
          action: 'ASSIGN_ZONE_ADMIN',
          details: `Admin ${dto.adminId} assigné à la zone ${zone.name}`,
        },
      });

      return updatedZone;
    });
  }

  /**
   * FLUX 2 : Création de SECTEUR par un ADMIN
   * Règle critique : Un ADMIN ne peut créer des secteurs que dans SA zone.
   */
  async createSector(adminId: string, dto: CreateSectorDto) {
    // 1. Trouver la zone gérée par cet ADMIN
    const managedZone = await this.prisma.territory.findFirst({
      where: { adminId: adminId, type: 'ZONE' },
    });

    if (!managedZone) {
      throw new ForbiddenException("Vous ne gérez aucun territoire. Impossible de créer un secteur.");
    }

    // 2. Sécurité : S'assurer que le parentId spécifié est bien la zone de l'ADMIN
    if (dto.parentId !== managedZone.id) {
      throw new ForbiddenException("Règle Métier : Vous ne pouvez créer un secteur que dans la ZONE qui vous est assignée.");
    }

    // 3. Création du Secteur opérationnel
    return this.prisma.territory.create({
      data: {
        name: dto.name,
        type: 'SECTEUR',
        parentId: managedZone.id,
      },
    });
  }

  /**
   * Soft-Delete / Archivage en Cascade d'une ZONE (Évolutions futures Sprint actuel)
   */
  async archiveZone(zoneId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Archiver ou détacher tous les secteurs enfants
      await tx.territory.updateMany({
        where: { parentId: zoneId },
        data: { status: 'ARCHIVED' }, // En considérant qu'une colonne status existe
      });

      // 2. Archiver la zone parente
      return tx.territory.update({
        where: { id: zoneId },
        data: { status: 'ARCHIVED', adminId: null },
      });
    });
  }
}