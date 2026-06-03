import { Temporal } from 'temporal-polyfill';

function normalizeDateInput(date: string): string {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00Z` : date;
}

export function isFutureDate(date: string): boolean {
    const normalizedDate = normalizeDateInput(date);
    const localDateTime = Temporal.PlainDateTime.from(
        normalizedDate.replace('Z', ''),
    );
    const instant = localDateTime.toZonedDateTime('America/Bogota').toInstant();
    const now = Temporal.Now.zonedDateTimeISO('America/Bogota').toInstant();
    return Temporal.Instant.compare(instant, now) > 0;
}

export function dateToInstant(date: Date | string): Temporal.Instant {
    if (date instanceof Date) {
        return Temporal.Instant.from(date.toISOString());
    }
    return Temporal.Instant.from(normalizeDateInput(date));
}

export function formatLongDate(date: Date | string): string {
    const zonedDateTime = toBogotaDateTime(date);
    const jsDate = new Date(zonedDateTime.toInstant().epochMilliseconds);
    const formatted = new Intl.DateTimeFormat('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(jsDate);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatTime(date: Date | string): string {
    const zonedDateTime = toBogotaDateTime(date);

    const hour24 = zonedDateTime.hour;
    const minute = String(zonedDateTime.minute).padStart(2, '0');

    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;

    return `${hour12}:${minute} ${period}`;
}

function toBogotaDateTime(date: Date | string): Temporal.ZonedDateTime {
    const normalizedDate = date instanceof Date ? date.toISOString() : date;
    const localDateTime = Temporal.PlainDateTime.from(
        normalizedDate.replace('Z', ''),
    );
    return localDateTime.toZonedDateTime('America/Bogota');
}
