import { SHOP_NAME, WA_PHONE, DATA_URL } from "./config.js";
import { cartCount } from "./store/cart.js";
import {
  currentPath,
  navigate,
  bindLinkInterceptor,
  migrateHashToHistory,
} from "./router.js";
import { HomeView, bindHome } from "./views/home.js";
import { CategoryView } from "./views/Category.js";
import { ProductView, bindProduct } from "./views/Product.js";
import { CartView, bindCart } from "./views/Cart.js";

const app = document.getElementById("app");
const year = document.getElementById("year");
const shopNameEl = document.getElementById("shopName");
const cartBadge = document.getElementById("cartBadge");
const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

year.textContent = new Date().getFullYear();
shopNameEl.textContent = SHOP_NAME;

let PRODUCTS = [];
let CATEGORIES = [];

async function loadProducts() {
  // paksa no-cache di GitHub Pages
  const url = new URL(DATA_URL, location.href);
  url.searchParams.set("v", Date.now().toString().slice(0, 10)); // cache-bust ringan

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok)
    throw new Error(
      `Load products.json gagal: ${res.status} ${res.statusText}`
    );

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Expected JSON, got: ${ct}. First 80: ${text.slice(0, 80)}`
    );
  }

  PRODUCTS = await res.json();

  // Normalisasi kategori: kalau categorySlug kosong/salah, generate dari category
  for (const p of PRODUCTS) {
    p.category = (p.category || "").trim();
    p.categorySlug = slugify(p.categorySlug || p.category);
  }

  // Build daftar kategori dari produk (unik + count)
  const map = new Map();
  for (const p of PRODUCTS) {
    const key = p.categorySlug;
    const prev = map.get(key) || {
      slug: key,
      name: p.category || key,
      count: 0,
    };
    prev.count += 1;
    map.set(key, prev);
  }
  CATEGORIES = Array.from(map.values());

  // Debug (cek di Console apakah 't-shirt' ada)
  console.log("CATEGORIES:", CATEGORIES);
}

function setActive(path) {
  document.querySelectorAll("a[data-link]").forEach((a) => {
    const route = a.getAttribute("data-route");
    const active = route === path;
    a.classList.toggle("bg-white/15", active);
    a.classList.toggle("text-white", active);
  });
}

function fadeSwap(html, after) {
  app.style.opacity = 0;
  setTimeout(() => {
    app.innerHTML = html;
    requestAnimationFrame(() => (app.style.opacity = 1));
    after && after();
  }, 120);
}

function bumpCart() {
  const count = cartCount();
  if (count > 0) {
    cartBadge.textContent = count;
    cartBadge.classList.remove("hidden");
  } else cartBadge.classList.add("hidden");
}

function normalizeLegacy(path) {
  // Alias lama → baru
  if (path.startsWith("/p/")) {
    const rest = path.slice(3); // setelah "/p/"
    navigate("/product/" + rest);
    return true;
  }
  if (path.startsWith("/c/")) {
    const rest = path.slice(3);
    navigate("/category/" + rest);
    return true;
  }
  return false;
}

function setMeta({ title, desc, canonical }) {
  // <title>
  document.title = title ? `${title} · ${SHOP_NAME}` : SHOP_NAME;

  // <meta name="description">
  let md = document.querySelector('meta[name="description"]');
  if (!md) {
    md = document.createElement("meta");
    md.setAttribute("name", "description");
    document.head.appendChild(md);
  }
  md.setAttribute(
    "content",
    (desc || "Katalog WLBA. WhatsApp checkout.").slice(0, 160)
  );

  // <link rel="canonical">
  let lc = document.querySelector('link[rel="canonical"]');
  if (!lc) {
    lc = document.createElement("link");
    lc.rel = "canonical";
    document.head.appendChild(lc);
  }
  // Karena pakai hash routing, canonical ikut hash
  lc.href =
    location.origin + location.pathname + (canonical || location.hash || "#/");
}

function setOG({ title, desc, url, image }) {
  const ensure = (name, attr = "property") => {
    let m = document.querySelector(`meta[${attr}="${name}"]`);
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute(attr, name);
      document.head.appendChild(m);
    }
    return m;
  };
  ensure("og:title").setAttribute("content", title || document.title);
  ensure("og:description").setAttribute("content", (desc || "").slice(0, 160));
  ensure("og:type").setAttribute("content", "website");
  ensure("og:url").setAttribute("content", url || location.href);
  if (image) ensure("og:image").setAttribute("content", image);

  ensure("twitter:card", "name").setAttribute(
    "content",
    image ? "summary_large_image" : "summary"
  );
  ensure("twitter:title", "name").setAttribute(
    "content",
    title || document.title
  );
  ensure("twitter:description", "name").setAttribute(
    "content",
    (desc || "").slice(0, 160)
  );
  if (image) ensure("twitter:image", "name").setAttribute("content", image);
}

function render() {
  const path = currentPath();
  if (normalizeLegacy(path)) return;

  setActive(path);

  if (path === "/") {
    // setMeta / setOG optional
    fadeSwap(HomeView({ products: PRODUCTS, categories: CATEGORIES }), () =>
      bindHome({ products: PRODUCTS })
    );
  } else if (path.startsWith("/category/")) {
    const slug = path.replace("/category/", "");
    const cat = CATEGORIES.find((c) => c.slug === slug);
    if (!cat) return fadeSwap(notFound("Kategori tidak ditemukan"));
    fadeSwap(CategoryView({ slug, name: cat.name, products: PRODUCTS }));
  } else if (path.startsWith("/product/")) {
    const slug = path.replace("/product/", "");
    const p = PRODUCTS.find((x) => x.slug === slug);
    if (!p) return fadeSwap(notFound("Produk tidak ditemukan"));
    fadeSwap(ProductView({ p, waPhone: WA_PHONE, shopName: SHOP_NAME }), () =>
      bindProduct({ p })
    );
  } else if (path === "/cart") {
    fadeSwap(
      CartView({ products: PRODUCTS, shopName: SHOP_NAME, waPhone: WA_PHONE }),
      () => bindCart()
    );
  } else {
    fadeSwap(notFound("Halaman tidak ditemukan"));
  }

  bumpCart();
}

function notFound(msg) {
  return `<section class='space-y-3'><h1 class='text-3xl font-bold'>404</h1><p class='text-white/70'>${msg}</p><a href='/' class='underline' data-external>Home</a></section>`;
}

window.addEventListener("popstate", render);
bindLinkInterceptor();
migrateHashToHistory();

(async function start() {
  await loadProducts();
  render();
})();
