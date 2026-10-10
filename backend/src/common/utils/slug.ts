/**
 * Builds a URL-safe slug, preserving Persian letters so Persian titles still
 * produce meaningful slugs. Falls back to `fallback` when nothing survives.
 */
export function slugify(input: string, fallback = "item"): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9؀-ۿ-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || fallback
  );
}
