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
import { ResponseMessage } from "../common/decorators/response-message.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AdminUpdateGearDto, GearQueryDto } from "./dto/gear.dto";
import { GearService } from "./gear.service";

@ApiTags("admin-gear")
@ApiCookieAuth("accessToken")
@Controller("admin/gear")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminGearController {
  constructor(private readonly gearService: GearService) {}

  @Get()
  @ApiOperation({
    summary: "List all listings, including hidden ones (admin only)",
  })
  findAll(@Query() query: GearQueryDto) {
    return this.gearService.findForAdmin(query);
  }

  @Patch(":id")
  @ResponseMessage("وضعیت کالا به‌روزرسانی شد")
  @ApiOperation({ summary: "Publish/unpublish a listing (admin only)" })
  update(@Param("id") id: string, @Body() dto: AdminUpdateGearDto) {
    return this.gearService.adminUpdate(id, dto);
  }
}
