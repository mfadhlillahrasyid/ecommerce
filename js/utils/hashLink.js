// js/utils/hashLink.js
export const h = (path = '/') => '#' + (path.startsWith('/') ? path : '/' + path);
