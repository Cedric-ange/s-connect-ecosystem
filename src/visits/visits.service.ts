import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto, VisitStatus } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createVisitDto: CreateVisitDto, tenantId: string) {
    const { outletId, plannedDate, notes, status } = createVisitDto;

    // 🛡️ Vérifier que l'outlet existe ET appartient au même Tenant
    const outlet = await this.prisma.outlet.findFirst({
      where: { 
        id: outletId,
        tenantId: tenantId,
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found in this organization');
    }

    // 🏢 Créer la visite liée de force au bon Tenant
    return this.prisma.visit.create({
      data: {
        outletId,
        userId,
        tenantId, // 🔑 Application de la clé d'isolation obligatoire !
        plannedDate: plannedDate ? new Date(plannedDate) : undefined,
        notes,
        status: status || VisitStatus.PLANNED,
      },
      include: {
        outlet: true,
        user: true,
      },
    });
  }

  async findAll(userId: string, tenantId: string) {
    // 🛡️ Filtre strict par utilisateur ET par organisation
    return this.prisma.visit.findMany({
      where: { 
        userId,
        tenantId,
      },
      include: {
        outlet: true,
        orders: true,
        merchChecks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string, tenantId: string) {
    // 🛡️ Recherche incluant de base le tenantId pour l'étanchéité
    const visit = await this.prisma.visit.findFirst({
      where: { 
        id,
        tenantId,
      },
      include: {
        outlet: true,
        user: true,
        orders: true,
        merchChecks: true,
      },
    });

    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (visit.userId !== userId) {
      throw new ForbiddenException('You can only access your own visits');
    }

    return visit;
  }

  async update(id: string, userId: string, updateVisitDto: UpdateVisitDto, tenantId: string) {
    // Vérifier la présence de la visite au sein de l'organisation
    await this.findOne(id, userId, tenantId);

    return this.prisma.visit.update({
      where: { id },
      data: {
        ...updateVisitDto,
        checkinAt: updateVisitDto.checkinAt ? new Date(updateVisitDto.checkinAt) : undefined,
        checkoutAt: updateVisitDto.checkoutAt ? new Date(updateVisitDto.checkoutAt) : undefined,
        plannedDate: updateVisitDto.plannedDate ? new Date(updateVisitDto.plannedDate) : undefined,
      },
      include: {
        outlet: true,
        orders: true,
        merchChecks: true,
      },
    });
  }

  async remove(id: string, userId: string, tenantId: string) {
    // Vérifier la présence de la visite au sein de l'organisation
    await this.findOne(id, userId, tenantId);

    return this.prisma.visit.delete({
      where: { id },
    });
  }

  async checkin(id: string, userId: string, lat: number, lng: number, tenantId: string) {
    await this.findOne(id, userId, tenantId);

    return this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.IN_PROGRESS,
        checkinAt: new Date(),
        checkinLat: lat,
        checkinLng: lng,
      },
    });
  }

  async checkout(id: string, userId: string, lat: number, lng: number, tenantId: string) {
    const visit = await this.findOne(id, userId, tenantId);

    const duration = visit.checkinAt
      ? Math.floor((new Date().getTime() - new Date(visit.checkinAt).getTime()) / 60000)
      : null;

    return this.prisma.visit.update({
      where: { id },
      data: {
        status: VisitStatus.COMPLETED,
        checkoutAt: new Date(),
        checkoutLat: lat,
        checkoutLng: lng,
        durationMin: duration,
      },
    });
  }

  async getVisitsByOutlet(outletId: string, userId: string, tenantId: string) {
    return this.prisma.visit.findMany({
      where: {
        outletId,
        userId,
        tenantId, // Isolation globale de la requête
      },
      include: {
        outlet: true,
        orders: true,
        merchChecks: true,
      },
      orderBy: {
        plannedDate: 'desc',
      },
    });
  }

  async getTodaysVisits(userId: string, tenantId: string) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    return this.prisma.visit.findMany({
      where: {
        userId,
        tenantId, // Isolation globale de la requête
        plannedDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        outlet: true,
      },
      orderBy: {
        plannedDate: 'asc',
      },
    });
  }
}