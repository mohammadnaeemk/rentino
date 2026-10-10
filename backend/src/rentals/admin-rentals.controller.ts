import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminRentalQueryDto } from "./dto/rental.dto";
import { RentalsService } from "./rentals.service";

@ApiTags("admin-rentals")
@ApiCookieAuth("accessToken")
@Controller("admin/rentals")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminRentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  @ApiOperation({ summary: "List all orders with filters (admin only)" })
  list(@Query() query: AdminRentalQueryDto) {
    return this.rentalsService.listForAdmin(query);
  }
}
