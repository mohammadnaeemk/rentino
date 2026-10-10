import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { IsEmail, IsIn, IsString, Matches, MinLength } from "class-validator";

/** Roles a member of the public may self-register as. ADMIN is never allowed. */
export const SELF_REGISTERABLE_ROLES: Role[] = [Role.CUSTOMER, Role.PROVIDER];

export class RegisterDto {
  @ApiProperty({ example: "علی رضایی" })
  @IsString({ message: "نام باید متن باشد" })
  @MinLength(2, { message: "نام باید حداقل ۲ کاراکتر باشد" })
  name!: string;

  @ApiProperty({ example: "ali@example.com" })
  @IsEmail({}, { message: "ایمیل معتبر نیست" })
  email!: string;

  @ApiProperty({ example: "Password1", minLength: 8 })
  @IsString({ message: "رمز عبور باید متن باشد" })
  @MinLength(8, { message: "رمز عبور باید حداقل ۸ کاراکتر باشد" })
  @Matches(/[A-Z]/, { message: "رمز عبور باید حداقل یک حرف بزرگ داشته باشد" })
  @Matches(/[0-9]/, { message: "رمز عبور باید حداقل یک رقم داشته باشد" })
  password!: string;

  @ApiProperty({ enum: [Role.CUSTOMER, Role.PROVIDER] })
  @IsIn(SELF_REGISTERABLE_ROLES, {
    message: "نقش انتخابی نامعتبر است",
  })
  role!: Role;
}
