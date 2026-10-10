const UNIT_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};

/**
 * Parses a short duration string ("15m", "7d", "3600s", "12") into seconds.
 * Returns `fallbackSeconds` when the input is missing or malformed.
 */
export function parseDuration(value: string, fallbackSeconds: number): number {
  const match = /^(\d+)\s*([smhd])?$/.exec(value.trim());
  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2] ?? "s";
  return amount * (UNIT_SECONDS[unit] ?? 1);
}
