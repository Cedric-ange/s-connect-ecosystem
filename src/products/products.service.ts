import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  // 🛡️ Filtre strict par tenantId appliqué directement au niveau de la requête de base
  async getCatalogByTenant(tenantId: string) {
    return this.prisma.sKU.findMany({
      where: { tenantId },
      include: {
        packFormat: {
          include: { brand: true },
        },
        packagings: true, // Crucial pour les facteurs de conversion (ex: Carton de 100)
      },
    });
  }
}