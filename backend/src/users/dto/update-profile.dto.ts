import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "علی رضایی" })
  @IsOptional()
  @IsString({ message: "نام باید متن باشد" })
  @MinLength(2, { message: "نام باید حداقل ۲ کاراکتر باشد" })
  name?: string;

  @ApiPropertyOptional({ example: "https://example.com/avatar.png" })
  @IsOptional()
  @ValidateIf((dto: UpdateProfileDto) => dto.avatarUrl !== "")
  @IsUrl({}, { message: "آدرس تصویر معتبر نیست" })
  avatarUrl?: string;
}
