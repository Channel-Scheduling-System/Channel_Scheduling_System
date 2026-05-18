
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