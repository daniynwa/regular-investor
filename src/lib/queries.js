import { query } from './db.js';

// ── Articles ────────────────────────────────────────────────────────────────

export async function getAllArticles({ limit = 100, offset = 0 } = {}) {
  return query(
    `SELECT * FROM articles ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
}

export async function getArticleBySlug(slug) {
  const rows = await query(`SELECT * FROM articles WHERE slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
}

export async function getArticlesByCategory(category, { limit = 50 } = {}) {
  return query(
    `SELECT * FROM articles WHERE category = ? ORDER BY date DESC, id DESC LIMIT ?`,
    [category, limit]
  );
}

export async function getFeaturedArticles(limit = 3) {
  return query(
    `SELECT * FROM articles WHERE featured = 1 ORDER BY date DESC LIMIT ?`,
    [limit]
  );
}

export async function getLatestArticles(limit = 12) {
  return query(
    `SELECT * FROM articles ORDER BY date DESC, id DESC LIMIT ?`,
    [limit]
  );
}

export async function getRelatedArticles(category, excludeSlug, limit = 3) {
  return query(
    `SELECT * FROM articles WHERE category = ? AND slug != ? ORDER BY date DESC LIMIT ?`,
    [category, excludeSlug, limit]
  );
}

export async function searchArticles(keyword, limit = 20) {
  const like = `%${keyword}%`;
  return query(
    `SELECT * FROM articles
     WHERE title LIKE ? OR excerpt LIKE ? OR content LIKE ?
     ORDER BY date DESC LIMIT ?`,
    [like, like, like, limit]
  );
}

// ── Admin CRUD ───────────────────────────────────────────────────────────────

export async function createArticle(data) {
  const { title, excerpt, content, category, tag, date, slug, image, featured, read_time } = data;
  const result = await query(
    `INSERT INTO articles
      (title, excerpt, content, category, tag, date, slug, image, featured, read_time)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, excerpt, content || '', category, tag, date, slug, image, featured ? 1 : 0, read_time || 3]
  );
  return result;
}

export async function updateArticle(id, data) {
  const { title, excerpt, content, category, tag, date, slug, image, featured, read_time } = data;
  return query(
    `UPDATE articles SET
      title=?, excerpt=?, content=?, category=?, tag=?, date=?,
      slug=?, image=?, featured=?, read_time=?, updated_at=NOW()
     WHERE id=?`,
    [title, excerpt, content || '', category, tag, date, slug, image, featured ? 1 : 0, read_time || 3, id]
  );
}

export async function deleteArticle(id) {
  return query(`DELETE FROM articles WHERE id = ?`, [id]);
}

export async function getArticleById(id) {
  const rows = await query(`SELECT * FROM articles WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

export async function countArticles() {
  const rows = await query(`SELECT COUNT(*) as total FROM articles`);
  return rows[0]?.total || 0;
}

export async function countArticlesByCategory() {
  return query(
    `SELECT category, COUNT(*) as total FROM articles GROUP BY category ORDER BY total DESC`
  );
}
