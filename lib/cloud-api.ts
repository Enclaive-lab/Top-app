import { randomUUID } from "node:crypto";
import { parseReview } from "./review-validation";

export interface QueryDatabase {
  query(text: string, parameters?: unknown[]): Promise<Record<string, unknown>[]>;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export const supportedApiPaths = /^(product\/find|top-page\/find|top-page\/byAlias\/[a-zA-Z0-9_-]+|review\/byProduct\/\d+|review\/create)$/;

// Same public read/review contract as the course API. No admin/auth/upload proxy.
// Injecting the query interface lets tests use actual Postgres (PGlite) offline.
export function createCloudApi(database: QueryDatabase) {
  return async function request(path: string, body?: unknown, clientKey?: string): Promise<unknown> {
    const fields = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {};
    if (path === "product/find") {
      if (typeof fields.category !== "string" || !fields.category || fields.category.length > 100) throw new ApiError(400, "Неверная категория.");
      const limit = fields.limit ?? 100;
      if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 1000) throw new ApiError(400, "Неверный лимит.");
      const rows = await database.query(`
        SELECT p.body || jsonb_build_object(
          'reviews', COALESCE(r.reviews, '[]'::jsonb),
          'reviewCount', COALESCE(r.count, 0),
          'reviewAvg', r.average
        ) AS body
        FROM owltop_products p
        LEFT JOIN LATERAL (
          SELECT jsonb_agg(jsonb_build_object('_id', id, 'productId', product_id,
            'name', name, 'title', title, 'description', description,
            'rating', rating, 'createdAt', created_at) ORDER BY created_at, id) AS reviews,
            count(*) AS count, avg(rating)::float8 AS average
          FROM owltop_reviews WHERE product_id = p.id
        ) r ON true
        WHERE (p.body -> 'categories') ? $1
        ORDER BY p.id LIMIT $2`, [fields.category, limit]);
      return rows.map(row => row.body);
    }
    if (path === "top-page/find") {
      if (typeof fields.firstCategory !== "number" || !Number.isInteger(fields.firstCategory) || fields.firstCategory < 0 || fields.firstCategory > 3) throw new ApiError(400, "Неверный раздел.");
      const rows = await database.query(`
        SELECT jsonb_build_object('_id', jsonb_build_object('secondCategory', body ->> 'secondCategory'),
          'pages', jsonb_agg(jsonb_build_object('_id', id::text,
          'alias', body ->> 'alias', 'title', body ->> 'title', 'category', body ->> 'category') ORDER BY id)) AS body
        FROM owltop_pages WHERE (body ->> 'firstCategory')::integer = $1
        GROUP BY body ->> 'secondCategory' ORDER BY min(id)`, [fields.firstCategory]);
      return rows.map(row => row.body);
    }
    if (/^top-page\/byAlias\/[a-zA-Z0-9_-]+$/.test(path)) {
      const rows = await database.query("SELECT body FROM owltop_pages WHERE alias = $1", [path.slice("top-page/byAlias/".length)]);
      if (!rows.length) throw new ApiError(404, "Страница не найдена.");
      return rows[0].body;
    }
    if (/^review\/byProduct\/\d+$/.test(path)) {
      const id = Number(path.slice("review/byProduct/".length));
      if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(400, "Неверный товар.");
      const rows = await database.query(`SELECT jsonb_build_object('_id', id, 'productId', product_id,
        'name', name, 'title', title, 'description', description, 'rating', rating, 'createdAt', created_at) AS body
        FROM owltop_reviews WHERE product_id = $1 ORDER BY created_at, id`, [id]);
      return rows.map(row => row.body);
    }
    if (path === "review/create") {
      const review = parseReview(body, "description");
      if (!review) throw new ApiError(400, "Проверьте поля отзыва.");
      if (!clientKey || !/^[a-f0-9]{64}$/.test(clientKey)) throw new ApiError(400, "Неверный запрос отзыва.");
      const exists = await database.query("SELECT id FROM owltop_products WHERE id = $1", [review.productId]);
      if (!exists.length) throw new ApiError(404, "Товар не найден.");
      // The quota and insert are a SINGLE atomic statement, safe under concurrency.
      const rows = await database.query(`
        WITH quota AS (
          INSERT INTO owltop_review_limits (client_key, bucket, hits)
          VALUES ($1, floor(extract(epoch FROM now()) / 600)::bigint, 1)
          ON CONFLICT (client_key) DO UPDATE SET
            hits = CASE WHEN owltop_review_limits.bucket = EXCLUDED.bucket THEN owltop_review_limits.hits + 1 ELSE 1 END,
            bucket = EXCLUDED.bucket, updated_at = now()
          WHERE owltop_review_limits.bucket <> EXCLUDED.bucket OR owltop_review_limits.hits < 5
          RETURNING client_key
        ), saved AS (
          INSERT INTO owltop_reviews (id, product_id, name, title, description, rating)
          SELECT $2, $3, $4, $5, $6, $7 FROM quota RETURNING id, created_at
        ), cleanup AS (
          DELETE FROM owltop_review_limits WHERE updated_at < now() - interval '7 days'
        ) SELECT id AS "_id", created_at AS "createdAt" FROM saved`,
      [clientKey, randomUUID(), review.productId, review.name, review.title, review.description, review.rating]);
      if (!rows.length) throw new ApiError(429, "Слишком много отзывов. Попробуйте через 10 минут.");
      const saved = rows[0];
      return { ...saved, createdAt: new Date(saved.createdAt as string | Date).toISOString() };
    }
    throw new ApiError(404, "Метод API не найден.");
  };
}
