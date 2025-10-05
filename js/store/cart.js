const KEY = 'mini-spa-cart-v3';


export const getCart = () => JSON.parse(localStorage.getItem(KEY) || '[]');
export const setCart = (items) => localStorage.setItem(KEY, JSON.stringify(items));
export const cartCount = () => getCart().reduce((a, i) => a + i.qty, 0);


export function addItem(id, qty = 1) {
const items = getCart();
const idx = items.findIndex(i => i.id === id);
if (idx > -1) items[idx].qty += qty; else items.push({ id, qty });
setCart(items);
}


export function updateQty(id, qty) {
const items = getCart();
const idx = items.findIndex(i => i.id === id);
if (idx > -1) {
items[idx].qty = Math.max(1, qty|0);
setCart(items);
}
}


export function removeItem(id) { setCart(getCart().filter(i => i.id !== id)); }
export function clearCart() { setCart([]); }