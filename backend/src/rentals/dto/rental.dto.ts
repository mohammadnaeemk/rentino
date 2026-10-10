import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RentalStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class RentalItemInputDto {
  @ApiPropertyOptional({ description: "Gear id (canonical field)" })
  @IsOptional()
  @IsUUID("4", { message: "شناسه کالا نامعتبر است" })
  gearItemId?: string;

  @ApiPropertyOptional({ description: "Alias accepted for `gearItemId`" })
  @IsOptional()
  @IsUUID("4", { message: "شناسه کالا نامعتبر است" })
  gearId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "تعداد باید حداقل ۱ باشد" })
  @Max(20)
  quantity: number = 1;
}

export class CreateRentalDto {
  @ApiProperty({ example: "2026-11-01T10:00:00.000Z" })
  @IsISO8601({}, { message: "تاریخ تحویل معتبر نیست" })
  startDate!: string;

  @ApiProperty({ example: "2026-11-04T10:00:00.000Z" })
  @IsISO8601({}, { message: "تاریخ بازگشت معتبر نیست" })
  endDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({ type: [RentalItemInputDto] })
  @IsArray()
  @ArrayMinSize(1, { message: "حداقل یک کالا انتخاب کنید" })
  @ValidateNested({ each: true })
  @Type(() => RentalItemInputDto)
  items!: RentalItemInputDto[];
}

export class UpdateRentalStatusDto {
  @ApiProperty({ enum: RentalStatus })
  @IsIn(
    [
      RentalStatus.CONFIRMED,
      RentalStatus.PICKED_UP,
      RentalStatus.RETURNED,
      RentalStatus.CANCELLED,
    ],
    { message: "وضعیت نامعتبر است" },
  )
  status!: RentalStatus;
}

export class AdminRentalQueryDto {
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
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: RentalStatus })
  @IsOptional()
  @IsIn(Object.values(RentalStatus), { message: "وضعیت نامعتبر است" })
  status?: RentalStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerId?: string;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
