/**
 * Convierte una fecha ISO (YYYY-MM-DD) a DateTime ISO (YYYY-MM-DDTHH:MM:SSZ)
 */
export function isoDateToDateTime(date: string): string {
    return `${date}T00:00:00Z`;
}

/**
 * Convierte un tiempo ISO (HH:MM) a DateTime ISO (1900-01-01THH:MM:SSZ)
 * Prisma maneja DateTime para campos de tiempo, por eso usamos una fecha dummy
 */
export function isoTimeToDateTime(time: string): string {
    return `1900-01-01T${time}:00Z`;
}

/**
 * Convierte DateTime ISO a formato ISO de fecha (YYYY-MM-DD)
 * Ejemplo: "2026-05-15T00:00:00Z" → "2026-05-15"
 */
export function dateTimeToIsoDate(dateTime: string): string {
    return dateTime.split('T')[0];
}

/**
 * Convierte DateTime ISO a formato ISO de tiempo (HH:MM)
 * Ejemplo: "1900-01-01T14:30:00Z" → "14:30"
 * Extrae directamente del string sin Date object para evitar problemas de zona horaria.
 */
export function dateTimeToIsoTime(dateTime: string | null | undefined): string {
    if (!dateTime) return '00:00';
    if (/^\d{2}:\d{2}$/.test(dateTime)) return dateTime;
    const match = dateTime.match(/T(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : '00:00';
}

/**
 * Convierte un DateTime ISO con segundos (YYYY-MM-DDTHH:MM:SSZ) a DateTime ISO sin segundos (YYYY-MM-DDTHH:MMZ)
 * Ejemplo: "2026-05-15T14:30:00Z" → "2026-05-15T14:30Z"
 */
export function dateTimeToIsoDateTimeWithoutSeconds(dateTime: Date): string {
    return dateTime.toISOString().replace(':00.000Z', 'Z');
}

export function isoDateTimeToDayMinutes(dateTime: string): number {
    const timePart = dateTime.split('T')[1].replace('Z', '');
    const [hours, minutes] = timePart.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convierte un tiempo en formato HH:MM a minutos desde la medianoche
 * Ejemplo: "14:30" → 870
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Convierte minutos desde la medianoche a formato HH:MM
 * Ejemplo: 870 → "14:30"
 */
export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
