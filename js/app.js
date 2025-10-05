import { SHOP_NAME, WA_PHONE, DATA_URL } from "./config.js";
import { cartCount } from "./store/cart.js";
import { currentPath } from "./router.js";
import { HomeView, bindHome } from "./views/home.js";
import { CategoryView } from "./views/Category.js";
import { ProductView, bindProduct } from "./views/Product.js";
import { CartView, bindCart } from "./views/Cart.js";

const app = document.getElementById("app");
const year = document.getElementById("year");
const shopNameEl = document.getElementById("shopName");
const cartBadge = document.getElementById("cartBadge");

year.textContent = new Date().getFullYear();
shopNameEl.textContent = SHOP_NAME;

let PRODUCTS = [];
let CATEGORIES = [];

async function loadProducts() {
  const url = new URL(DATA_URL, location.href).href;
  console.log("[loadProducts] fetching:", url);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Failed to load products.json: ${res.status} ${res.statusText}`
    );
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Expected JSON, got: ${ct}. First 80 chars: ${text.slice(0, 80)}`
    );
  }

  PRODUCTS = await res.json();
}

function setActive(path) {
  document.querySelectorAll("a[data-link]").forEach((a) => {
    const isActive = a.getAttribute("data-route") === path;
    a.classList.toggle("bg-white/15", isActive);
    a.classList.toggle("text-white", isActive);
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

function render() {
  const path = currentPath();
  setActive(path);

  if (path === "/") {
    fadeSwap(HomeView({ products: PRODUCTS, categories: CATEGORIES }), () =>
      bindHome({ products: PRODUCTS })
    );
  } else if (path.startsWith("/c/")) {
    const slug = path.split("/c/")[1];
    const cat = CATEGORIES.find((c) => c.slug === slug);
    if (!cat)
      return fadeSwap(
        `<section class='space-y-3'><h1 class='text-3xl font-bold'>404</h1><p class='text-white/70'>Kategori tidak ditemukan.</p><a href='#/' class='underline'>Kembali</a></section>`
      );
    fadeSwap(CategoryView({ slug, name: cat.name, products: PRODUCTS }));
  } else if (path.startsWith("/p/")) {
    const slug = path.split("/p/")[1];
    const p = PRODUCTS.find((x) => x.slug === slug);
    if (!p)
      return fadeSwap(
        `<section class='space-y-3'><h1 class='text-3xl font-bold'>404</h1><p class='text-white/70'>Produk tidak ditemukan.</p><a href='#/' class='underline'>Kembali</a></section>`
      );
    fadeSwap(ProductView({ p, waPhone: WA_PHONE, shopName: SHOP_NAME }), () =>
      bindProduct({ p })
    );
  } else if (path === "/cart") {
    fadeSwap(
      CartView({ products: PRODUCTS, shopName: SHOP_NAME, waPhone: WA_PHONE }),
      () => bindCart()
    );
  } else {
    fadeSwap(
      `<section class='space-y-3'><h1 class='text-3xl font-bold'>404</h1><p class='text-white/70'>Halaman tidak ditemukan.</p><a href='#/' class='underline'>Kembali</a></section>`
    );
  }

  bumpCart();
}

window.addEventListener('hashchange', render);

(async function start() {
  try {
    await loadProducts();
    render();
  } catch (err) {
    console.error(err);
    document.getElementById('app').innerHTML = `
      <section class="space-y-3">
        <h1 class="text-3xl font-bold">Data gagal dimuat</h1>
        <p class="text-white/70">${err.message}</p>
        <p class="text-white/60 text-sm">Cek path <code>DATA_URL</code> & file <code>data/products.json</code>.</p>
      </section>`;
  }
})();

