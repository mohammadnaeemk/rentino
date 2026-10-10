import { Module } from "@nestjs/common";
import { AdminBlogController } from "./admin-blog.controller";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";

@Module({
  controllers: [BlogController, AdminBlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
