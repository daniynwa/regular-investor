import { getAllArticles } from '../lib/queries.js';

export async function GET({ site }) {
  const siteUrl = site ? site.href : 'https://regular-investor.com/';
  
  // 1. Dapatkan rute statis secara otomatis dari folder src/pages
  const pages = import.meta.glob('/src/pages/*.astro');
  const staticRoutes = Object.keys(pages)
    .filter(path => !path.includes('[slug]') && !path.includes('404'))
    .map(path => {
      let route = path.replace('/src/pages/', '').replace('.astro', '');
      return route === 'index' ? '' : route;
    });

  // 2. Ambil semua artikel dari database (limit 5000)
  let articles = [];
  try {
    articles = await getAllArticles({ limit: 5000, offset: 0 });
  } catch (error) {
    console.error("Gagal mengambil artikel untuk sitemap:", error);
    // Fallback ke data statis jika database bermasalah
    try {
      const staticData = await import('../data/articles.js');
      articles = staticData.articles;
    } catch (e) {
      console.error("Gagal memuat fallback data:", e);
    }
  }

  // 3. Gabungkan rute statis dan artikel dinamis ke dalam XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${siteUrl}${route}</loc>
    <changefreq>daily</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${articles.map(article => {
    // Validasi format tanggal
    let lastMod = '';
    try {
      lastMod = new Date(article.date).toISOString();
    } catch (e) {
      lastMod = new Date().toISOString();
    }
    return `
  <url>
    <loc>${siteUrl}${article.slug}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      // Anda dapat menyesuaikan durasi cache. Di sini kita menggunakan 1 jam.
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
