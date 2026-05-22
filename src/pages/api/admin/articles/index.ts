import type { APIRoute } from 'astro';
import { verifySession } from '../../../../lib/auth.js';
import { getAllArticles, createArticle, countArticlesByCategory } from '../../../../lib/queries.js';

export const GET: APIRoute = async ({ request, url }) => {
  const session = await verifySession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const limit = Number(url.searchParams.get('limit') || 50);
  const offset = Number(url.searchParams.get('offset') || 0);

  const [articles, stats] = await Promise.all([
    getAllArticles({ limit, offset }),
    countArticlesByCategory(),
  ]);
  return new Response(JSON.stringify({ articles, stats }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  const session = await verifySession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });

  try {
    const data = await request.json();
    // Auto-generate slug from title if not provided
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 100);
    }
    const result = await createArticle(data);
    return new Response(JSON.stringify({ ok: true, id: (result as any).insertId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
};
