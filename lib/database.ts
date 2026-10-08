import "server-only";
import { neon } from "@neondatabase/serverless";
import { createCloudApi } from "./cloud-api";

let cloudApi: ReturnType<typeof createCloudApi> | undefined;

export function getCloudApi() {
  if (!cloudApi) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("Не подключена облачная база DATABASE_URL.");
    const sql = neon(url);
    cloudApi = createCloudApi({
      query: async (text, parameters = []) => sql.query(text, parameters, {
        fetchOptions: { signal: AbortSignal.timeout(10000), cache: "no-store" },
      }),
    });
  }
  return cloudApi;
}
