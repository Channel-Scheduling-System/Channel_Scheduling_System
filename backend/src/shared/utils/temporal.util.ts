import { Temporal } from 'temporal-polyfill';

const TIME_ZONE = 'America/Bogota';
const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

export function isFutureDate(date: string): boolean {
    const instant = toZonedDateTime(date).toInstant();
    const now = Temporal.Now.zonedDateTimeISO(TIME_ZONE).toInstant();
    return Temporal.Instant.compare(instant, now) > 0;
}

/**
 * @param date Fecha en formato ISO o un objeto Date
 * @returns Temporal.Instant correspondiente a la fecha dada
 */
export function dateToInstant(date: Date | string): Temporal.Instant {
    const value =
        date instanceof Date ? date.toISOString() : normalizeDate(date);
    return Temporal.Instant.from(value);
}

/**
 * @param date Fecha en formato ISO o un objeto Date
 * @returns Fecha formateada como string ("Lunes, 1 de enero de 2024")
 */
export function formatLongDate(date: Date | string): string {
    const zonedDateTime = toZonedDateTime(date);
    const jsDate = new Date(zonedDateTime.toInstant().epochMilliseconds);
    const formatted = LONG_DATE_FORMATTER.format(jsDate);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * @param date Fecha en formato ISO o un objeto Date
 * @returns Hora formateada como string ("2:30 PM")
 */
export function formatTime(date: Date | string): string {
    const zonedDateTime = toZonedDateTime(date);

    const hour24 = zonedDateTime.hour;
    const minute = String(zonedDateTime.minute).padStart(2, '0');

    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;

    return `${hour12}:${minute} ${period}`;
}

function toZonedDateTime(date: Date | string): Temporal.ZonedDateTime {
    const normalizedDate = date instanceof Date ? date.toISOString() : date;
    const localDateTime = Temporal.PlainDateTime.from(
        normalizedDate.replace('Z', ''),
    );
    return localDateTime.toZonedDateTime(TIME_ZONE);
}

function normalizeDate(date: string): string {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date;
}
