import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";
import { BlogModule } from "./blog/blog.module";
import { CategoriesModule } from "./categories/categories.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { DashboardModule } from "./dashboard/dashboard.module";
import { GearModule } from "./gear/gear.module";
import { HealthModule } from "./health/health.module";
import { PaymentsModule } from "./payments/payments.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RentalsModule } from "./rentals/rentals.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global so `JwtAuthGuard` can verify access tokens from any module. The
    // default secret is the ACCESS secret; refresh tokens live on a separate
    // key, which `TokenService` passes explicitly on sign/verify.
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_ACCESS_SECRET"),
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    GearModule,
    RentalsModule,
    PaymentsModule,
    ReviewsModule,
    BlogModule,
    DashboardModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
