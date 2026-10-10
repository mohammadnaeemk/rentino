import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AuthUser } from "../decorators/current-user.decorator";

interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: AuthUser["role"];
}

/**
 * Authenticates a request from the httpOnly `accessToken` cookie (the frontend
 * sends cookies via `credentials: "include"`). Falls back to an
 * `Authorization: Bearer <token>` header so Swagger "Try it out" works.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request & { user?: AuthUser; cookies?: Record<string, string> }
      >();

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException("برای دسترسی به این بخش باید وارد شوید");
    }

    try {
      const payload =
        await this.jwtService.verifyAsync<AccessTokenPayload>(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      };
      return true;
    } catch {
      throw new UnauthorizedException("نشست شما منقضی شده است");
    }
  }

  private extractToken(request: Request): string | undefined {
    const cookieToken = (request as { cookies?: Record<string, string> })
      .cookies?.accessToken;
    if (cookieToken) {
      return cookieToken;
    }

    const header = request.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      return header.slice("Bearer ".length);
    }

    return undefined;
  }
}
