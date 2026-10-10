import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { PublicUser, toPublicUser } from "../users/user.serializer";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { TokenPair, TokenService } from "./token.service";

const BCRYPT_ROUNDS = 10;

export interface AuthResult extends TokenPair {
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("این ایمیل قبلاً ثبت شده است");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Role comes from the validated DTO (CUSTOMER | PROVIDER only) — the
    // client can never self-assign ADMIN.
    const user = await this.prisma.user.create({
      data: { name: dto.name.trim(), email, passwordHash, role: dto.role },
    });

    const tokens = await this.tokens.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("ایمیل یا رمز عبور نادرست است");
    }

    this.assertActive(user);

    const tokens = await this.tokens.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("کاربر یافت نشد");
    }
    this.assertActive(user);
    return toPublicUser(user);
  }

  /**
   * Consumes (and rotates) a refresh token, returning fresh tokens and the
   * owning user. The presented token is revoked by `TokenService`.
   */
  async refresh(rawRefreshToken: string): Promise<AuthResult> {
    const userId = await this.tokens.consumeRefreshToken(rawRefreshToken);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("نشست شما منقضی شده است");
    }
    this.assertActive(user);

    const tokens = await this.tokens.issueTokens(user);
    return { user: toPublicUser(user), ...tokens };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    await this.tokens.revoke(rawRefreshToken);
  }

  private assertActive(user: User): void {
    if (user.status === "SUSPENDED") {
      throw new ForbiddenException("حساب کاربری شما مسدود شده است");
    }
  }
}
