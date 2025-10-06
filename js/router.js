import { BASE } from './config.js';

function stripBase(pathname) {
  if (!BASE) return pathname || '/';
  return pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : '/';
}

export function currentPath() {
  return stripBase(location.pathname);
}

export function navigate(path) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  history.pushState({}, '', BASE + clean);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Intercept semua klik <a> internal (biar SPA, nggak reload full)
export function bindLinkInterceptor() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    // Skip kalau new tab / download / diberi data-external
    if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-external')) return;

    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) return;        // external domain → biarkan
    if (BASE && !url.pathname.startsWith(BASE)) return; // beda base → biarkan

    // internal → handle SPA
    e.preventDefault();
    const next = stripBase(url.pathname) + url.search + url.hash;
    navigate(next);
  });
}

// Kompabilitas: migrasi hash lama (#/product/...) ke URL baru
export function migrateHashToHistory() {
  if (location.hash.startsWith('#/')) {
    const rest = location.hash.slice(1); // "/product/slug"
    history.replaceState({}, '', BASE + rest);
  }
}
