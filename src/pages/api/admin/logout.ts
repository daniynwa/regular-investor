import type { APIRoute } from 'astro';
import { COOKIE_NAME } from '../../../lib/auth.js';

export const POST: APIRoute = async ({ cookies }) => {
  cookies.delete(COOKIE_NAME, { path: '/' });
  cookies.delete(COOKIE_NAME, { path: '/admin' });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
