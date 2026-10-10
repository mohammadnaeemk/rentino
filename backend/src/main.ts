import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { API_PREFIX, ACCESS_COOKIE } from "./common/constants";
import { validationExceptionFactory } from "./common/pipes/validation-exception.factory";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  // Health checks stay at the conventional unversioned `/health` so monitors
  // don't need to know the API version.
  app.setGlobalPrefix(API_PREFIX, { exclude: ["health"] });
  app.use(cookieParser());

  // The frontend (Next.js) calls the API with `credentials: "include"`, so the
  // browser needs an explicit origin + credentials on the CORS response.
  const origins = (
    config.get<string>("CORS_ORIGINS") ?? "http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length > 0 ? origins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // Unknown properties are stripped rather than rejected: the frontend
      // sends a few extra display-only fields the API has no column for.
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: validationExceptionFactory,
    }),
  );

  if (config.get<string>("SWAGGER_ENABLED") !== "false") {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle("LensLoop API")
        .setDescription(
          "رنتینو — REST API for the Persian rental marketplace (v1)",
        )
        .setVersion("1.0")
        // The API authenticates via httpOnly cookies. The scheme is declared as
        // an API key in the "cookie" location so Swagger's "Try it out" sends
        // the token the same way the browser does.
        .addCookieAuth(
          ACCESS_COOKIE,
          { type: "apiKey", in: "cookie" },
          "accessToken",
        )
        .build(),
    );
    SwaggerModule.setup("docs", app, document, {
      swaggerOptions: { withCredentials: true },
    });
    logger.log(`Swagger docs available at /docs`);
  }

  const port = Number(config.get<string>("PORT") ?? 8000);
  await app.listen(port);
  logger.log(
    `LensLoop API listening on http://localhost:${port}/${API_PREFIX}`,
  );
}

void bootstrap();
