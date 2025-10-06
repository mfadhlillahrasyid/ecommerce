import { BASE } from '../config.js';
export function link(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`;
}
