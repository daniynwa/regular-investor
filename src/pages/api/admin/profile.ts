import type { APIRoute } from 'astro';
import { verifySession } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

export const PUT: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const data = await request.json();
    const { name, email, phone } = data;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email wajib diisi' }), { status: 400 });
    }

    // Ensure phone column exists (simple migration)
    try {
      await query('ALTER TABLE admin_users ADD COLUMN phone VARCHAR(20) DEFAULT NULL');
    } catch (e) {
      // Column likely already exists
    }

    // Update user
    await query(
      'UPDATE admin_users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name || null, email, phone || null, session.userId]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Gagal memperbarui profil' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
