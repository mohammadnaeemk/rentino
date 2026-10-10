const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True when `value` looks like a UUID (guards Prisma UUID filters). */
export function isUuid(value: string | undefined | null): boolean {
  return typeof value === "string" && UUID_RE.test(value);
}
