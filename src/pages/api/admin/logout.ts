import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth.js';

export const POST: APIRoute = async () => {
  const cookies = clearSessionCookie();
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: [
      ['Content-Type', 'application/json'],
      ...cookies.map((c: string): [string, string] => ['Set-Cookie', c]),
    ],
  });
};
