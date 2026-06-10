export function shade(hex, p) {
  let n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + p, g = ((n >> 8) & 255) + p, b = (n & 255) + p;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
export function starStr(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
export function logoHTML(br, cls = 'logo') {
  if (br.logo) return `<img class="${cls}" src="${br.logo}" alt="${br.name}">`;
  return `<div class="${cls}" style="background:linear-gradient(150deg,${br.color},${shade(br.color, -25)})">${br.ini}</div>`;
}
export function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
}
