import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateBlogPostDto {
  @ApiProperty()
  @IsString({ message: "عنوان باید متن باشد" })
  @MinLength(3, { message: "عنوان باید حداقل ۳ کاراکتر باشد" })
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsString({ message: "خلاصه باید متن باشد" })
  @MinLength(10, { message: "خلاصه باید حداقل ۱۰ کاراکتر باشد" })
  @MaxLength(500)
  excerpt!: string;

  @ApiProperty()
  @IsString({ message: "متن مقاله باید نوشته شود" })
  @MinLength(20, { message: "متن مقاله باید حداقل ۲۰ کاراکتر باشد" })
  @MaxLength(50000)
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}
