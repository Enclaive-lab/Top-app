const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve, dirname } = require('node:path');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
const { importQueries } = require('../scripts/import-cloud.cjs');

const modules = new Map();
function loadTs(file) {
  const path = resolve(__dirname, '..', file);
  if (modules.has(path)) return modules.get(path);
  const loaded = { exports: {} };
  modules.set(path, loaded.exports);
  const code = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = name => name === 'server-only' ? {} : name.startsWith('.')
    ? loadTs(resolve(dirname(path), name + '.ts')) : require(name);
  new Function('require', 'module', 'exports', code)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}
const { createCloudApi, ApiError, supportedApiPaths } = loadTs('lib/cloud-api.ts');
const { parseReview } = loadTs('lib/review-validation.ts');
const { readJson, apiErrorResponse } = loadTs('lib/api-http.ts');
const validReview = { productId: '1', name: ' User ', title: ' Great ', description: ' A helpful course! ', rating: 5 };
const client = 'a'.repeat(64);

test('Postgres API: catalog, menu, persistent reviews, quota, safe/idempotent import', async () => {
  const db = new PGlite();
  try {
    await db.exec(readFileSync(resolve(__dirname, '../database/schema.sql'), 'utf8'));
    const snapshot = {
      products: [{ _id: 1, title: 'Course', categories: ['courses', 'design'], initialRating: 4.5 }],
      pages: [{ _id: 1, alias: 'design', category: 'design', firstCategory: 0, secondCategory: 'Design', title: 'Design courses' }],
      reviews: [{ id: '1', productId: 1, name: 'Alice', title: 'Good', description: 'Helpful course', rating: 4, createdAt: '2026-01-01T00:00:00Z' }],
    };
    const seed = async () => db.transaction(async transaction => {
      for (const { text, parameters } of importQueries(snapshot)) await transaction.query(text, parameters);
    });
    await seed();
    const query = { query: async (text, parameters) => (await db.query(text, parameters)).rows };
    const api = createCloudApi(query);
    const products = await api('product/find', { category: 'courses', limit: 10 });
    assert.equal(products.length, 1);
    assert.equal(products[0].reviewCount, 1);
    assert.equal(products[0].reviewAvg, 4);
    assert.equal(products[0].reviews[0]._id, '1');
    assert.deepEqual(await api('product/find', { category: "courses' OR 1=1 --" }), []);
    assert.equal((await api('top-page/find', { firstCategory: 0 }))[0].pages[0].alias, 'design');
    assert.equal((await api('top-page/byAlias/design'))._id, 1);
    await assert.rejects(api('top-page/byAlias/missing'), error => error instanceof ApiError && error.status === 404);
    await assert.rejects(api('auth/login', {}), error => error.status === 404);
    await assert.rejects(api('review/create', { ...validReview, productId: '999' }, client), error => error.status === 404);
    await assert.rejects(api('review/create', { ...validReview, rating: 1.5 }, client), error => error.status === 400);
    await assert.rejects(api('review/create', validReview), error => error.status === 400);
    const result = await api('review/create', validReview, client);
    assert.match(result._id, /^[a-f0-9-]{36}$/);
    assert.ok(Number.isFinite(Date.parse(result.createdAt)));
    const restartedApi = createCloudApi(query);
    const reviews = await restartedApi('review/byProduct/1');
    assert.equal(reviews.length, 2);
    assert.equal(reviews[1].name, 'User');
    assert.equal(reviews[1].description, 'A helpful course!');
    await seed();
    assert.equal((await api('review/byProduct/1')).length, 2, 'repeat import neither duplicates nor removes reviews');
    const concurrent = await Promise.allSettled(Array.from({ length: 6 }, () => api('review/create', validReview, client)));
    assert.equal(concurrent.filter(value => value.status === 'fulfilled').length, 4);
    assert.equal(concurrent.filter(value => value.status === 'rejected' && value.reason.status === 429).length, 2);
    const updated = (await api('product/find', { category: 'courses' }))[0];
    assert.equal(updated.reviewCount, 6);
    assert.equal(updated.reviewAvg, 29 / 6);
    await api('review/create', validReview, 'b'.repeat(64));
    await db.query('UPDATE owltop_review_limits SET bucket = 0 WHERE client_key = $1', [client]);
    await api('review/create', validReview, client);
    assert.equal((await api('review/byProduct/1')).length, 8);
  } finally {
    await db.close();
  }
});

test('review validation and public endpoint allowlist', () => {
  assert.equal(parseReview(null), null);
  assert.equal(parseReview([]), null);
  assert.equal(parseReview({ ...validReview, text: 'short' }), null);
  assert.equal(parseReview({ ...validReview, description: 'x'.repeat(5001) }, 'description'), null);
  assert.equal(parseReview({ ...validReview, rating: '5' }, 'description'), null);
  assert.equal(parseReview({ ...validReview, productId: true }, 'description'), null);
  assert.equal(parseReview(validReview, 'description').productId, 1);
  assert.equal(supportedApiPaths.test('product/find'), true);
  assert.equal(supportedApiPaths.test('review/delete/1'), false);
  assert.equal(supportedApiPaths.test('top-page/byAlias/../../users'), false);
});

test('HTTP review guards reject oversized/invalid/cross-origin data and hide secrets', async () => {
  const request = (body, headers = {}) => new Request('https://site.example/api/catalog/reviews', {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body,
  });
  assert.deepEqual(await readJson(request('{"test":1}')), { test: 1 });
  await assert.rejects(readJson(request('{')), error => error.status === 400);
  await assert.rejects(readJson(request(' '.repeat(16385))), error => error.status === 413);
  await assert.rejects(readJson(request('{}', { Origin: 'https://other.example' })), error => error.status === 403);
  await assert.rejects(readJson(request('{}', { 'Content-Type': 'text/plain' })), error => error.status === 415);
  const hidden = apiErrorResponse(new Error('postgres://user:password@host/db'));
  assert.equal(hidden.status, 503);
  assert.equal((await hidden.text()).includes('password'), false);
  assert.equal(apiErrorResponse(new ApiError(429, 'Wait')).headers.get('Retry-After'), '600');
});
