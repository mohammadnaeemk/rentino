import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({ example: "دوچرخه" })
  @IsString({ message: "نام دسته‌بندی باید متن باشد" })
  @MinLength(2, { message: "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد" })
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({
    example: "bikes",
    description: "Auto-generated if omitted",
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @ApiPropertyOptional({ example: "bikes" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: "دوچرخه" })
  @IsOptional()
  @IsString({ message: "نام دسته‌بندی باید متن باشد" })
  @MinLength(2, { message: "نام دسته‌بندی باید حداقل ۲ کاراکتر باشد" })
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: "bikes" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
