import { connection } from "next/server";
import { requestApi } from "./catalog";
import { MenuItem } from "@/interfaces/menu.interface";

export async function getMenu(firstCategory: number): Promise<MenuItem[]> {
  await connection();
  return requestApi<MenuItem[]>("top-page/find", { firstCategory });
}
