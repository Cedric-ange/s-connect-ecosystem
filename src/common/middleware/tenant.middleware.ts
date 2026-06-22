import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// 💡 On étend l'interface Request d'Express pour lui ajouter notre propriété custom
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    // Optionnel : Tu peux lever une erreur si le header est manquant sur les routes protégées
    // Pour l'instant on laisse passer pour ne pas bloquer l'authentification globale
    if (tenantId) {
      req.tenantId = tenantId;
    }

    next();
  }
}