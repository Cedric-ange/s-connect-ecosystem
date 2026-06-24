import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string, tenantId: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
        tenantId: tenantId,
      },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async loginAuto(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Ce compte est désactivé.');
    }

    if (user.twoFactorEnabled) {
      if (!loginDto.twoFactorCode) {
        return {
          requiresTwoFactor: true,
          message: 'Two-factor authentication required',
        };
      }
      const isValid = this.verifyTwoFactor(user.twoFactorSecret, loginDto.twoFactorCode);
      if (!isValid) {
        throw new UnauthorizedException('Invalid two-factor code');
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const { password: _, ...userWithoutPassword } = user;
    const tokens = await this.generateTokens(userWithoutPassword);

    return {
      success: true,
      message: 'Login successful',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      tenantId: user.tenantId,
      user: this.sanitizeUser(user),
    };
  }

  async login(loginDto: LoginDto, tenantId: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password, tenantId);
    
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects pour cette organisation.');
    }

    if (user.twoFactorEnabled) {
      if (!loginDto.twoFactorCode) {
        return {
          requiresTwoFactor: true,
          message: 'Two-factor authentication required',
        };
      }

      const isValid = this.verifyTwoFactor(user.twoFactorSecret, loginDto.twoFactorCode);
      if (!isValid) {
        throw new UnauthorizedException('Invalid two-factor code');
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const tokens = await this.generateTokens(user);
    
    return {
      success: true,
      message: 'Login successful',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: this.sanitizeUser(user),
    };
  }

  async register(registerDto: RegisterDto, tenantId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: registerDto.email, tenantId },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists in this organization');
    }

    const existingMatricule = await this.prisma.user.findFirst({
      where: { matricule: registerDto.matricule, tenantId },
    });
    if (existingMatricule) {
      throw new BadRequestException('Matricule already exists in this organization');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        matricule: registerDto.matricule,
        role: (registerDto.role as unknown as UserRole) || UserRole.VAN_SELLER,
        photoUrl: (registerDto as any).photoUrl || null,
        hireDate: registerDto.hireDate ? new Date(registerDto.hireDate) : null,
      },
    });

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: 'Registration successful',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      user: this.sanitizeUser(user),
    };
  }

  async generateTokens(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      tenantId: user.tenantId, 
      role: user.role 
    };

    const access_token = this.jwtService.sign(payload);
    
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? '',
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') ?? '30d',
    });

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    await this.prisma.refreshToken.create({
      data: {
        token: refresh_token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { access_token, refresh_token };
  }

  async refreshToken(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') ?? '',
      });

      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!storedToken.user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }

      const tokens = await this.generateTokens(storedToken.user);

      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      return {
        success: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });
    return { success: true, message: 'Logout successful' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Logged out from all devices' };
  }

  async generateTwoFactorSecret(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `SFA (${user.email})`,
      issuer: 'SFA',
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url ?? '');

    return {
      success: true,
      message: '2FA secret generated',
      qrCode,
      secret: secret.base32,
    };
  }

  async enableTwoFactor(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not set up');
    }

    const isValid = this.verifyTwoFactor(user.twoFactorSecret, code);
    if (!isValid) {
      throw new BadRequestException('Invalid code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return {
      success: true,
      message: '2FA enabled',
      twoFactorEnabled: true,
    };
  }

  async disableTwoFactor(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not enabled or incomplete');
    }

    const isValid = this.verifyTwoFactor(user.twoFactorSecret, code);
    if (!isValid) {
      throw new BadRequestException('Invalid code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return {
      success: true,
      message: '2FA disabled',
      twoFactorEnabled: false,
    };
  }

  private verifyTwoFactor(secret: string | null, token: string): boolean {
    if (!secret) return false;
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  private sanitizeUser(user: any) {
    const { password, twoFactorSecret, ...sanitized } = user;
    return sanitized;
  }
}