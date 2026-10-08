import { NextResponse } from "next/server";
import { requestApi } from "@/api/catalog";

export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "Неверный формат отзыва." }, { status: 400 });
  }
  if (!input || typeof input !== "object") {
    return NextResponse.json({ message: "Неверный формат отзыва." }, { status: 400 });
  }
  const fields = input as Record<string, unknown>;
  const productId = typeof fields.productId === "string" || typeof fields.productId === "number" ? Number(fields.productId) : NaN;
  const name = typeof fields.name === "string" ? fields.name.trim() : "";
  const title = typeof fields.title === "string" ? fields.title.trim() : "";
  const description = typeof fields.text === "string" ? fields.text.trim() : "";
  const rating = fields.rating;
  if (!Number.isSafeInteger(productId) || productId <= 0 || !name || name.length > 100 || title.length < 3 || title.length > 200 || description.length < 10 || description.length > 5000 || typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Проверьте поля отзыва." }, { status: 400 });
  }
  try {
    const saved = await requestApi<{ _id: string | number; createdAt: string }>("review/create", { productId: String(productId), name, title, description, rating });
    return NextResponse.json({ id: String(saved._id), name, title, text: description, rating, date: saved.createdAt.slice(0, 10) }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Сервис отзывов временно недоступен." }, { status: 502 });
  }
}
