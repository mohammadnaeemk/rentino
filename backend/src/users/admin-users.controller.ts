import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../common/dto/pagination.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";
import { UsersService } from "./users.service";

@ApiTags("admin-users")
@ApiCookieAuth("accessToken")
@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List all users (admin only)" })
  list(@Query() pagination: PaginationQueryDto) {
    return this.usersService.listUsers(pagination.page, pagination.limit);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update a user's role, status or name (admin only)",
  })
  update(@Param("id") id: string, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.adminUpdateUser(id, dto);
  }
}
