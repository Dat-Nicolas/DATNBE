// src/auth/roles.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        ctx.getHandler(),
        ctx.getClass(),
      ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role?: Role; roles?: Role[] } | undefined;

    if (!user) throw new UnauthorizedException('Missing authenticated user');

    const role: Role | undefined = user.role ?? user.roles?.[0];
    if (!role) throw new ForbiddenException('User has no role');

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
