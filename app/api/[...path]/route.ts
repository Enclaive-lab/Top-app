import { requestApi } from "@/api/catalog";
import { ApiError, supportedApiPaths } from "@/lib/cloud-api";
import { apiErrorResponse, getReviewClientKey, readJson } from "@/lib/api-http";

type Context = { params: Promise<{ path: string[] }> };

async function handle(request: Request, context: Context) {
  try {
    const path = (await context.params).path.join("/");
    if (!supportedApiPaths.test(path)) throw new ApiError(404, "Метод API не найден.");
    const isPost = path.endsWith("/find") || path === "review/create";
    if (request.method !== (isPost ? "POST" : "GET")) throw new ApiError(405, "Метод не поддерживается.");
    const body = isPost ? await readJson(request) : undefined;
    const data = await requestApi(path, body, path === "review/create" ? getReviewClientKey(request) : undefined);
    return Response.json(data, { status: path === "review/create" ? 201 : 200,
      headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export const GET = handle;
export const POST = handle;
