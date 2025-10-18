// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';

const ROLES = ['USER', 'ADMIN'] as const;
type Role = (typeof ROLES)[number];

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new UnauthorizedException('Email already used');

    const password = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: { email, password, name: dto.name.trim() },
    });

    return this.signToken(user.id, user.email, user.role as Role);
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await argon2.verify(user.password, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email, user.role as Role);
  }

  private async signToken(sub: number, email: string, role: Role) {
    const payload = { sub, email, role };
    const secret = this.cfg.get<string>('JWT_SECRET')!;
    const expiresIn: string | number = this.cfg.get('JWT_EXPIRES') ?? '1d';

    // dùng async để tránh lỗi overload & hợp chuẩn
    const access_token = await this.jwt.signAsync(payload, { secret, expiresIn } as JwtSignOptions);
    return { access_token , user: { id: sub, email,  role } };
  }
}
