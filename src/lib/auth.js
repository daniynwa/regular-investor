const ADMIN_SECRET = import.meta.env.ADMIN_SECRET || 'change_this_secret';
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'admin123';
const COOKIE_NAME = 'ri_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

// Simple HMAC-like token using Web Crypto API
async function createToken(payload) {
  const data = JSON.stringify({ ...payload, ts: Date.now() });
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(ADMIN_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return btoa(JSON.stringify({ data, sig: sigB64 }));
}

async function verifyToken(token) {
  try {
    const { data, sig: sigB64 } = JSON.parse(atob(token));
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(ADMIN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return null;
    const payload = JSON.parse(data);
    // Check token not older than 8 hours
    if (Date.now() - payload.ts > COOKIE_MAX_AGE * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function login(password) {
  if (password !== ADMIN_PASSWORD) return null;
  return createToken({ role: 'admin' });
}

export async function verifySession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}

export function makeSessionCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/admin; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/admin; HttpOnly; Max-Age=0`;
}

export { COOKIE_NAME };
