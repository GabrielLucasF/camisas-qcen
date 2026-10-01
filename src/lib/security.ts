import crypto from 'crypto';

// In-memory rate limiting store
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const revokedTokens = new Map<string, number>();

// Global failed login attempt tracker for distributed brute-force protection
interface GlobalLoginTracker {
  failedAttempts: number;
  resetAt: number;
}

const globalLoginTracker: GlobalLoginTracker = {
  failedAttempts: 0,
  resetAt: Date.now() + 5 * 60 * 1000,
};

// Periodic cleanup of expired rate limit and revocation entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
    for (const [sig, exp] of revokedTokens.entries()) {
      if (exp <= now) {
        revokedTokens.delete(sig);
      }
    }
  }, 5 * 60 * 1000);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 * Uses SHA-256 hashes of both strings to guarantee equal length buffers before timingSafeEqual.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Generic sliding window rate limiter.
 * Returns whether the request is allowed and how many seconds to wait if blocked.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Reset rate limit counter for a specific key upon successful action.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Global rate limiter to defend against distributed PIN brute-force attacks across many IPs.
 */
export function checkGlobalLoginRateLimit(
  maxFailures = 20
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  if (now >= globalLoginTracker.resetAt) {
    globalLoginTracker.failedAttempts = 0;
    globalLoginTracker.resetAt = now + 5 * 60 * 1000;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (globalLoginTracker.failedAttempts >= maxFailures) {
    const retryAfterSeconds = Math.max(1, Math.ceil((globalLoginTracker.resetAt - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Record a failed authentication attempt in the global tracker.
 */
export function recordFailedLoginAttempt(): void {
  const now = Date.now();
  if (now >= globalLoginTracker.resetAt) {
    globalLoginTracker.failedAttempts = 1;
    globalLoginTracker.resetAt = now + 5 * 60 * 1000;
    return;
  }
  globalLoginTracker.failedAttempts += 1;
}

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^[0-9a-fA-F:]+$/;

function isValidIp(ip: string): boolean {
  if (IPV4_REGEX.test(ip)) {
    return true;
  }
  if (IPV6_REGEX.test(ip) && ip.includes(':')) {
    return true;
  }
  return false;
}

/**
 * Extract authentic client IP in Vercel and reverse-proxy environments.
 * Prioritizes trusted edge headers (x-vercel-ip, x-real-ip) over spoofable x-forwarded-for.
 */
export function getClientIp(request: Request): string {
  // 1. Vercel edge authentic IP
  const vercelIp = request.headers.get('x-vercel-ip');
  if (vercelIp && isValidIp(vercelIp.trim())) {
    return vercelIp.trim();
  }

  // 2. Real-IP from trusted reverse proxy
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp && isValidIp(xRealIp.trim())) {
    return xRealIp.trim();
  }

  // 3. Fallback to X-Forwarded-For: check the last hop (appended by closest trusted proxy)
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const hops = xForwardedFor.split(',').map((h) => h.trim()).filter(Boolean);
    const candidate = hops[hops.length - 1];
    if (candidate && isValidIp(candidate)) {
      return candidate;
    }
  }

  return '127.0.0.1';
}

/**
 * Cryptographically random process secret if SESSION_SECRET is not configured in env.
 * Prevents offline forgery attacks based on predictable PINs.
 */
const processFallbackSecret = crypto.randomBytes(32).toString('hex');

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.trim().length >= 16) {
    return secret.trim();
  }
  return processFallbackSecret;
}

export interface SessionPayload {
  authenticated: boolean;
  iat: number;
  exp: number;
}

/**
 * Generates an HMAC-signed session token for the leader session.
 */
export function createLeaderSessionToken(): string {
  const payload: SessionPayload = {
    authenticated: true,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Revokes a leader session token server-side upon logout.
 */
export function revokeLeaderSessionToken(token: string | null | undefined): void {
  if (!token || typeof token !== 'string') {
    return;
  }
  const parts = token.split('.');
  if (parts.length !== 2) {
    return;
  }
  const [payloadB64, signature] = parts;
  try {
    const raw = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(raw) as SessionPayload;
    const expiresAt = payload.exp || Date.now() + 24 * 60 * 60 * 1000;
    revokedTokens.set(signature, expiresAt);
  } catch {
    revokedTokens.set(signature, Date.now() + 24 * 60 * 60 * 1000);
  }
}

/**
 * Verifies an HMAC-signed session token.
 */
export function verifyLeaderSessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [payloadB64, signature] = parts;

  // Check revocation list
  if (revokedTokens.has(signature)) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payloadB64)
    .digest('base64url');

  if (!timingSafeCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const raw = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(raw) as SessionPayload;

    if (!payload.authenticated) {
      return false;
    }

    if (payload.exp < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies if the incoming Next.js Request contains a valid leader session cookie.
 */
export function verifyLeaderRequest(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/qcen_leader_session=([^;]+)/);
  if (!match) {
    return false;
  }
  return verifyLeaderSessionToken(match[1]);
}

/**
 * Verifies that state-changing requests originate from the application itself (CSRF defense).
 */
export function verifyRequestOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin) {
    const referer = request.headers.get('referer');
    if (!referer) {
      return true;
    }
    try {
      const refererHost = new URL(referer).host;
      return !host || refererHost === host;
    } catch {
      return false;
    }
  }

  try {
    const originHost = new URL(origin).host;
    if (host && originHost === host) {
      return true;
    }
    return !host;
  } catch {
    return false;
  }
}

/**
 * Sanitizes input strings: removes control characters, trims, enforces max length,
 * and strips HTML tags recursively to prevent nested tag injection.
 */
export function sanitizeString(val: unknown, maxLength: number): string {
  if (typeof val !== 'string') {
    return '';
  }
  // Strip null bytes and control chars
  const noControl = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  // Iterative tag stripping to prevent nested bypasses
  let cleaned = noControl;
  let prev = '';
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(/<[^>]*>?/gm, '');
  }
  const safe = cleaned.replace(/[<>]/g, '');
  return safe.trim().slice(0, maxLength);
}

/**
 * Sanitizes phone numbers: keeps digits, plus sign, spaces and hyphens.
 */
export function sanitizePhone(val: unknown): string {
  if (typeof val !== 'string') {
    return '';
  }
  const cleaned = val.replace(/[^\d+()\s-]/g, '').trim();
  return cleaned.slice(0, 25);
}

/**
 * Neutralizes CSV Formula Injection (CWE-1236).
 * Checks trimmed content and prepends a single quote if starting with dangerous spreadsheet operators.
 */
export function sanitizeForCsv(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }
  let str = String(val);
  const trimmed = str.trimStart();
  const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r', '%', '|'];
  if (dangerousPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}
