import { connection } from "next/server";
import { requestApi } from "./catalog";
import { ApiError } from "@/lib/cloud-api";
import { TopPageModel } from "@/interfaces/top-page.interface";

export async function getPage(alias: string): Promise<TopPageModel | null> {
  await connection();
  if (!/^[a-zA-Z0-9_-]+$/.test(alias)) return null;
  try {
    return await requestApi<TopPageModel>(`top-page/byAlias/${alias}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
