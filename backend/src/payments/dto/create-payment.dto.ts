import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty()
  @IsUUID("4", { message: "شناسه سفارش نامعتبر است" })
  rentalOrderId!: string;

  @ApiPropertyOptional({
    example: "ZARINPAL",
    description:
      "Accepted for UI compatibility but ignored — every payment in this build is simulated.",
  })
  @IsOptional()
  @IsString()
  method?: string;
}
