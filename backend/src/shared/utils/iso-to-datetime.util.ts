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
export function dateTimeToIsoTime(
    dateTime: string | null | undefined,
): string | null {
    if (!dateTime) return null;
    if (/^\d{2}:\d{2}$/.test(dateTime)) return dateTime;
    const match = dateTime.match(/T(\d{2}):(\d{2})/);
    if (match) return `${match[1]}:${match[2]}`;
    return null;
}
