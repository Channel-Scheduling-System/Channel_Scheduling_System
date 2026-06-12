/**
 * @param date Fecha en formato ISO (YYYY-MM-DD)
 * @returns DateTime ISO (YYYY-MM-DDTHH:MM:SSZ)
 */
export function isoDateToDateTime(date: string): string {
    return `${date}T00:00:00Z`;
}

const DUMMY_DATE = '1900-01-01';
/**
 * @param time Tiempo en formato ISO (HH:MM)
 * @returns DateTime ISO (1900-01-01THH:MM:SSZ)
 * @note Prisma maneja DateTime para campos de tiempo, por eso usamos una fecha dummy
 */
export function isoTimeToDateTime(time: string): string {
    return `${DUMMY_DATE}T${time}:00Z`;
}

/**
 * @param dateTime DateTime ISO (YYYY-MM-DDTHH:MM:SSZ)
 * @returns Fecha en formato ISO (YYYY-MM-DD)
 */
export function dateTimeToIsoDate(dateTime: string): string {
    return dateTime.split('T')[0];
}

/**
 * @param dateTime DateTime ISO (YYYY-MM-DDTHH:MM:SSZ)
 * @returns Tiempo en formato ISO (HH:MM)
 */
export function dateTimeToIsoTime(dateTime: string): string {
    const match = /T(\d{2}):(\d{2})/.exec(dateTime);
    return match ? `${match[1]}:${match[2]}` : '00:00';
}

/**
 * @param dateTime DateTime ISO con segundos (YYYY-MM-DDTHH:MM:SSZ)
 * @returns DateTime ISO sin segundos (YYYY-MM-DDTHH:MMZ)
 */
export function stripSecondsFromDateTime(dateTime: Date): string {
    return dateTime.toISOString().replace(':00.000Z', 'Z');
}

/**
 * @param dateTime DateTime ISO (YYYY-MM-DDTHH:MM:SSZ)
 * @returns Minutos desde la medianoche
 */
export function isoDateTimeToMinutes(dateTime: string): number {
    const timePart = dateTime.split('T')[1].replace('Z', '');
    return timeToMinutes(timePart);
}

/**
 * @param time Tiempo en formato ISO (HH:MM)
 * @returns Minutos desde la medianoche
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * @param minutes Minutos desde la medianoche
 * @returns Tiempo en formato HH:MM
 */
export function minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
