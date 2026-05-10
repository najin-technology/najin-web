/**
 * Build a public-bucket URL for the documents bucket.
 * Used for certifications, brochures, etc. Public bucket means anyone with
 * the URL can fetch — write/list is still admin-only via RLS.
 */
export function documentsUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  if (!base || !path) return "";
  return `${base}/storage/v1/object/public/documents/${path}`;
}
