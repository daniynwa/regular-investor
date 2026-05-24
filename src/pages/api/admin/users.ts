import type { APIRoute } from 'astro';
import { verifySession } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

// GET — list all admin users
export const GET: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const rows = await query(
      'SELECT id, email, name, status, created_at FROM admin_users ORDER BY created_at DESC'
    );
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
};

// PUT — update user status (approve/disable)
export const PUT: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { userId, status } = await request.json();

    if (!userId || !['active', 'pending', 'disabled'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await query('UPDATE admin_users SET status = ? WHERE id = ?', [status, userId]);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
};

// DELETE — remove admin user
export const DELETE: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await query('DELETE FROM admin_users WHERE id = ?', [userId]);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
};
