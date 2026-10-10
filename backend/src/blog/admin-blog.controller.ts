import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { PaginationQueryDto } from "../common/dto/pagination.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { BlogService } from "./blog.service";
import { CreateBlogPostDto, UpdateBlogPostDto } from "./dto/blog.dto";

@ApiTags("admin-blog")
@ApiCookieAuth("accessToken")
@Controller("admin/blog")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({
    summary: "List all blog posts, including drafts (admin only)",
  })
  list(@Query() pagination: PaginationQueryDto) {
    return this.blogService.listAll(pagination.page, pagination.limit);
  }

  @Post()
  @ResponseMessage("مقاله ایجاد شد")
  @ApiOperation({ summary: "Create a blog post (admin only)" })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBlogPostDto) {
    return this.blogService.create(user.id, dto);
  }

  @Put(":id")
  @ResponseMessage("مقاله به‌روزرسانی شد")
  @ApiOperation({ summary: "Update a blog post (admin only)" })
  update(@Param("id") id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  @Patch(":id/publish")
  @ResponseMessage("مقاله منتشر شد")
  @ApiOperation({ summary: "Publish a blog post (admin only)" })
  publish(@Param("id") id: string) {
    return this.blogService.setPublished(id, true);
  }

  @Patch(":id/unpublish")
  @ResponseMessage("انتشار مقاله لغو شد")
  @ApiOperation({ summary: "Unpublish a blog post (admin only)" })
  unpublish(@Param("id") id: string) {
    return this.blogService.setPublished(id, false);
  }

  @Delete(":id")
  @ResponseMessage("مقاله حذف شد")
  @ApiOperation({ summary: "Delete a blog post (admin only)" })
  remove(@Param("id") id: string) {
    return this.blogService.remove(id);
  }
}
