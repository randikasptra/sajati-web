import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const html = readFileSync(resolve(root, ".next/server/app/index.html"), "utf8");
const routes = JSON.parse(
  readFileSync(resolve(root, ".next/server/app/page/app-paths-manifest.json"), "utf8"),
);

if (
  routes["/page"] !== "app/page.js" ||
  !html.includes("Dari sampah terpilah") ||
  !html.includes("SAJATI_Logo.png") ||
  html.includes("To get started")
) {
  throw new Error("Build route / tidak menampilkan landing page SAJATI.");
}

console.log("Route / menghasilkan landing page SAJATI.");
