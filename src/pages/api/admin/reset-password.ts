import type { APIRoute } from 'astro';
import { verifySession, resetUserPassword } from '../../../lib/auth.js';

// PUT — reset a user's password
export const PUT: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return new Response(JSON.stringify({ error: 'userId dan newPassword wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Password minimal 6 karakter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await resetUserPassword(userId, newPassword);
    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
