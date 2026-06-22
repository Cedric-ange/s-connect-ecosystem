import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * 🎯 Décorateur pour injecter instantanément le Tenant ID validé dans les arguments d'un contrôleur
 * Usage : async findAll(@TenantId() tenantId: string)
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    
    if (!request.tenantId) {
      throw new BadRequestException("Identification de l'organisation (X-Tenant-ID) manquante.");
    }
    
    return request.tenantId;
  },
);