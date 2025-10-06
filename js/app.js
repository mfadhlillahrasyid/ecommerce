import { SHOP_NAME, WA_PHONE, DATA_URL, HOME } from "./config.js";
import { cartCount } from "./store/cart.js";
import {
  currentPath,
  bindLinkInterceptor,
  migrateHistoryToHash,
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
  if (path === "/") {
    location.replace("#" + HOME);
    return true;
  }
  if (path.startsWith("/p/")) {
    location.replace("#/product/" + path.slice(3));
    return true;
  }
  if (path.startsWith("/c/")) {
    location.replace("#/category/" + path.slice(3));
    return true;
  }
  return false;
}

function ensure(selector, create) {
  let el = document.querySelector(selector);
  if (!el && create) {
    el = create();
    document.head.appendChild(el);
  }
  return el;
}

function setMeta({ title, desc, canonical }) {
  // <title>
  document.title = title ? `${title} | ${SHOP_NAME}` : SHOP_NAME;

  // <meta name="description">
  const md = ensure('meta[name="description"]', () => {
    const m = document.createElement("meta");
    m.setAttribute("name", "description");
    return m;
  });
  md.setAttribute(
    "content",
    (desc || "Work Life Balance adalah brand clothing lokal. Temukan koleksi t-shirt & hoodie premium untuk daily fit. Ready stock, WA checkout.").slice(0, 160)
  );

  // <link rel="canonical"> — karena hash router, canonical ikut hash
  const lc = ensure('link[rel="canonical"]', () => {
    const l = document.createElement("link");
    l.setAttribute("rel", "canonical");
    return l;
  });
  lc.setAttribute(
    "href",
    location.origin + location.pathname + (canonical || location.hash || "#/")
  );
}

function setOG({ title, desc, url, image }) {
  const ensureOG = (name, attr = "property") =>
    ensure(`meta[${attr}="${name}"]`, () => {
      const m = document.createElement("meta");
      m.setAttribute(attr, name);
      return m;
    });
  ensureOG("og:title").setAttribute("content", title || document.title);
  ensureOG("og:description").setAttribute(
    "content",
    (desc || "").slice(0, 160)
  );
  ensureOG("og:type").setAttribute("content", "website");
  ensureOG("og:url").setAttribute("content", url || location.href);
  if (image) ensureOG("og:image").setAttribute("content", image);

  const ensureTw = (name) => ensureOG(name, "name");
  ensureTw("twitter:card").setAttribute(
    "content",
    image ? "summary_large_image" : "summary"
  );
  ensureTw("twitter:title").setAttribute("content", title || document.title);
  ensureTw("twitter:description").setAttribute(
    "content",
    (desc || "").slice(0, 160)
  );
  if (image) ensureTw("twitter:image").setAttribute("content", image);
}

// JSON-LD Product
function setLDProduct(p) {
  let s = document.getElementById("ld-product");
  if (!s) {
    s = document.createElement("script");
    s.id = "ld-product";
    s.type = "application/ld+json";
    document.head.appendChild(s);
  }
  const ld = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.title,
    image: [p.image].filter(Boolean),
    description: p.desc || p.title,
    brand: { "@type": "Brand", name: SHOP_NAME },
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: String(p.price),
      availability: "https://schema.org/InStock",
      url: location.href,
    },
  };
  s.textContent = JSON.stringify(ld);
}
function clearLDProduct() {
  const s = document.getElementById("ld-product");
  if (s) s.remove();
}

