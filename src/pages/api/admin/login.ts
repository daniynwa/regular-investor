import type { APIRoute } from 'astro';
import { login, loginWithEmail, makeSessionCookie } from '../../../lib/auth.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Try email + password login (database)
    if (email) {
      const result = await loginWithEmail(email, password);
      if (result.error) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true, user: result.user }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': makeSessionCookie(result.token),
        },
      });
    }

    // Fallback: password-only login (env variable)
    const token = await login(password);
    if (!token) {
      return new Response(JSON.stringify({ error: 'Password salah' }), {
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
