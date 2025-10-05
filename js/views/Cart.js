import { fmtIDR } from '../utils/format.js';
import { getCart, updateQty, removeItem } from '../store/cart.js';


export function CartView({ products, shopName, waPhone }) {
const items = getCart();
const rows = [];
let subtotal = 0;


for (const it of items) {
const p = products.find(x => x.id === it.id);
if (!p) continue;
subtotal += p.price * it.qty;
rows.push(`
<div class="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
<img class="w-16 h-16 rounded-lg object-cover" src="${p.image}" alt="${p.title}"/>
<div class="flex-1 min-w-0">
<div class="flex items-center justify-between gap-2">
<a href="#/p/${p.slug}" class="font-semibold line-clamp-1">${p.title}</a>
<button data-remove="${p.id}" class="text-xs text-white/60 hover:text-white">Hapus</button>
</div>
<div class="mt-1 flex items-center justify-between text-sm text-white/70">
<span>${fmtIDR(p.price)} × ${it.qty}</span>
<div class="inline-flex items-center rounded-xl border border-white/10 overflow-hidden">
<button data-dec="${p.id}" class="px-2 py-1 hover:bg-white/10">−</button>
<input data-qty="${p.id}" type="number" min="1" value="${it.qty}" class="w-12 px-0 py-1 text-center bg-transparent focus:outline-none" />
<button data-inc="${p.id}" class="px-2 py-1 hover:bg-white/10">＋</button>
</div>
</div>
</div>
</div>`);
}


const msgLines = items.map(it => {
const p = products.find(x => x.id === it.id); if (!p) return null;
return `• ${p.title} — ${fmtIDR(p.price)} x ${it.qty}`;
}).filter(Boolean);
const waMsg = encodeURIComponent(`Halo admin ${shopName}, saya ingin checkout:\n\n${msgLines.join('\n')}\n\nSubtotal: ${fmtIDR(subtotal)}\nMetode: WhatsApp`);


return `
<section class="space-y-6">
<h1 class="text-3xl md:text-4xl font-bold">Keranjang</h1>
<div id="cartWrap" class="space-y-4">${rows.join('')}</div>
${items.length === 0 ? `<div class='text-white/60'>Keranjang kosong. <a href='#/' class='underline'>Belanja dulu</a>.</div>` : ''}
${items.length > 0 ? `
<div class="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
<div class="flex items-center justify-between text-sm">
<span>Subtotal</span>
<span id="cartSubtotal" class="text-white/80">${fmtIDR(subtotal)}</span>
</div>
<div class="flex flex-wrap gap-3">
<a id="checkoutWA" href="https://wa.me/${waPhone}?text=${waMsg}" target="_blank" rel="noopener" class="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20 active:scale-[.98] transition">Checkout via WhatsApp</a>
<a href="#/" class="inline-flex items-center justify-center rounded-xl px-4 py-2 border border-white/10 hover:bg-white/10">Lanjut Belanja</a>
</div>
</div>` : ''}
</section>`;
}


export function bindCart() {
const wrap = document.getElementById('cartWrap');
if (!wrap) return;


wrap.addEventListener('click', (e) => {
const dec = e.target.closest('[data-dec]');
const inc = e.target.closest('[data-inc]');
const rm = e.target.closest('[data-remove]');


if (dec) {
const id = dec.getAttribute('data-dec');
const input = wrap.querySelector(`[data-qty="${id}"]`);
input.value = Math.max(1, (+input.value||1) - 1);
input.dispatchEvent(new Event('change'));
}
if (inc) {
const id = inc.getAttribute('data-inc');
const input = wrap.querySelector(`[data-qty="${id}"]`);
input.value = (+input.value||1) + 1;
input.dispatchEvent(new Event('change'));
}
if (rm) {
const id = rm.getAttribute('data-remove');
removeItem(id);
location.reload();
}
});


wrap.addEventListener('change', (e) => {
const qty = e.target.closest('[data-qty]');
if (qty) {
const id = qty.getAttribute('data-qty');
updateQty(id, +qty.value || 1);
location.reload();
}
});
}