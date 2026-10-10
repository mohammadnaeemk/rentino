import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { ApiCookieAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseMessage } from "../common/decorators/response-message.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

@ApiTags("admin-categories")
@ApiCookieAuth("accessToken")
@Controller("categories")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ResponseMessage("دسته‌بندی ایجاد شد")
  @ApiOperation({ summary: "Create a category (admin only)" })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Put(":id")
  @ResponseMessage("دسته‌بندی به‌روزرسانی شد")
  @ApiOperation({ summary: "Update a category (admin only)" })
  update(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(":id")
  @ResponseMessage("دسته‌بندی حذف شد")
  @ApiOperation({ summary: "Delete an empty category (admin only)" })
  remove(@Param("id") id: string) {
    return this.categoriesService.remove(id);
  }
}
