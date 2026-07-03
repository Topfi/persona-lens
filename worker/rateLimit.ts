import type { Env } from "./share";

const CREATES_PER_HOUR = 10;

/**
 * Approximate per-IP rate limiting backed by KV. KV counters are eventually
 * consistent — this damps abuse, it is not a hard guarantee. Counter keys
 * auto-expire, so they don't accumulate.
 */
export async function allowCreate(env: Env, request: Request): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const hour = Math.floor(Date.now() / 3_600_000);
  const key = `rl:${ip}:${hour}`;
  const current = Number((await env.SHARES.get(key)) ?? "0");
  if (current >= CREATES_PER_HOUR) return false;
  await env.SHARES.put(key, String(current + 1), { expirationTtl: 3_700 });
  return true;
}
