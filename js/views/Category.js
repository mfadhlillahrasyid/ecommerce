import { fmtIDR } from "../utils/format.js";

export function CategoryView({ slug, name, products }) {
  const list = products.filter((p) => p.categorySlug === slug);
  return `
<section class="space-y-6">
<div class="flex items-end justify-between gap-4">
<div>
<h1 class="text-3xl md:text-4xl font-bold">${name}</h1>
<p class="text-white/70">Kategori: ${name} • ${list.length} produk</p>
</div>
<a href="/" class="text-sm underline">← Semua Produk</a>
</div>
<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
${list
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
