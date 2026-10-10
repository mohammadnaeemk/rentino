import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Role } from "@prisma/client";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import {
  AuthUser,
  CurrentUser,
} from "../common/decorators/current-user.decorator";
import { RawResponse } from "../common/decorators/raw-response.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { PaginationQueryDto } from "../common/dto/pagination.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentsService } from "./payments.service";
import { renderSimulatedGateway } from "./simulated-gateway";

@ApiTags("payments")
@ApiCookieAuth("accessToken")
@Controller("payments")
export class PaymentsController {
  private readonly frontendUrl: string;

  constructor(
    private readonly paymentsService: PaymentsService,
    config: ConfigService,
  ) {
    this.frontendUrl =
      config.get<string>("FRONTEND_URL") ?? "http://localhost:3000";
  }

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ResponseMessage("پرداخت آزمایشی ایجاد شد")
  @ApiOperation({
    summary:
      "Create a simulated payment for an order and return the mock-gateway URL",
  })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "List the current user's payments" })
  list(@CurrentUser() user: AuthUser, @Query() pagination: PaginationQueryDto) {
    return this.paymentsService.listForUser(
      user.id,
      pagination.page,
      pagination.limit,
    );
  }

  @Get("simulate/:id")
  @RawResponse()
  @ApiOperation({ summary: "Mock payment gateway page (HTML, simulated only)" })
  async simulate(@Param("id") id: string, @Res() res: Response) {
    const context = await this.paymentsService.getSimulationContext(id);
    if (!context) {
      res
        .status(HttpStatus.NOT_FOUND)
        .type("html")
        .send(
          '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><body style="font-family:Tahoma;padding:40px;text-align:center">پرداخت یافت نشد</body></html>',
        );
      return;
    }

    res.type("html").send(renderSimulatedGateway(context));
  }

  @Post(":id/complete")
  @HttpCode(HttpStatus.SEE_OTHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @RawResponse()
  @ApiOperation({ summary: "Simulate a successful payment, then redirect" })
  async complete(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const { orderId } = await this.paymentsService.complete(id, user.id);
    res.redirect(
      HttpStatus.SEE_OTHER,
      `${this.frontendUrl}/payment/success?order=${orderId}`,
    );
  }

  @Post(":id/cancel")
  @HttpCode(HttpStatus.SEE_OTHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @RawResponse()
  @ApiOperation({ summary: "Simulate a cancelled payment, then redirect" })
  async cancel(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const { orderId } = await this.paymentsService.cancel(id, user.id);
    res.redirect(
      HttpStatus.SEE_OTHER,
      `${this.frontendUrl}/payment/cancel?order=${orderId}`,
    );
  }
}
