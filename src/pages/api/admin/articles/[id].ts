import type { APIRoute } from 'astro';
import { verifySession } from '../../../../lib/auth.js';
import { updateArticle, deleteArticle, getArticleById } from '../../../../lib/queries.js';

export const GET: APIRoute = async ({ request, params }) => {
  const session = await verifySession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });
  const article = await getArticleById(Number(params.id));
  if (!article) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(article), { headers: { 'Content-Type': 'application/json' } });
};

export const PUT: APIRoute = async ({ request, params }) => {
  const session = await verifySession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });
  try {
    const data = await request.json();
    await updateArticle(Number(params.id), data);
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const session = await verifySession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });
  await deleteArticle(Number(params.id));
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
};
