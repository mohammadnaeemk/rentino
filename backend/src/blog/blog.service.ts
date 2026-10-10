import { Injectable, NotFoundException } from "@nestjs/common";
import { BlogPost, Prisma, User } from "@prisma/client";
import { Paginated, buildMeta } from "../common/interfaces/paginated";
import { slugify } from "../common/utils/slug";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBlogPostDto, UpdateBlogPostDto } from "./dto/blog.dto";

export interface BlogPostDto {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  date: string;
  author?: { id: string; name: string; avatar: string | null };
}

type BlogPostWithAuthor = BlogPost & {
  author?: Pick<User, "id" | "name" | "avatarUrl"> | null;
};

const BLOG_INCLUDE = {
  author: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.BlogPostInclude;

function toBlogPostDto(post: BlogPostWithAuthor): BlogPostDto {
  return {
    id: post.id,
    authorId: post.authorId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage ?? null,
    category: post.category,
    isPublished: post.isPublished,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    date: (post.publishedAt ?? post.createdAt).toISOString(),
    ...(post.author
      ? {
          author: {
            id: post.author.id,
            name: post.author.name,
            avatar: post.author.avatarUrl ?? null,
          },
        }
      : {}),
  };
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  // --- public ---------------------------------------------------------------

  async listPublished(
    page: number,
    limit: number,
  ): Promise<Paginated<BlogPostDto>> {
    return this.paginate({ isPublished: true }, page, limit, [
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ]);
  }

  async findPublishedBySlug(slug: string): Promise<BlogPostDto> {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, isPublished: true },
      include: BLOG_INCLUDE,
    });
    if (!post) {
      throw new NotFoundException("مقاله یافت نشد");
    }
    return toBlogPostDto(post);
  }

  // --- admin ----------------------------------------------------------------

  async listAll(page: number, limit: number): Promise<Paginated<BlogPostDto>> {
    return this.paginate({}, page, limit, [{ createdAt: "desc" }]);
  }

  async create(authorId: string, dto: CreateBlogPostDto): Promise<BlogPostDto> {
    const slug = await this.uniqueSlug(slugify(dto.title));
    const post = await this.prisma.blogPost.create({
      data: {
        authorId,
        title: dto.title.trim(),
        slug,
        excerpt: dto.excerpt.trim(),
        content: dto.content,
        coverImage: dto.coverImage || null,
        category: dto.category ?? "",
      },
      include: BLOG_INCLUDE,
    });
    return toBlogPostDto(post);
  }

  async update(id: string, dto: UpdateBlogPostDto): Promise<BlogPostDto> {
    await this.ensureExists(id);

    const data: Prisma.BlogPostUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt.trim();
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.coverImage !== undefined) data.coverImage = dto.coverImage || null;
    if (dto.category !== undefined) data.category = dto.category;

    const post = await this.prisma.blogPost.update({
      where: { id },
      data,
      include: BLOG_INCLUDE,
    });
    return toBlogPostDto(post);
  }

  async setPublished(id: string, isPublished: boolean): Promise<BlogPostDto> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("مقاله یافت نشد");
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        isPublished,
        publishedAt: isPublished ? (existing.publishedAt ?? new Date()) : null,
      },
      include: BLOG_INCLUDE,
    });
    return toBlogPostDto(post);
  }

  async remove(id: string): Promise<null> {
    await this.ensureExists(id);
    await this.prisma.blogPost.delete({ where: { id } });
    return null;
  }

  // --- internals ------------------------------------------------------------

  private async paginate(
    where: Prisma.BlogPostWhereInput,
    page: number,
    limit: number,
    orderBy: Prisma.BlogPostOrderByWithRelationInput[],
  ): Promise<Paginated<BlogPostDto>> {
    const [total, posts] = await this.prisma.$transaction([
      this.prisma.blogPost.count({ where }),
      this.prisma.blogPost.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: BLOG_INCLUDE,
      }),
    ]);

    return new Paginated(
      posts.map(toBlogPostDto),
      buildMeta(total, page, limit),
    );
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.blogPost.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException("مقاله یافت نشد");
    }
  }

  private async uniqueSlug(base: string): Promise<string> {
    let candidate = base;
    let counter = 2;
    for (;;) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });
      if (!existing) {
        return candidate;
      }
      candidate = `${base}-${counter}`;
      counter += 1;
    }
  }
}
