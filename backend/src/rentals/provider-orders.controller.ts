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
import {
  AuthUser,
  CurrentUser,
} from "../common/decorators/current-user.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../common/dto/pagination.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { UpdateRentalStatusDto } from "./dto/rental.dto";
import { RentalsService } from "./rentals.service";

@ApiTags("provider-orders")
@ApiCookieAuth("accessToken")
@Controller("provider/orders")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PROVIDER)
export class ProviderOrdersController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  @ApiOperation({ summary: "List incoming orders for the provider's listings" })
  list(@CurrentUser() user: AuthUser, @Query() pagination: PaginationQueryDto) {
    return this.rentalsService.listForProvider(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Patch(":id")
  @ResponseMessage("وضعیت سفارش به‌روزرسانی شد")
  @ApiOperation({
    summary:
      "Advance an order's status (confirm / hand over / return / cancel)",
  })
  updateStatus(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateRentalStatusDto,
  ) {
    return this.rentalsService.updateStatusByProvider(user.id, id, dto.status);
  }
}
