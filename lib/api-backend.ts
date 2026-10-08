import "server-only";

export function usesCloudApi(): boolean {
  const backend = process.env.API_BACKEND ?? (process.env.VERCEL === "1" ? "neon" : "external");
  if (backend !== "neon" && backend !== "external") throw new Error("API_BACKEND должен быть neon или external.");
  return backend === "neon";
}
