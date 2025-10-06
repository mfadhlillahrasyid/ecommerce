import { BASE } from "./config.js";

// Normalisasi BASE: '/ecommerce' -> '/ecommerce' (tanpa trailing slash), '' -> ''
const BASE_NORM = (BASE ? "/" + BASE.replace(/^\/+/, "") : "").replace(
  /\/+$/,
  ""
);

function stripBase(pathname) {
  if (!BASE_NORM) return pathname || "/";
  if (pathname === BASE_NORM) return "/";
  if (pathname.startsWith(BASE_NORM + "/"))
    return pathname.slice(BASE_NORM.length) || "/";
  // di GH Pages, fallback 404.html tetap di bawah /ecommerce, jadi safe default:
  return "/";
}

// Hash Router

export function currentPath() {
  // "#/product/slug" -> "/product/slug"
  let s = location.hash ? location.hash.slice(1) : "/";
  // toleransi: kalau "#/index.html" (dari live server), anggap root
  if (s === "/index.html" || s === "index.html") s = "/";
  if (!s.startsWith("/")) s = "/" + s;
  return s;
}

export function navigate(path) {
  const clean = path.startsWith("/") ? path : "/" + path;
  if (location.hash !== "#" + clean) location.hash = clean;
}

// intercept <a href="/..."> jadi hash (biar no full reload)
export function bindLinkInterceptor() {
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    )
      return;
    if (href.startsWith("/")) {
      e.preventDefault();
      navigate(href);
    }
  });
}

// live server buka "/index.html" → ubah ke "#/"
export function migrateHistoryToHash(base = "") {
  if (location.hash) return;
  let p = location.pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length) || "/";
  if (p === "/index.html" || p === "/index.htm") p = "/";
  location.replace("#" + (p || "/"));
}

// Helper buat bikin href dengan BASE
export function link(path) {
  const clean = path.startsWith("/") ? path : "/" + path;
  return (BASE_NORM || "") + clean;
}
