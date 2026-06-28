import "server-only";
import { cookies, headers } from "next/headers";
export { ADMIN_TOKEN_STORAGE_KEY } from "@/lib/admin-token";

/**
 * Token-based admin auth (works through the Caddy preview proxy where
 * cross-domain cookies are unreliable).
 *
 * Flow:
 *   1. Client POSTs {password} to /api/admin/login
 *   2. Server validates against ADMIN_PASSWORD, returns {token: <session-token>}
 *   3. Client stores token in localStorage
 *   4. Client sends token as `Authorization: Bearer <token>` on every admin request
 *   5. Server validates the token via isAdmin() (reads header or falls back to cookie)
 *
 * The token is a simple constant derived from ADMIN_PASSWORD. The real security
 * boundary is the ADMIN_PASSWORD check at login time. In production you'd use a
 * signed JWT or a server-side session store, but for this cost-0 preview setup
 * a constant token is sufficient.
 */

/**
 * Derive the session token from ADMIN_PASSWORD. This way the token is stable
 * across server restarts and doesn't need a separate secret.
 */
function getSessionToken(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return "";
  // Simple, deterministic derivation — not cryptographically strong, but the
  // boundary is the password check at login. We prefix to avoid collisions.
  return "aragal_" + Buffer.from(pwd).toString("base64").slice(0, 24);
}

/**
 * Check whether the current request is from an authenticated admin.
 * Reads the Authorization: Bearer header (primary), falling back to cookies.
 */
export async function isAdmin(): Promise<boolean> {
  const expected = getSessionToken();
  if (!expected) return false;

  // 1. Check Authorization header (primary — works through the Caddy proxy
  //    where cross-domain cookies are unreliable)
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1] === expected) return true;
  }

  // 2. Fall back to cookies (for same-origin requests)
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("aragal_admin_token")?.value;
  if (cookieToken && cookieToken === expected) return true;

  const legacyCookie = cookieStore.get("aragal_admin")?.value;
  if (legacyCookie === "aragal-logged-in") return true;

  return false;
}

/**
 * Synchronous check from an Authorization header string (for route handlers
 * that have direct access to the request).
 */
export function isAdminFromAuthHeader(authHeader: string | null): boolean {
  const expected = getSessionToken();
  if (!expected || !authHeader) return false;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return match[1] === expected;
}

/**
 * Attempt to log in as admin. If `password` matches ADMIN_PASSWORD,
 * returns a session token (and sets a cookie for back-compat).
 */
export async function login(
  password: string
): Promise<{ ok: boolean; token?: string; error?: string }> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { ok: false, error: "ADMIN_PASSWORD no configurado" };
  }
  if (!password || !safeEqual(password, expected)) {
    return { ok: false, error: "Contraseña incorrecta" };
  }
  const token = getSessionToken();
  const cookieStore = await cookies();
  // Set both the token cookie (new) and legacy cookie (back-compat)
  cookieStore.set("aragal_admin_token", token, {
    httpOnly: false, // not needed for header-based auth, but harmless
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  cookieStore.set("aragal_admin", "aragal-logged-in", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true, token };
}

/**
 * Clear the admin cookies (logout). Token-based auth just requires the client
 * to delete its localStorage token.
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("aragal_admin_token", "", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set("aragal_admin", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Constant-time string comparison to mitigate timing attacks.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function passwordMatches(value: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(value, expected);
}
