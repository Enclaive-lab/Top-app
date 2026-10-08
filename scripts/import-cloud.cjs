const { readFileSync } = require('node:fs');
const { resolve, isAbsolute } = require('node:path');

function json(value, fallback, array = false) {
  const result = value == null ? fallback : JSON.parse(value);
  if (array && !Array.isArray(result)) throw new Error('Invalid array in source database.');
  return result;
}

function date(value) {
  const normalized = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(value)
    ? value.replace(' ', 'T') + 'Z' : value;
  const result = new Date(normalized);
  if (!Number.isFinite(result.getTime())) throw new Error('Invalid date in source database.');
  return result.toISOString();
}

// Read the live WAL consistently, without copying SQLite files or exporting users.
function extractSnapshot(path) {
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    db.exec('BEGIN');
    const products = db.prepare('SELECT * FROM products ORDER BY id').all().map(row => ({
      _id: row.id, image: row.image, title: row.title, link: row.link,
      initialRating: row.initial_rating, price: row.price, oldPrice: row.old_price,
      credit: row.credit, description: row.description, advantages: row.advantages,
      disAdvantages: row.dis_advantages,
      categories: json(row.categories, [], true), tags: json(row.tags, [], true),
      characteristics: json(row.characteristics, [], true),
      createdAt: date(row.created_at), updatedAt: date(row.updated_at),
    }));
    const pages = db.prepare('SELECT * FROM top_pages ORDER BY id').all().map(row => ({
      _id: row.id, firstCategory: row.first_category, secondCategory: row.second_category,
      alias: row.alias, title: row.title, metaTitle: row.meta_title,
      metaDescription: row.meta_description, category: row.category,
      hh: json(row.hh, null), advantages: json(row.advantages, [], true),
      seoText: row.seo_text ?? '', tagsTitle: row.tags_title, tags: json(row.tags, [], true),
      createdAt: date(row.created_at), updatedAt: date(row.updated_at),
    }));
    const reviews = db.prepare('SELECT * FROM reviews ORDER BY id').all().map(row => ({
      id: String(row.id), productId: row.product_id, name: row.name,
      title: row.title, description: row.description, rating: row.rating,
      createdAt: date(row.created_at),
    }));
    db.exec('COMMIT');
    const ids = new Set(products.map(product => product._id));
    for (const record of [...products, ...pages]) {
      if (!Number.isSafeInteger(record._id) || record._id <= 0) throw new Error('Invalid source ID.');
    }
    for (const page of pages) {
      if (!/^[a-zA-Z0-9_-]+$/.test(page.alias) || !Number.isInteger(page.firstCategory) || page.firstCategory < 0 || page.firstCategory > 3) throw new Error('Invalid source page.');
    }
    for (const review of reviews) {
      if (!ids.has(review.productId) || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5
        || !review.name || review.name.length > 100 || !review.title || review.title.length > 200
        || !review.description || review.description.length > 5000) throw new Error('Invalid source review; import stopped without truncation.');
    }
    return { products, pages, reviews };
  } finally {
    db.close();
  }
}

// DO NOTHING is deliberate: reruns must not overwrite cloud edits/new reviews.
function importQueries(snapshot) {
  return [
    ...snapshot.products.map(product => ({
      text: 'INSERT INTO owltop_products (id, body) VALUES ($1, $2::jsonb) ON CONFLICT DO NOTHING',
      parameters: [product._id, JSON.stringify(product)],
    })),
    ...snapshot.pages.map(page => ({
      text: 'INSERT INTO owltop_pages (id, alias, body) VALUES ($1, $2, $3::jsonb) ON CONFLICT DO NOTHING',
      parameters: [page._id, page.alias, JSON.stringify(page)],
    })),
    ...snapshot.reviews.map(review => ({
      text: 'INSERT INTO owltop_reviews (id, product_id, name, title, description, rating, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
      parameters: [review.id, review.productId, review.name, review.title, review.description, review.rating, review.createdAt],
    })),
  ];
}

async function main(args) {
  const allowed = args.every((arg, i) => arg === '--apply' || arg === '--sqlite' || args[i - 1] === '--sqlite');
  const index = args.indexOf('--sqlite');
  if (!allowed || index < 0 || !args[index + 1] || !isAbsolute(args[index + 1])) {
    throw new Error('Usage: npm run cloud:import -- --sqlite "C:/absolute/path/data.db" [--apply] (Node 24+)');
  }
  const snapshot = extractSnapshot(args[index + 1]);
  console.log(JSON.stringify({ mode: args.includes('--apply') ? 'apply' : 'dry-run',
    products: snapshot.products.length, pages: snapshot.pages.length, reviews: snapshot.reviews.length }));
  if (!args.includes('--apply')) return;
  require('@next/env').loadEnvConfig(process.cwd());
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL_UNPOOLED (or direct DATABASE_URL) is required.');
  if (new URL(url).hostname.includes('-pooler')) throw new Error('Use a direct/unpooled connection for migration.');
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(url);
  const schema = readFileSync(resolve(__dirname, '../database/schema.sql'), 'utf8')
    .split(';').map(text => text.trim()).filter(Boolean);
  await sql.transaction(schema.map(text => sql.query(text)));
  await sql.transaction(importQueries(snapshot).map(({ text, parameters }) => sql.query(text, parameters)));
  console.log('Import completed. Existing cloud records and local SQLite were not overwritten.');
}

module.exports = { extractSnapshot, importQueries, main };
if (require.main === module) main(process.argv.slice(2)).catch(error => {
  // A remote driver error can contain credentials: never log it or its stack.
  const safe = error.constructor === Error && !/postgres(?:ql)?:\/\//i.test(error.message)
    && !/password|token/i.test(error.message) ? error.message : 'Cloud import failed. Check database access and schema; secrets are not logged.';
  console.error(safe);
  process.exitCode = 1;
});
