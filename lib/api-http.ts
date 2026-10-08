import "server-only";
import { createHmac } from "node:crypto";
import { ApiError } from "./cloud-api";

export async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new ApiError(415, "Нужен JSON.");
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new ApiError(403, "Недопустимый источник запроса.");
  if (Number(request.headers.get("content-length")) > 16384) throw new ApiError(413, "Запрос слишком большой.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Пустой запрос.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 16384) {
      await reader.cancel();
      throw new ApiError(413, "Запрос слишком большой.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError(400, "Неверный JSON.");
  }
}

export function getReviewClientKey(request: Request): string {
  // Vercel overwrites x-forwarded-for; headers on a local server aren't trusted.
  const address = process.env.VERCEL === "1"
    ? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
    : "local";
  const secret = process.env.DATABASE_URL ?? "local-review-limit";
  return createHmac("sha256", secret).update(address).digest("hex");
}

export function apiErrorResponse(error: unknown): Response {
  const status = error instanceof ApiError ? error.status : 503;
  const message = error instanceof ApiError ? error.message : "Сервис временно недоступен.";
  // Never put driver errors/connection strings in responses or console logs.
  return Response.json({ message }, { status, headers: {
    "Cache-Control": "no-store",
    ...(status === 429 ? { "Retry-After": "600" } : {}),
  } });
}
