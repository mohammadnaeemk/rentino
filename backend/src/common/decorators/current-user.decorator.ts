import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Role } from "@prisma/client";

/** The authenticated principal attached to the request by `JwtAuthGuard`. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
