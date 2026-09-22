// Only same-site paths may follow a sign-in. "//evil.com" and "/\evil.com" are protocol-relative URLs to
// another host, and control characters or backslashes can smuggle one past a prefix check.
export function safeNext(next: string | undefined | null, fallback = "/app"): string {
  if (!next || next.length > 512 || !next.startsWith("/") || next.startsWith("//")) return fallback;
  for (let i = 0; i < next.length; i++) {
    const c = next.charCodeAt(i);
    if (c < 0x20 || c === 0x7f || c === 0x5c) return fallback;
  }
  return next;
}
