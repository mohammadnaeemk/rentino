import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
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
import { CreateReviewDto } from "./dto/review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ResponseMessage("نظر شما ثبت شد")
  @ApiCookieAuth("accessToken")
  @ApiOperation({
    summary: "Create a review for a listing the user has rented",
  })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List reviews (optionally filtered by ?gearId=)" })
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query("gearId") gearId?: string,
  ) {
    return gearId
      ? this.reviewsService.findByGear(
          gearId,
          pagination.page,
          pagination.limit,
        )
      : this.reviewsService.listAll(pagination.page, pagination.limit);
  }
}
