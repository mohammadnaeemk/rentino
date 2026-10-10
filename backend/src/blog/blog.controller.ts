import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PaginationQueryDto } from "../common/dto/pagination.dto";
import { BlogService } from "./blog.service";

@ApiTags("blog")
@Controller("blog")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: "List published blog posts (public)" })
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.blogService.listPublished(pagination.page, pagination.limit);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Get a published blog post by slug (public)" })
  findOne(@Param("slug") slug: string) {
    return this.blogService.findPublishedBySlug(slug);
  }
}
