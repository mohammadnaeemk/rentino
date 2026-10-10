import { Body, Controller, Put, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AuthUser,
  CurrentUser,
} from "../common/decorators/current-user.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiCookieAuth("accessToken")
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put("me")
  @ResponseMessage("پروفایل با موفقیت به‌روزرسانی شد")
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }
}
