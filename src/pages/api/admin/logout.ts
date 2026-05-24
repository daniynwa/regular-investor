import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../lib/auth.js';

export const POST: APIRoute = async () => {
  const cookies = clearSessionCookie();
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  
  // Use append to ensure multiple Set-Cookie headers are sent properly
  cookies.forEach((c: string) => headers.append('Set-Cookie', c));

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers
  });
};
