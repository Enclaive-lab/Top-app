import "server-only";
import { cache } from "react";
import { usesCloudApi } from "@/lib/api-backend";
import { connection } from "next/server";
import { categories as categoryDefinitions, type CatalogCategory, type CatalogItem, type CatalogKind } from "@/data/catalog";

interface ApiReview {
  _id: string | number;
  name: string;
  title: string;
  description: string;
  rating: number;
  createdAt: string;
}

interface ApiProduct {
  _id: string | number;
  title: string;
  provider?: string;
  price: number;
  oldPrice?: number;
  credit?: number;
  initialRating: number;
  reviewAvg?: number;
  description: string;
  advantages?: string;
  disAdvantages?: string;
  disadvantages?: string;
  categories: string[];
  tags: string[];
  characteristics: { name: string; value: string }[];
  reviews?: ApiReview[];
}

interface ApiMenuGroup {
  _id: { secondCategory: string };
  pages: { alias: string; title: string; category: string }[];
}

const sectionQueries: { kind: CatalogKind; category: string }[] = [
  { kind: "course", category: "courses" },
  { kind: "service", category: "services" },
  { kind: "book", category: "books" },
  { kind: "product", category: "products" },
];

export async function requestApi<T>(path: string, body?: unknown, clientKey?: string): Promise<T> {
  if (usesCloudApi()) {
    const { getCloudApi } = await import("@/lib/database");
    return await getCloudApi()(path, body, clientKey) as T;
  }
  const base = process.env.NEXT_PUBLIC_DOMAIN;
  if (!base) throw new Error("Не задан адрес API (NEXT_PUBLIC_DOMAIN).");
  const response = await fetch(`${base.replace(/\/$/, "")}/api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    ...(body === undefined ? {} : {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    const { ApiError } = await import("@/lib/cloud-api");
    throw new ApiError(response.status, `API: HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function adaptProduct(product: ApiProduct, kind: CatalogKind, category: string): CatalogItem {
  const encoded = product.characteristics?.find(field => field.name === "__owltop")?.value;
  let presentation: Partial<Pick<CatalogItem, "slug" | "provider" | "initials" | "tone" | "image" | "discount" | "modules">> = {};
  if (encoded) {
    try {
      const parsed: unknown = JSON.parse(encoded);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const fields = parsed as Record<string, unknown>;
        presentation = {
          slug: typeof fields.slug === "string" && /^[a-z0-9-]+$/.test(fields.slug) ? fields.slug : undefined,
          provider: typeof fields.provider === "string" ? fields.provider : undefined,
          initials: typeof fields.initials === "string" ? fields.initials : undefined,
          tone: fields.tone === "purple" || fields.tone === "dark" || fields.tone === "green" || fields.tone === "orange" ? fields.tone : undefined,
          image: typeof fields.image === "string" && /^\/(?!\/)/.test(fields.image) ? fields.image : undefined,
          modules: Array.isArray(fields.modules) ? fields.modules.filter((value): value is string => typeof value === "string") : [],
        };
      }
    } catch { /* External records need no presentation metadata. */ }
  }
  const reviews = (product.reviews ?? []).map(review => ({
    id: String(review._id),
    name: review.name,
    title: review.title,
    text: review.description,
    rating: review.rating,
    date: review.createdAt.slice(0, 10),
  }));
  return {
    apiProductId: String(product._id),
    slug: presentation.slug ?? `api-${product._id}`,
    kind,
    category,
    title: product.title,
    provider: product.provider ?? presentation.provider ?? "",
    initials: presentation.initials ?? "",
    tone: presentation.tone ?? "purple",
    image: presentation.image,
    price: product.price,
    discount: Math.max(0, (product.oldPrice ?? product.price) - product.price),
    credit: product.credit || undefined,
    rating: reviews.length ? (product.reviewAvg ?? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length) : product.initialRating,
    description: product.description,
    tags: product.tags ?? [],
    features: (product.characteristics ?? []).filter(field => field.name !== "__owltop").map(({ name, value }) => [name, value]),
    advantages: product.advantages ?? "",
    disadvantages: product.disAdvantages ?? product.disadvantages ?? "",
    modules: presentation.modules ?? [],
    reviews,
  };
}

// React cache shares this snapshot between layout, metadata and page for one request.
// Fetch remains uncached across requests so database updates appear after refresh.
export const getApiCatalog = cache(async (): Promise<{ items: CatalogItem[]; categories: CatalogCategory[] }> => {
  // Exclude the live API snapshot from build-time rendering, before any catch boundary.
  await connection();
  const [menus, collections] = await Promise.all([
    Promise.all([0, 1, 2, 3].map(firstCategory => requestApi<ApiMenuGroup[]>("top-page/find", { firstCategory }))),
    Promise.all(sectionQueries.map(({ category }) => requestApi<ApiProduct[]>("product/find", { category, limit: 1000 }))),
  ]);
  const categoryMap = new Map<string, CatalogCategory>();
  for (const groups of menus) {
    if (!Array.isArray(groups)) throw new Error("API вернул неверный формат меню.");
    for (const group of groups) {
      for (const page of group.pages) {
        const definition = categoryDefinitions.find(category => category.slug === page.category);
        const name = definition?.name ?? page.title.replace(/^Курсы\s+(?:по\s+)?/i, "");
        categoryMap.set(page.category, {
          slug: page.category,
          name,
          group: definition?.group ?? group._id.secondCategory,
          description: definition?.description ?? `Программы и отзывы по направлению «${name}».`,
        });
      }
    }
  }
  const items = collections.flatMap((products, index) => {
    if (!Array.isArray(products)) throw new Error("API вернул неверный формат каталога.");
    const { kind, category: section } = sectionQueries[index];
    return products.map(product => {
      const category = product.categories.find(value => categoryMap.has(value))
        ?? product.categories.find(value => value !== section) ?? section;
      if (kind === "course" && !categoryMap.has(category)) {
        categoryMap.set(category, {
          slug: category,
          name: category === "golang" ? "Go" : category,
          group: "Программирование",
          description: `Курсы и отзывы по направлению «${category === "golang" ? "Go" : category}».`,
        });
      }
      return adaptProduct(product, kind, category);
    });
  });
  const orderedCategories = Array.from(categoryMap.values()).sort((a, b) => {
    const position = (slug: string) => {
      const index = categoryDefinitions.findIndex(category => category.slug === slug);
      return index < 0 ? categoryDefinitions.length : index;
    };
    return position(a.slug) - position(b.slug);
  });
  return { items: Array.from(new Map(items.map(item => [item.slug, item])).values()), categories: orderedCategories };
});

export function filterCatalog(items: CatalogItem[], query: string): CatalogItem[] {
  const words = query.toLocaleLowerCase("ru").replace(/ё/g, "е").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return items.filter(item => {
    const text = [item.title, item.description, item.provider, ...item.tags].join(" ").toLocaleLowerCase("ru").replace(/ё/g, "е");
    return words.every(word => text.includes(word));
  });
}
