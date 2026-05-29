export function isoTo12h(iso: string): string {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) { return ''; }
  const hour = parseInt(match[1], 10);
  const h = hour % 12 || 12;
  return `${h}:${match[2]} ${hour < 12 ? 'am' : 'pm'}`;
}
