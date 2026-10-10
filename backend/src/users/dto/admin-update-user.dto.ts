import { ApiPropertyOptional } from "@nestjs/swagger";
import { Role, UserStatus } from "@prisma/client";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class AdminUpdateUserDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsIn([Role.CUSTOMER, Role.PROVIDER, Role.ADMIN], {
    message: "نقش نامعتبر است",
  })
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsIn([UserStatus.ACTIVE, UserStatus.SUSPENDED], {
    message: "وضعیت نامعتبر است",
  })
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: "نام باید متن باشد" })
  @MinLength(2, { message: "نام باید حداقل ۲ کاراکتر باشد" })
  name?: string;
}
