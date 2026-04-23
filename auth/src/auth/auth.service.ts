import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Create user in database
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = await this.generateToken(
      user.id,
      user.email,
    );

    const encryptedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        refreshToken: encryptedRefreshToken,
      },
    });

    // 4. Return user without password
    const { password, refreshToken: _, ...result } = user;
    return { user: result, accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    console.log("[Auth service] [Login] login api dto : ", dto);
    console.log("[Auth service] [Login] login api user : ", user);

    if (!user) {
      console.log("[Auth Service] here");
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.generateToken(
      user.id,
      user.email,
    );

    const encryptedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        refreshToken: encryptedRefreshToken,
      },
    });

    const { password, refreshToken: _, ...result } = user;
    return { user: result, accessToken, refreshToken };
  }

  private async generateToken(userId: string, email: string) {
    const accessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };
    const refreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessTokenPayload, { expiresIn: '15m' }),
      this.jwt.signAsync(refreshTokenPayload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    // 1. Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    // 2. Check user exists and has a refresh token
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 3. Verify JWT is not expired
    try {
      await this.jwt.verifyAsync(refreshToken, {
        secret: process.env.JWT_SECRET
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 4. Check token matches stored hash
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 5. Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.generateToken(user.id, user.email);

    // 6. Hash and save new refresh token
    const hashed = await bcrypt.hash(newRefreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed }
    });

    // 7. Return new tokens
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });
    return { message: 'Logged out successfully' };
  }

  async verify(token: string) {
    try {
      const payload = await this.jwt.verifyAsync(token);
      return {
        userId: payload.sub, email: payload.email
      }
    }
    catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
