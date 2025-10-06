const KEY = 'cart-json-shop';

export const getCart = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const setCart = (arr) => {
  localStorage.setItem(KEY, JSON.stringify(arr));
  // emit event biar header update
  window.dispatchEvent(new CustomEvent('cart:changed', { detail: { count: cartCount() } }));
};

export function addItem(id, qty = 1) {
  const k = String(id);
  const arr = getCart();
  const i = arr.findIndex(x => String(x.id) === k);
  if (i > -1) arr[i].qty += qty;
  else arr.push({ id, qty });
  setCart(arr);
}

export function updateQty(id, qty) {
  const k = String(id);
  const arr = getCart();
  const i = arr.findIndex(x => String(x.id) === k);
  if (i > -1) { arr[i].qty = Math.max(1, qty | 0); setCart(arr); }
}

export function removeItem(id) {
  const k = String(id);
  setCart(getCart().filter(x => String(x.id) !== k));
}

export function clearCart() { setCart([]); }

// <-- ini yang wajib buat nge-fix error import
export function cartCount() {
  return getCart().reduce((sum, it) => sum + (it.qty | 0), 0);
}
