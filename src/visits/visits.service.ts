import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitDto, VisitStatus } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  // 📐 Formule de Haversine pour calculer la distance exacte en mètres entre deux points GPS
  private getDistanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async create(userId: string, createVisitDto: CreateVisitDto, tenantId: string) {
    const { outletId, plannedDate, notes, status } = createVisitDto;

    const outlet = await this.prisma.outlet.findFirst({
      where: { 
        id: outletId,
        tenantId: tenantId,
      },
    });

    if (!outlet) {
      throw new NotFoundException('Outlet not found in this organization');
    }

    return this.prisma.visit.create({
      data: {
        outletId,
        userId,
        tenantId,
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

    if (visit.userId !== userId) {
      throw new ForbiddenException('You can only access your own visits');
    }

    return visit;
  }

  async update(id: string, userId: string, updateVisitDto: UpdateVisitDto, tenantId: string) {
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
    await this.findOne(id, userId, tenantId);

    return this.prisma.visit.delete({
      where: { id },
    });
  }

  async checkin(id: string, userId: string, lat: number, lng: number, tenantId: string) {
    // 1. Récupérer la visite et valider la propriété/l'existence
    const visit = await this.findOne(id, userId, tenantId);

    // 2. S'assurer que le point de vente possède des coordonnées GPS valides
    if (visit.outlet.lat === null || visit.outlet.lng === null) {
      throw new BadRequestException("Le point de vente n'a pas de coordonnées GPS configurées.");
    }

    // 3. Bloquer si le mobile n'envoie pas de coordonnées valides
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      throw new BadRequestException("Coordonnées GPS de l'appareil manquantes pour le Check-in.");
    }

    // 4. Calculer l'écart métrique réel entre le vendeur et la boutique
    const distance = this.getDistanceInMeters(lat, lng, visit.outlet.lat, visit.outlet.lng);
    const RAYON_MAX_METRES = 20;

    // 5. Sanctionner immédiatement si l'agent triche ou est trop loin
    if (distance > RAYON_MAX_METRES) {
      throw new BadRequestException({
        success: false,
        message: `Check-in refusé. Éloignement trop important (${Math.round(distance)}m). Vous devez être à moins de ${RAYON_MAX_METRES}m du point de vente.`,
        distance: Math.round(distance)
      });
    }

    // 6. Si tout est parfait, passer au statut IN_PROGRESS
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
        tenantId,
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
        tenantId,
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