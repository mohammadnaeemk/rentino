import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import {
  AuthUser,
  CurrentUser,
} from "../common/decorators/current-user.decorator";
import { ResponseMessage } from "../common/decorators/response-message.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { TokenPair, TokenService } from "./token.service";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) {
    this.isProduction = config.get<string>("NODE_ENV") === "production";
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage("ثبت‌نام با موفقیت انجام شد")
  @ApiOperation({ summary: "Register a customer or provider account" })
  @ApiResponse({
    status: 201,
    description: "Account created; auth cookies set",
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("ورود با موفقیت انجام شد")
  @ApiOperation({ summary: "Log in with email and password" })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("نشست تازه‌سازی شد")
  @ApiOperation({
    summary: "Rotate the refresh token and mint a new access token",
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = (req as Request & { cookies?: Record<string, string> })
      .cookies?.[REFRESH_COOKIE];
    if (!raw) {
      throw new UnauthorizedException("نشست شما منقضی شده است");
    }

    const result = await this.authService.refresh(raw);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ResponseMessage("با موفقیت خارج شدید")
  @ApiOperation({ summary: "Revoke the current refresh token" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req as Request & { cookies?: Record<string, string> })
      .cookies?.[REFRESH_COOKIE];
    await this.authService.logout(raw);
    this.clearAuthCookies(res);
    return null;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: "Get the authenticated user's profile" })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.id);
  }

  @Post("google")
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  @ApiOperation({
    summary: "Google sign-in (not configured in this deployment)",
  })
  google() {
    throw new NotImplementedException("ورود با گوگل در این نسخه فعال نیست");
  }

  // -------------------------------------------------------------------------
  // Cookie helpers
  // -------------------------------------------------------------------------

  private setAuthCookies(res: Response, tokens: TokenPair): void {
    res.cookie(ACCESS_COOKIE, tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.isProduction,
      path: "/",
      maxAge: this.tokenService.accessMaxAgeMs,
    });
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: this.isProduction,
      path: "/",
      maxAge: this.tokenService.refreshMaxAgeMs,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_COOKIE, { path: "/" });
  }
}
