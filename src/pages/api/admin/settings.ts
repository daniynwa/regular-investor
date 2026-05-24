import type { APIRoute } from 'astro';
import { verifySession } from '../../../lib/auth.js';
import { query } from '../../../lib/db.js';

// GET — fetch all site settings
export const GET: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const rows = await query('SELECT setting_key, setting_value FROM site_settings');
    const settings: Record<string, string> = {};
    (rows as any[]).forEach((row: any) => {
      settings[row.setting_key] = row.setting_value || '';
    });
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
};

// PUT — update site settings
export const PUT: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();

    // Allowed setting keys
    const allowedKeys = [
      'social_facebook', 'social_twitter', 'social_instagram',
      'social_youtube', 'social_telegram',
    ];

    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.includes(key)) {
        await query(
          `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, String(value)]
        );
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
};
