import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { AuthUser } from "../decorators/current-user.decorator";
import { ROLES_KEY } from "../decorators/roles.decorator";

/** Enforces `@Roles(...)` against the authenticated user's role. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException("شما به این بخش دسترسی ندارید");
    }

    return true;
  }
}
