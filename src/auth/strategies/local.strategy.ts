import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // 💡 passReqToCallback: true permet de passer l'objet 'req' à la fonction validate
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(req: Request, email: string, password: string): Promise<any> {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      throw new UnauthorizedException("Identification de l'organisation (X-Tenant-ID) manquante.");
    }

    const user = await this.authService.validateUser(email, password, tenantId);
    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }
    return user;
  }
}