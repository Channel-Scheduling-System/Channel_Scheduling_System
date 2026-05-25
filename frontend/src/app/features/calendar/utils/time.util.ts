import { IRange } from "../interfaces/availability.interface";
export function timeStringToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
export function subtractRanges(range: IRange, claimed: IRange[]): IRange[] {
    let remaining: IRange[] = [range];
    for (const c of claimed) {
        const next: IRange[] = [];
        for (const r of remaining) {
            if (c.end <= r.start || c.start >= r.end) { next.push(r); continue; }
            if (r.start < c.start) next.push({ start: r.start, end: c.start });
            if (r.end > c.end) next.push({ start: c.end, end: r.end });
        }
        remaining = next;
    }
    return remaining;
}
export function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const [hourStr, minuteStr] = parts;
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  const paddedHour = hour.toString().padStart(2, '0');
  return `${paddedHour}:${minuteStr} ${ampm}`;
}