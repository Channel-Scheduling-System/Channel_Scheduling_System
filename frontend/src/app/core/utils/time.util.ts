export function formatTimeTo12h(timeStr: string): string {
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
