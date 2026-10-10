import { BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

/**
 * Turns class-validator errors into `{ message, errors: { field: [msg] } }`
 * so the frontend can render field-level validation feedback
 * (`ApiRequestError.errors`).
 */
export function validationExceptionFactory(errors: ValidationError[]) {
  const fieldErrors: Record<string, string[]> = {};

  const flatten = (list: ValidationError[], parent = ""): void => {
    for (const error of list) {
      const path = parent ? `${parent}.${error.property}` : error.property;
      if (error.constraints) {
        fieldErrors[path] = [
          ...(fieldErrors[path] ?? []),
          ...Object.values(error.constraints),
        ];
      }
      if (error.children?.length) {
        flatten(error.children, path);
      }
    }
  };

  flatten(errors);

  const messages = Object.values(fieldErrors).flat();
  return new BadRequestException({
    message: messages.join(" ") || "داده‌های ارسالی نامعتبر است",
    errors: fieldErrors,
  });
}
