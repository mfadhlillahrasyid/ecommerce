import { BASE } from './config.js';

// Normalisasi BASE: '/ecommerce' -> '/ecommerce' (tanpa trailing slash), '' -> ''
const BASE_NORM = (BASE ? ('/' + BASE.replace(/^\/+/, '')) : '').replace(/\/+$/, '');

function stripBase(pathname) {
  if (!BASE_NORM) return pathname || '/';
  if (pathname === BASE_NORM) return '/';
  if (pathname.startsWith(BASE_NORM + '/')) return pathname.slice(BASE_NORM.length) || '/';
  // di GH Pages, fallback 404.html tetap di bawah /ecommerce, jadi safe default:
  return '/';
}

export function currentPath() {
  return stripBase(location.pathname);
}

export function navigate(path) {
  const clean = path.startsWith('/') ? path : '/' + path;
  history.pushState({}, '', (BASE_NORM || '') + clean);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Intercept <a> internal
export function bindLinkInterceptor() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-external')) return;

    const href = a.getAttribute('href') || '';
    if (!href.startsWith('/')) return; // biarkan tel:, mailto:, #, dll

    const url = new URL(href, location.origin);
    if (url.origin !== location.origin) return;

    // hanya intercept link di dalam BASE
    const inBase = !BASE_NORM
      ? true
      : (url.pathname === BASE_NORM || url.pathname.startsWith(BASE_NORM + '/'));
    if (!inBase) return;

    e.preventDefault();
    const next = stripBase(url.pathname) + url.search + url.hash;
    navigate(next);
  });
}

// Optional: migrate hash lama '#/...' ke History API
export function migrateHashToHistory() {
  if (location.hash.startsWith('#/')) {
    const rest = location.hash.slice(1); // '/product/...'
    history.replaceState({}, '', (BASE_NORM || '') + rest);
  }
}

// Helper buat bikin href dengan BASE
export function link(path) {
  const clean = path.startsWith('/') ? path : '/' + path;
  return (BASE_NORM || '') + clean;
}
