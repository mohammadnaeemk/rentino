import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RAW_RESPONSE_KEY } from "../decorators/raw-response.decorator";
import { RESPONSE_MESSAGE_KEY } from "../decorators/response-message.decorator";
import { Paginated } from "../interfaces/paginated";

export interface Envelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: unknown;
}

/**
 * Wraps every successful response in the envelope the frontend expects:
 * `{ success, message, data, meta? }` (see `src/lib/api.ts` `ApiResponse`).
 *
 * `Paginated<T>` payloads are unwrapped so `data` is the array and `meta`
 * carries `{ page, limit, total, totalPages }`.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Envelope<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Envelope<T>> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isRaw) {
      // The handler writes its own response (HTML page, redirect); the cast
      // records that the declared envelope type does not apply here.
      return next.handle() as unknown as Observable<Envelope<T>>;
    }

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? "OK";

    return next.handle().pipe(
      map((value) => {
        if (value instanceof Paginated) {
          return {
            success: true as const,
            message,
            data: value.data as unknown as T,
            meta: value.meta,
          };
        }

        return { success: true as const, message, data: value };
      }),
    );
  }
}
