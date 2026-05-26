import { verifySession } from '../../../lib/auth.js';
import { updateSetting } from '../../../lib/queries.js';

export const prerender = false;

export async function PUT({ request }) {
  const session = await verifySession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const data = await request.json();
    
    // Validasi fields
    const fields = [
      'ad_sidebar_image', 'ad_sidebar_link', 'ad_sidebar_active',
      'ad_top_image', 'ad_top_link', 'ad_top_active'
    ];
    
    for (const field of fields) {
      if (data[field] !== undefined) {
        await updateSetting(field, String(data[field]));
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
