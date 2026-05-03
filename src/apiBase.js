const DEFAULT = "http://localhost:5001/api";

export function getNavbatApiBase() {
  let u = String(import.meta.env.VITE_API_URL ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (!u) return DEFAULT;
  if (/\/api$/i.test(u)) return u;
  return `${u}/api`;
}
