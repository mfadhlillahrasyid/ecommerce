export const fmtIDR = (n) => new Intl.NumberFormat('id-ID', {
style: 'currency', currency: 'IDR', maximumFractionDigits: 0
}).format(n);