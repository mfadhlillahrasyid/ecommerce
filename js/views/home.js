import { fmtIDR } from "../utils/format.js";

export function HomeView({ products, categories }) {
  return `
<section class="space-y-6">
<div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
<div>
<h1 class="text-3xl md:text-4xl font-bold">Produk Pilihan</h1>
<p class="text-white/70">Klik produk untuk detail. Checkout via WhatsApp.</p>
</div>
<div class="relative">
<input id="searchInput" placeholder="Cari produk..." class="w-72 max-w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20" />
<svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" viewBox="0 0 24 24" fill="none"><path d="m21 21-4.3-4.3" stroke="currentColor" stroke-width="1.5"/><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/></svg>
</div>
</div>


<div class="flex flex-wrap gap-2">
${categories
  .map(
    (c) =>
      `<a class="px-3 py-1.5 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10" href="/category/${c.slug}">${c.name} <span class="text-white/40">(${c.count})</span></a>`
  )
  .join("")}
</div>


<div id="productGrid" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
${products
  .map(
    (p) => `
<article class="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
<a class="block" href="/product/${p.slug}">
<div class="aspect-square overflow-hidden bg-white/5">
<img src="${p.image}" alt="${
      p.title
    }" class="w-full h-full object-cover group-hover:scale-[1.02] transition" loading="lazy"/>
</div>
<div class="p-4 space-y-1">
<h3 class="font-semibold line-clamp-1">${p.title}</h3>
<p class="text-white/70 text-sm">${fmtIDR(p.price)}</p>
</div>
</a>
</article>
`
  )
  .join("")}
</div>
</section>`;
}

export function bindHome({ products }) {
  const search = document.getElementById("searchInput");
  const grid = document.getElementById("productGrid");
  if (!search) return;

  function paint(list) {
    grid.innerHTML = list
      .map(
        (p) => `
<article class="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
<a class="block" href="/product/${p.slug}">
<div class="aspect-square overflow-hidden bg-white/5">
<img src="${p.image}" alt="${
          p.title
        }" class="w-full h-full object-cover group-hover:scale-[1.02] transition" loading="lazy"/>
</div>
<div class="p-4 space-y-1">
<h3 class="font-semibold line-clamp-1">${p.title}</h3>
<p class="text-white/70 text-sm">${fmtIDR(p.price)}</p>
</div>
</a>
</article>
`
      )
      .join("");
  }

  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    const filtered = products.filter((p) => p.title.toLowerCase().includes(q));
    paint(filtered);
  });
}
