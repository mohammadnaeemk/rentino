import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { createHash, randomUUID } from "crypto";
import { parseDuration } from "../common/utils/duration";
import { PrismaService } from "../prisma/prisma.service";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshPayload {
  sub: string;
  jti: string;
}

/**
 * Issues and rotates JWTs.
 *
 * - Access tokens are short-lived and stateless.
 * - Refresh tokens are JWTs whose SHA-256 hash is persisted. Only the hash is
 *   stored, so a database leak cannot be replayed. Rotation revokes the old
 *   token on every refresh; logout revokes the presented token.
 */
@Injectable()
export class TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtl: number;
  private readonly refreshTtl: number;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const accessSecret = config.get<string>("JWT_ACCESS_SECRET");
    const refreshSecret = config.get<string>("JWT_REFRESH_SECRET");
    if (!accessSecret || !refreshSecret) {
      throw new Error(
        "JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set (see .env.example)",
      );
    }
    this.accessSecret = accessSecret;
    this.refreshSecret = refreshSecret;
    this.accessTtl = parseDuration(
      config.get<string>("JWT_ACCESS_TTL", "15m"),
      900,
    );
    this.refreshTtl = parseDuration(
      config.get<string>("JWT_REFRESH_TTL", "7d"),
      604800,
    );
  }

  get accessMaxAgeMs(): number {
    return this.accessTtl * 1000;
  }

  get refreshMaxAgeMs(): number {
    return this.refreshTtl * 1000;
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async issueTokens(user: User): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, name: user.name, role: user.role },
      { secret: this.accessSecret, expiresIn: this.accessTtl },
    );

    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: randomUUID() },
      { secret: this.refreshSecret, expiresIn: this.refreshTtl },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + this.refreshMaxAgeMs),
      },
    });

    return { accessToken, refreshToken };
  }

  /** Verifies and consumes a refresh token, returning the owning user id. */
  async consumeRefreshToken(rawToken: string): Promise<string> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync<RefreshPayload>(rawToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException("نشست شما منقضی شده است");
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(rawToken) },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("نشست شما منقضی شده است");
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return payload.sub;
  }

  /** Revokes a refresh token if it exists. Never throws. */
  async revoke(rawToken: string | undefined): Promise<void> {
    if (!rawToken) {
      return;
    }
    await this.prisma.refreshToken
      .updateMany({
        where: { tokenHash: this.hashToken(rawToken), revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => undefined);
  }
}
