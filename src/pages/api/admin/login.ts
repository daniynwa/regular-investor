import type { APIRoute } from 'astro';
import { login, makeSessionCookie } from '../../../lib/auth.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();
    const token = await login(password);
    if (!token) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': makeSessionCookie(token),
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
