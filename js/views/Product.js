import { fmtIDR } from '../utils/format.js';
import { addItem } from '../store/cart.js';


export function ProductView({ p, waPhone, shopName }) {
const msg = encodeURIComponent(`Halo admin ${shopName}, saya ingin beli:\n\n• ${p.title}\nHarga: ${fmtIDR(p.price)}\nQty: `);
return `
<section class="grid md:grid-cols-2 gap-8">
<div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
<img class="w-full h-full object-cover" src="${p.image}" alt="${p.title}"/>
</div>
<div class="space-y-5">
<div>
<h1 class="text-2xl md:text-3xl font-bold">${p.title}</h1>
<p class="text-white/70 mt-1">${fmtIDR(p.price)} • <a class="underline" href="/category/${p.categorySlug}">${p.category}</a></p>
</div>
<p class="text-white/70">${p.desc || ''}</p>


<div class="flex items-center gap-3">
<label class="text-sm text-white/70">Qty</label>
<div class="inline-flex items-center rounded-xl border border-white/10 overflow-hidden">
<button id="qtyDec" class="px-3 py-2 hover:bg-white/10">−</button>
<input id="qty" type="number" min="1" value="1" class="w-14 px-0 py-2 text-center bg-transparent focus:outline-none" />
<button id="qtyInc" class="px-3 py-2 hover:bg-white/10">＋</button>
</div>
</div>


<div class="flex flex-wrap gap-3">
<button id="addToCart" class="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-white/10 bg-white/10 hover:bg-white/15 active:scale-[.98] transition">Tambah ke Cart</button>
<a id="buyNowWA" href="https://wa.me/${waPhone}?text=${msg}" target="_blank" rel="noopener" class="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 active:scale-[.98] transition">Beli via WhatsApp</a>
</div>


<a href="/" class="text-sm underline">← Kembali</a>
</div>
</section>`;
}


export function bindProduct({ p }) {
const qtyEl = document.getElementById('qty');
document.getElementById('qtyDec').addEventListener('click', () => { qtyEl.value = Math.max(1, (+qtyEl.value||1) - 1); });
document.getElementById('qtyInc').addEventListener('click', () => { qtyEl.value = (+qtyEl.value||1) + 1; });
document.getElementById('addToCart').addEventListener('click', () => {
const qty = Math.max(1, +qtyEl.value || 1);
addItem(p.id, qty);
alert('Ditambahkan ke keranjang.');
});
}