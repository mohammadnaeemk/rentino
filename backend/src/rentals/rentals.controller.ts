import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { CreateRentalDto } from "./dto/rental.dto";
import { RentalsService } from "./rentals.service";

@ApiTags("rentals")
@ApiCookieAuth("accessToken")
@Controller("rentals")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  @ResponseMessage("سفارش با موفقیت ثبت شد")
  @ApiOperation({
    summary:
      "Create a rental order. The server recomputes the price and rejects date conflicts.",
  })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRentalDto) {
    return this.rentalsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the current customer's orders" })
  list(@CurrentUser() user: AuthUser, @Query() pagination: PaginationQueryDto) {
    return this.rentalsService.listForCustomer(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one of the current customer's orders" })
  findOne(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.rentalsService.findForCustomer(user.id, id);
  }

  @Patch(":id/cancel")
  @ResponseMessage("سفارش لغو شد")
  @ApiOperation({ summary: "Cancel the current customer's order (if allowed)" })
  cancel(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.rentalsService.cancelByCustomer(user.id, id);
  }
}
