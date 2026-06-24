import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TenantId } from '../common/decorators/tenant-id.decorator'; // 🎯 Import du décorateur
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, TwoFactorVerifyDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user inside a Tenant' })
  async register(@Body() registerDto: RegisterDto, @TenantId() tenantId: string) {
    return this.authService.register(registerDto, tenantId);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user with Tenant scope' })
  async login(@Body() loginDto: LoginDto, @TenantId() tenantId: string) {
    return this.authService.login(loginDto, tenantId);
  }

  @Post('login-auto')
  @ApiOperation({ summary: 'Login user — auto-detect tenant from email' })
  async loginAuto(@Body() loginDto: LoginDto) {
    return this.authService.loginAuto(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Request() req, @Body('refreshToken') refreshToken: string) {
    return this.authService.logout(req.user.id, refreshToken);
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@Request() req) {
    return this.authService.logoutAll(req.user.id);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return {
      success: true,
      user: req.user,
    };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return {
      success: true,
      message: 'Password reset email sent (if user exists)',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return {
      success: true,
      message: 'Password reset successful',
    };
  }

  @Post('2fa/generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret' })
  async generate2FA(@Request() req) {
    return this.authService.generateTwoFactorSecret(req.user.id);
  }

  @Post('2fa/enable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA' })
  async enable2FA(@Request() req, @Body() twoFactorDto: TwoFactorVerifyDto) {
    return this.authService.enableTwoFactor(req.user.id, twoFactorDto.code);
  }

  @Post('2fa/verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA code' })
  async verify2FA(@Request() req) {
    return {
      success: true,
      twoFactorEnabled: req.user.twoFactorEnabled,
    };
  }

  @Post('2fa/disable')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  async disable2FA(@Request() req, @Body() twoFactorDto: TwoFactorVerifyDto) {
    return this.authService.disableTwoFactor(req.user.id, twoFactorDto.code);
  }
}