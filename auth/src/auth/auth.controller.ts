import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { AccessTokenGuard } from './guards/access-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(@Req() request: any) {
    return this.authService.refresh(request.user.sub, request.user.refreshToken);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  async logout(@Req() request: any) {
    const userId = request.user?.userId;
    console.log('[Logout Service] ', userId);
    return this.authService.logout(userId);
  }

  @Post('verify')
  async verify(@Body('token') token: string) {
    return this.authService.verify(token);
  }
}
