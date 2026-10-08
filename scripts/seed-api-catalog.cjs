/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS import script. */
// Import the preserved catalog through the public API without deleting records.
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const base = (process.env.API_URL || "http://localhost:3000").replace(/\/$/, "");
const sections = { course: "courses", service: "services", book: "books", product: "products" };

function loadFixture(filename) {
  const file = path.join(root, filename);
  const loaded = new Module(file, module);
  loaded.filename = file;
  loaded.paths = module.paths;
  loaded.require = specifier => specifier.startsWith("@/")
    ? loadFixture(`${specifier.slice(2)}.ts`)
    : require(specifier);
  const { outputText } = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  loaded._compile(outputText, file);
  return loaded.exports;
}

async function request(endpoint, body, token) {
  const response = await fetch(`${base}/api/${endpoint}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`${endpoint}: HTTP ${response.status}: ${await response.text()}`);
  return response.json();
}

async function main() {
  const { catalog, categories } = loadFixture("data/catalog.ts");
  const { access_token: token } = await request("auth/login", {
    login: process.env.API_LOGIN || "admin@example.com",
    password: process.env.API_PASSWORD || "admin123",
  });
  if (!token) throw new Error("API did not return an access token.");
  const existing = (await Promise.all(Object.values(sections).map(category => request("product/find", { category, limit: 1000 })))).flat();
  let added = 0;
  let addedReviews = 0;
  for (const item of catalog) {
    let product = existing.find(value => {
      const metadata = value.characteristics?.find(field => field.name === "__owltop");
      return (metadata && JSON.parse(metadata.value).slug === item.slug) || value.title === item.title;
    });
    if (!product) {
      const metadata = { slug: item.slug, provider: item.provider, initials: item.initials, tone: item.tone, image: item.image, discount: item.discount, modules: item.modules };
      product = await request("product/create", {
        image: item.image || "/layout/logo.svg",
        title: item.title,
        link: `http://localhost:3001/catalog/${item.slug}`,
        initialRating: item.rating,
        price: item.price,
        oldPrice: item.price + item.discount,
        credit: item.credit || 0,
        description: item.description,
        advantages: item.advantages,
        disAdvantages: item.disadvantages,
        categories: [sections[item.kind], item.category],
        tags: item.tags,
        characteristics: [...item.features.map(([name, value]) => ({ name, value })), { name: "__owltop", value: JSON.stringify(metadata) }],
      }, token);
      if (!product._id) throw new Error(`Missing ID for ${item.slug}.`);
      added++;
      console.log(`Added ${item.slug} (ID ${product._id})`);
    }
    const reviews = await request(`review/byProduct/${product._id}`);
    for (const review of item.reviews) {
      if (reviews.some(value => value.name === review.name && value.title === review.title && value.description === review.text)) continue;
      // This API stores individual review scores as whole stars.
      await request("review/create", { productId: String(product._id), name: review.name, title: review.title, description: review.text, rating: Math.round(review.rating) });
      addedReviews++;
    }
  }
  const groups = (await Promise.all([0, 1, 2, 3].map(firstCategory => request("top-page/find", { firstCategory })))).flat();
  const aliases = new Set(groups.flatMap(group => group.pages.map(page => page.alias)));
  for (const category of categories) {
    if (aliases.has(category.slug)) continue;
    await request("top-page/create", {
      firstCategory: 0, secondCategory: category.group, alias: category.slug,
      title: `Курсы по ${category.name}`, metaTitle: `Курсы по ${category.name} — OwlTop`,
      metaDescription: category.description, category: category.slug,
      advantages: [], seoText: category.description, tagsTitle: "Получаемые навыки", tags: [category.name],
    }, token);
  }
  console.log(`Import complete: ${added} products, ${addedReviews} reviews added. Existing records preserved.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
