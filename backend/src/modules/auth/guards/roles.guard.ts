import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'ADMIN' | 'INSTRUCTOR' | 'STUDENT'>): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Array<'ADMIN' | 'INSTRUCTOR' | 'STUDENT'>>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();
    const userRole = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole as 'ADMIN' | 'INSTRUCTOR' | 'STUDENT')) {
      throw new ForbiddenException('Forbidden resource');
    }

    return true;
  }
}
