import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CreateGearDto, GearQueryDto, UpdateGearDto } from "./dto/gear.dto";
import { GearService } from "./gear.service";

@ApiTags("provider-gear")
@ApiCookieAuth("accessToken")
@Controller("provider/gear")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PROVIDER)
export class ProviderGearController {
  constructor(private readonly gearService: GearService) {}

  @Get()
  @ApiOperation({ summary: "List the authenticated provider's listings" })
  findAll(@CurrentUser() user: AuthUser, @Query() query: GearQueryDto) {
    return this.gearService.findForProvider(user.id, query);
  }

  @Post()
  @ResponseMessage("کالا به فهرست شما اضافه شد")
  @ApiOperation({ summary: "Create a listing owned by the current provider" })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateGearDto) {
    return this.gearService.create(user.id, dto);
  }

  @Put(":id")
  @ResponseMessage("کالا با موفقیت به‌روزرسانی شد")
  @ApiOperation({ summary: "Update one of the current provider's listings" })
  update(
    @CurrentUser() user: AuthUser,
    @Param("id") id: string,
    @Body() dto: UpdateGearDto,
  ) {
    return this.gearService.update(user.id, id, dto);
  }

  @Delete(":id")
  @ResponseMessage("کالا حذف شد")
  @ApiOperation({
    summary: "Delete a listing without order history, else archive it",
  })
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.gearService.remove(user.id, id);
  }
}
