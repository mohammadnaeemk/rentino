import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

export interface ErrorEnvelope {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Normalises every error into `{ success: false, message, errors? }`, matching
 * the frontend's `ApiError` type. Internal errors never leak stack traces.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "خطای داخلی سرور رخ داد";
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === "string") {
        message = body;
      } else if (body && typeof body === "object") {
        const payload = body as Record<string, unknown>;
        if (Array.isArray(payload.message)) {
          message = (payload.message as string[]).join(" ");
        } else if (typeof payload.message === "string") {
          message = payload.message;
        }
        if (payload.errors && typeof payload.errors === "object") {
          errors = payload.errors as Record<string, string[]>;
        }
      }
    } else {
      // Unexpected error — log server-side, return a generic message.
      this.logger.error(
        `${request.method} ${request.url} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const envelope: ErrorEnvelope = { success: false, message };
    if (errors) {
      envelope.errors = errors;
    }

    response.status(status).json(envelope);
  }
}
