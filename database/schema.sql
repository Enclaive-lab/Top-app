-- Separate namespace: never modifies the original API's SQLite or other tables.
CREATE TABLE IF NOT EXISTS owltop_products (
  id bigint PRIMARY KEY CHECK (id > 0),
  body jsonb NOT NULL CHECK (jsonb_typeof(body) = 'object')
);
CREATE INDEX IF NOT EXISTS owltop_products_categories
  ON owltop_products USING gin ((body -> 'categories'));

CREATE TABLE IF NOT EXISTS owltop_pages (
  id bigint PRIMARY KEY CHECK (id > 0),
  alias text UNIQUE NOT NULL,
  body jsonb NOT NULL CHECK (jsonb_typeof(body) = 'object')
);

CREATE TABLE IF NOT EXISTS owltop_reviews (
  id text PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES owltop_products(id),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description text NOT NULL CHECK (length(description) BETWEEN 1 AND 5000),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS owltop_reviews_product ON owltop_reviews(product_id);

-- Hashes only, no plaintext client IPs. One counter per client.
CREATE TABLE IF NOT EXISTS owltop_review_limits (
  client_key text PRIMARY KEY,
  bucket bigint NOT NULL,
  hits integer NOT NULL CHECK (hits BETWEEN 1 AND 5),
  updated_at timestamptz NOT NULL DEFAULT now()
);