function render() {
  const path = currentPath(); // dari router hash kamu
  if (normalizeLegacy(path)) return;

  setActive?.(path); // kalau kamu punya setActive

  if (path === HOME) {
    setMeta({
      title: "Home",
      desc: "Work Life Balance adalah brand clothing lokal. Temukan koleksi t-shirt & hoodie premium untuk daily fit. Ready stock, WA checkout.",
      canonical: "#/",
    });
    setOG({
      title: `${SHOP_NAME} — Catalog`,
      desc: "Streetwear, WA checkout",
      url: location.href,
    });
    clearLDProduct();

    return fadeSwap(
      HomeView({ products: PRODUCTS, categories: CATEGORIES }),
      () => bindHome({ products: PRODUCTS })
    );
  }

  if (path === "/cart") {
    setMeta({
      title: "Cart",
      desc: `Keranjang belanja ${SHOP_NAME}`,
      canonical: "#/cart",
    });
    setOG({
      title: `Cart — ${SHOP_NAME}`,
      desc: "Review pesanan sebelum checkout",
      url: location.href,
    });
    clearLDProduct();

    return fadeSwap(
      CartView({ products: PRODUCTS, shopName: SHOP_NAME, waPhone: WA_PHONE }),
      () =>
        bindCart({ products: PRODUCTS, shopName: SHOP_NAME, waPhone: WA_PHONE })
    );
  }

  if (path.startsWith("/category/")) {
    const slug = decodeURIComponent(path.replace("/category/", ""));
    const cat = CATEGORIES.find((c) => c.slug === slug);
    if (!cat) {
      setMeta({ title: "404", canonical: location.hash });
      setOG({
        title: "404",
        desc: "Kategori tidak ditemukan",
        url: location.href,
      });
      clearLDProduct();
      return fadeSwap(notFound("Kategori tidak ditemukan"));
    }

    setMeta({
      title: `Kategori: ${cat.name}`,
      desc: `Belanja ${cat.name} dari ${SHOP_NAME}.`,
      canonical: `#/category/${cat.slug}`,
    });
    setOG({
      title: `${cat.name} — ${SHOP_NAME}`,
      desc: `Koleksi ${cat.name}`,
      url: location.href,
    });
    clearLDProduct();

    return fadeSwap(CategoryView({ slug, name: cat.name, products: PRODUCTS }));
  }

  if (path.startsWith("/product/")) {
    const slug = decodeURIComponent(path.replace("/product/", ""));
    const p = PRODUCTS.find((x) => x.slug === slug);
    if (!p) {
      setMeta({ title: "404", canonical: location.hash });
      setOG({
        title: "404",
        desc: "Produk tidak ditemukan",
        url: location.href,
      });
      clearLDProduct();
      return fadeSwap(notFound("Produk tidak ditemukan"));
    }

    setMeta({
      title: p.title,
      desc: p.desc || `${p.title} — ${SHOP_NAME}`,
      canonical: `#/product/${p.slug}`,
    });
    setOG({
      title: p.title,
      desc: p.desc || p.title,
      url: location.href,
      image: p.image,
    });
    setLDProduct(p);

    return fadeSwap(
      ProductView({ p, waPhone: WA_PHONE, shopName: SHOP_NAME }),
      () => bindProduct({ p })
    );
  }

  setMeta({
    title: "404",
    desc: "Halaman tidak ditemukan.",
    canonical: location.hash || "#/",
  });
  setOG({ title: "404", desc: "Halaman tidak ditemukan.", url: location.href });
  clearLDProduct();
  return fadeSwap(notFound("Halaman tidak ditemukan"));
}

function notFound(msg) {
  return `<section class='space-y-3'><h1 class='text-3xl font-bold'>404</h1><p class='text-white/70'>${msg}</p><a href='/' class='underline' data-external>Home</a></section>`;
}

bumpCart();

window.addEventListener("hashchange", render);
bindLinkInterceptor();
migrateHistoryToHash("");

(async function start() {
  // kalau belum ada hash, langsung ke home baru
  if (!location.hash) location.replace("#" + HOME);
  // kalau kebetulan #/index.html dari Live Server → anggap root → redirect ke HOME
  if (
    location.hash === "#/index.html" ||
    location.hash === "#index.html" ||
    location.hash === "#/"
  ) {
    location.replace("#" + HOME);
  }
  await loadProducts();
  render();
})();
