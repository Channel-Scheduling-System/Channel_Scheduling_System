export function isoTo12h(iso: string): string {
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) { return ''; }
  const hour = parseInt(match[1], 10);
  const h = hour % 12 || 12;
  return `${h}:${match[2]} ${hour < 12 ? 'am' : 'pm'}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function time12hToIso(baseDate: Date | null, timeValue: string): string {
  if (!baseDate || !timeValue) {
    return '';
  }

  const normalized = timeValue.trim().toLowerCase();
  const match12h = normalized.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  const match24h = normalized.match(/^(\d{1,2}):(\d{2})$/);

  let hours: number;
  let minutes: number;

  if (match12h) {
    hours = Number(match12h[1]);
    minutes = Number(match12h[2]);
    const meridiem = match12h[3].toLowerCase();

    if (meridiem === 'pm' && hours < 12) {
      hours += 12;
    }
    if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }
  } else if (match24h) {
    hours = Number(match24h[1]);
    minutes = Number(match24h[2]);
  } else {
    return '';
  }

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 || hours > 23 ||
    minutes < 0 || minutes > 59
  ) {
    return '';
  }

  // Construir el ISO con valores locales, sin conversión UTC
  const y  = baseDate.getFullYear();
  const mo = String(baseDate.getMonth() + 1).padStart(2, '0');
  const d  = String(baseDate.getDate()).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');

  return `${y}-${mo}-${d}T${hh}:${mm}Z`;
}
