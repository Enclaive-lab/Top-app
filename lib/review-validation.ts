export interface ReviewInput {
  productId: number;
  name: string;
  title: string;
  description: string;
  rating: number;
}

export function parseReview(input: unknown, textField: "text" | "description" = "text"): ReviewInput | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const fields = input as Record<string, unknown>;
  const productId = typeof fields.productId === "string" || typeof fields.productId === "number" ? Number(fields.productId) : NaN;
  const name = typeof fields.name === "string" ? fields.name.trim() : "";
  const title = typeof fields.title === "string" ? fields.title.trim() : "";
  const description = typeof fields[textField] === "string" ? fields[textField].trim() : "";
  const rating = fields.rating;
  if (!Number.isSafeInteger(productId) || productId <= 0 || !name || name.length > 100 || title.length < 3 || title.length > 200 || description.length < 10 || description.length > 5000 || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return { productId, name, title, description, rating };
}
