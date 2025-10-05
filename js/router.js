export function currentPath() {
const hash = window.location.hash || '#/';
try {
const url = new URL(hash.slice(1), window.location.origin);
const path = url.pathname.replace(/\/$/, '') || '/';
return path; // "/", "/c/:slug", "/p/:slug", "/cart"
} catch { return '/'; }
}


export function navigate(path) { if (!path.startsWith('#')) path = `#${path}`; window.location.hash = path; }