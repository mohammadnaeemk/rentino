import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "customer@rentino.ir" })
  @IsEmail({}, { message: "ایمیل معتبر نیست" })
  email!: string;

  @ApiProperty({ example: "Customer123" })
  @IsString({ message: "رمز عبور باید متن باشد" })
  @MinLength(1, { message: "رمز عبور را وارد کنید" })
  password!: string;
}
