import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

const GEAR_SORTS = [
  "recommended",
  "price-asc",
  "price-desc",
  "rating",
  "newest",
] as const;

export type GearSort = (typeof GEAR_SORTS)[number];

export class CreateGearDto {
  @ApiProperty({ example: "پلی‌استیشن ۵" })
  @IsString({ message: "نام کالا باید متن باشد" })
  @MinLength(2, { message: "نام کالا باید حداقل ۲ کاراکتر باشد" })
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: "کنسول بازی سونی" })
  @IsString({ message: "توضیحات باید متن باشد" })
  @MinLength(2, { message: "توضیحات را وارد کنید" })
  @MaxLength(2000)
  description!: string;

  @ApiProperty()
  @IsUUID("4", { message: "شناسه دسته‌بندی نامعتبر است" })
  categoryId!: string;

  @ApiPropertyOptional({ example: "Sony" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[] = [];

  @ApiProperty({ example: 4000000, description: "Price per day in Rial" })
  @Type(() => Number)
  @IsInt({ message: "قیمت باید عدد صحیح (ریال) باشد" })
  @Min(1, { message: "قیمت باید بیشتر از صفر باشد" })
  pricePerDay!: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: "موجودی باید عدد صحیح باشد" })
  @Min(0, { message: "موجودی نمی‌تواند منفی باشد" })
  stock!: number;

  @ApiPropertyOptional({ type: Object, example: { Storage: "825GB" } })
  @IsOptional()
  @IsObject({ message: "مشخصات باید یک شیء باشد" })
  specifications?: Record<string, unknown>;
}

export class UpdateGearDto extends PartialType(CreateGearDto) {}

export class AdminUpdateGearDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: "وضعیت نمایش باید بولین باشد" })
  isActive?: boolean;
}

export class GearQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @ApiPropertyOptional({ description: "Category slug or id" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: "Free-text search over name/brand/description",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "Alias for `search`" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: "Minimum price per day (Rial)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: "Maximum price per day (Rial)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: GEAR_SORTS, default: "newest" })
  @IsOptional()
  @IsIn(GEAR_SORTS, { message: "ترتیب مرتب‌سازی نامعتبر است" })
  sort?: GearSort;

  @ApiPropertyOptional({
    description: "Filter by provider id (admin/provider)",
  })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({
    description: "Include hidden (inactive) listings — admin only",
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  includeInactive?: boolean;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get term(): string | undefined {
    return this.search ?? this.q;
  }
}
