import { BASE } from "./config.js";

// Normalisasi BASE: '/ecommerce' -> '/ecommerce' (tanpa trailing slash), '' -> ''
const BASE_NORM = (BASE ? "/" + BASE.replace(/^\/+/, "") : "").replace(
  /\/+$/,
  ""
);

// Hash Router

export function currentPath() {
  // "#/product/slug" -> "/product/slug"
  let s = location.hash ? location.hash.slice(1) : "/";

  // toleransi: live server/klik salah
  if (s === "/index.html" || s === "index.html") s = "/";
  if (s === "/ecommerce" || s === "/ecommerce/") s = "/";

  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

export function navigate(path) {
  const clean = path.startsWith("/") ? path : "/" + path;
  if (location.hash !== "#" + clean) location.hash = clean;
}

// Intercept <a href="/..."> biar tidak reload penuh
export function bindLinkInterceptor() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";

    // biarkan hash/mail/tel/external
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    )
      return;

    // map absolut home ke hash home
    if (href === "/ecommerce/" || href === "/" || href === "/index.html") {
      e.preventDefault();
      navigate("/");
      return;
    }

    // absolut lain -> jadikan hash
    if (href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  });
}

// Kalau dibuka via /product/... (tanpa hash), ubah ke "#/..."
export function migrateHistoryToHash() {
  if (location.hash) return;
  let p = location.pathname;
  if (p === "/index.html" || p === "/index.htm") p = "/";
  location.replace("#" + (p || "/"));
}

// Helper buat bikin href dengan BASE
export function link(path) {
  const clean = path.startsWith("/") ? path : "/" + path;
  return (BASE_NORM || "") + clean;
}
