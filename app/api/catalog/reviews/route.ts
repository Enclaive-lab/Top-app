import { requestApi } from "@/api/catalog";
import { ApiError } from "@/lib/cloud-api";
import { parseReview } from "@/lib/review-validation";
import { apiErrorResponse, getReviewClientKey, readJson } from "@/lib/api-http";

export async function POST(request: Request) {
  try {
    const review = parseReview(await readJson(request));
    if (!review) throw new ApiError(400, "Проверьте поля отзыва.");
    const saved = await requestApi<{ _id: string | number; createdAt: string }>(
      "review/create", { ...review, productId: String(review.productId) }, getReviewClientKey(request),
    );
    return Response.json({ id: String(saved._id), name: review.name, title: review.title,
      text: review.description, rating: review.rating, date: saved.createdAt.slice(0, 10) },
    { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
