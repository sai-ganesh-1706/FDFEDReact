import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthSessionService } from '../auth/auth-session.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsersRepository } from '../../users/users.repository';

export interface RequestUser {
  userId: number | null;
  role: string;
  collegeId: number | null;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: AuthSessionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authorization = String(request.headers.authorization || '');
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    if (!token) throw new UnauthorizedException('Authentication is required. Please sign in.');

    const userId = this.sessions.getUserId(token);
    if (!userId) throw new UnauthorizedException('Your session has expired. Please sign in again.');

    const account = UsersRepository.current?.findById(userId);
    if (!account) throw new UnauthorizedException('Your account is no longer available. Please sign in again.');
    if (account.status === 'inactive' || account.status === 'suspended') {
      throw new UnauthorizedException('Your account has been deactivated. Please contact your administrator.');
    }

    const role = account.role;
    const collegeId = account.collegeId ?? null;
    request.user = { userId, role, collegeId } as RequestUser;
    request.headers['x-user-id'] = String(userId);
    request.headers['x-role'] = role;
    request.headers['x-college-id'] = collegeId != null ? String(collegeId) : 'null';

    // No roles required — allow all
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // super_admin bypasses all role checks — can access every protected endpoint
    if (role === 'super_admin') {
      return true;
    }

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException(
        `Role '${role}' is not authorized. Required: ${requiredRoles.join(' | ')}`,
      );
    }

    return true;
  }
}
