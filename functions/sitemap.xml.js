const GAS_URL = 'https://script.google.com/macros/s/AKfycbxUwihW8aNDP76Q6m3pU-FQErcWdZW39btbKklAQ1mjaikfJ6UDTV_s7yxn5y3P2YZg/exec?sitemap=1';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function onRequest() {
  try {
    const r = await fetch(GAS_URL, { cf: { cacheTtl: 300 } });
    const data = await r.json();
    const urls = Array.isArray(data.urls) ? data.urls : [];

    const body =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(u => {
        const parts = [`    <loc>${esc(u.loc)}</loc>`];
        if (u.lastmod)    parts.push(`    <lastmod>${esc(u.lastmod)}</lastmod>`);
        if (u.changefreq) parts.push(`    <changefreq>${esc(u.changefreq)}</changefreq>`);
        if (u.priority)   parts.push(`    <priority>${esc(u.priority)}</priority>`);
        return '  <url>\n' + parts.join('\n') + '\n  </url>';
      }).join('\n') +
      '\n</urlset>\n';

    return new Response(body, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new Response('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
