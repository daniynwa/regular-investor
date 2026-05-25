import { webcrypto } from 'node:crypto';
import { query } from './db.js';

const crypto = webcrypto;

const ADMIN_SECRET = process.env.ADMIN_SECRET || import.meta.env.ADMIN_SECRET || 'change_this_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || import.meta.env.ADMIN_PASSWORD || 'admin123';
const COOKIE_NAME = 'ri_admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

// ── Password Hashing (PBKDF2 via Web Crypto) ───────────────────────────────

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltB64 = btoa(String.fromCharCode(...salt));
  return `${saltB64}:${hashB64}`;
}

async function verifyPassword(password, storedHash) {
  const [saltB64, hashB64] = storedHash.split(':');
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );
  const computedB64 = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return computedB64 === hashB64;
}

// ── Token creation/verification ─────────────────────────────────────────────

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

// ── Login (env password fallback) ───────────────────────────────────────────

export async function login(password) {
  if (password !== ADMIN_PASSWORD) return null;
  return createToken({ role: 'admin', email: 'admin' });
}

// ── Login with email/password (database) ────────────────────────────────────

export async function loginWithEmail(email, password) {
  try {
    const rows = await query(
      'SELECT id, email, password_hash, name, status FROM admin_users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];
    if (!user) return { error: 'Email tidak ditemukan' };
    if (user.status === 'pending') return { error: 'Akun Anda menunggu persetujuan admin' };
    if (user.status === 'disabled') return { error: 'Akun Anda telah dinonaktifkan' };

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return { error: 'Password salah' };

    const token = await createToken({ role: 'admin', email: user.email, name: user.name, userId: user.id });
    return { token, user: { id: user.id, email: user.email, name: user.name } };
  } catch (e) {
    // DB not connected — fallback to env password
    if (password === ADMIN_PASSWORD) {
      const token = await createToken({ role: 'admin', email: email || 'admin' });
      return { token, user: { email: email || 'admin', name: 'Admin' } };
    }
    return { error: 'Database tidak terhubung dan password env salah' };
  }
}

// ── Register ────────────────────────────────────────────────────────────────

export async function registerAdmin(email, password, name) {
  try {
    // Check if email already exists
    const existing = await query('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) return { error: 'Email sudah terdaftar' };

    // First user is auto-activated, subsequent users need approval
    const countRows = await query('SELECT COUNT(*) as total FROM admin_users');
    const isFirst = (countRows[0]?.total || 0) === 0;
    const status = isFirst ? 'active' : 'pending';

    const passwordHash = await hashPassword(password);
    await query(
      'INSERT INTO admin_users (email, password_hash, name, status) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, status]
    );

    return { success: true, status };
  } catch (e) {
    return { error: 'Gagal mendaftarkan akun. Pastikan database terhubung.' };
  }
}

// ── Reset Password ──────────────────────────────────────────────────────────

export async function resetUserPassword(userId, newPassword) {
  try {
    const passwordHash = await hashPassword(newPassword);
    await query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
    return { success: true };
  } catch (e) {
    return { error: 'Gagal mereset password. Pastikan database terhubung.' };
  }
}

// ── Session ─────────────────────────────────────────────────────────────────

export async function verifySession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}

export function makeSessionCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`;
}

export function clearSessionCookie() {
  // Clear both paths — old cookies used Path=/admin, new ones use Path=/
  return [
    `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`,
    `${COOKIE_NAME}=; Path=/admin; HttpOnly; Max-Age=0`,
  ];
}

export { COOKIE_NAME };
