import { Temporal } from 'temporal-polyfill';

export function isFutureDate(date: string): boolean {
    const dateInstant = Temporal.Instant.from(date);
    const now = Temporal.Now.instant();
    return Temporal.Instant.compare(dateInstant, now) > 0;
}