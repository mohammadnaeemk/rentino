/**
 * Renders a value coming out of a Prisma `Json` column as a display string.
 *
 * Category `specifications` are flat maps of primitives, but `JsonValue` is
 * typed broadly, so anything non-scalar collapses to an empty string rather
 * than leaking `"[object Object]"` into the API.
 */
export function jsonValueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  switch (typeof value) {
    case "string":
      return value;
    case "number":
    case "boolean":
    case "bigint":
      return String(value);
    default:
      // objects, arrays, functions, symbols
      return "";
  }
}
