import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { RawResponse } from "../common/decorators/raw-response.decorator";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Liveness + database connectivity check" })
  @RawResponse()
  async check() {
    let database = "up";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = "down";
    }

    return {
      status: database === "up" ? "ok" : "degraded",
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
