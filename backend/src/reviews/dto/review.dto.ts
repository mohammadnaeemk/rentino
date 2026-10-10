import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreateReviewDto {
  @ApiPropertyOptional({ description: "Gear id (canonical field)" })
  @IsOptional()
  @IsUUID("4", { message: "شناسه کالا نامعتبر است" })
  gearItemId?: string;

  @ApiPropertyOptional({ description: "Alias accepted for `gearItemId`" })
  @IsOptional()
  @IsUUID("4", { message: "شناسه کالا نامعتبر است" })
  gearId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID("4", { message: "شناسه سفارش نامعتبر است" })
  rentalOrderId?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt({ message: "امتیاز باید عدد صحیح باشد" })
  @Min(1, { message: "امتیاز باید بین ۱ تا ۵ باشد" })
  @Max(5, { message: "امتیاز باید بین ۱ تا ۵ باشد" })
  rating!: number;

  @ApiProperty()
  @IsString({ message: "متن نظر باید نوشته شود" })
  @MinLength(10, { message: "متن نظر باید حداقل ۱۰ کاراکتر باشد" })
  @MaxLength(1000)
  comment!: string;
}
