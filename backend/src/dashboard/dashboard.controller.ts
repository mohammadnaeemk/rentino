import { Controller, Get, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuthUser,
  CurrentUser,
} from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { DashboardService } from "./dashboard.service";

@ApiTags("dashboard")
@ApiCookieAuth("accessToken")
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("provider/dashboard")
  @Roles(Role.PROVIDER, Role.ADMIN)
  @ApiOperation({ summary: "Provider dashboard statistics" })
  provider(@CurrentUser() user: AuthUser) {
    return this.dashboardService.forProvider(user.id);
  }

  @Get("admin/dashboard")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "Admin dashboard statistics" })
  admin() {
    return this.dashboardService.forAdmin();
  }
}
