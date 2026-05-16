import { BlockedTime, CreateBlockedTimeData } from './availability.types.js';

/**
 * Valida solapamientos entre BlockedTimes
 */
export class BlockedTimeOverlapValidator {
    /**
     * Verifica si dos BlockedTimes se solapan
     */
    overlaps(
        newBlock: CreateBlockedTimeData,
        existingBlock: BlockedTime,
    ): boolean {
        const newStart = new Date(newBlock.startDate);
        const newEnd = newBlock.endDate ? new Date(newBlock.endDate) : newStart;
        const exiStart = existingBlock.startDate;
        const exiEnd = existingBlock.endDate || exiStart;

        // Si no se solapan fechas, no hay conflicto
        if (!this.checkDatesOverlap(newStart, newEnd, exiStart, exiEnd))
            return false;

        // Resolver solapamiento según los tipos
        return this.resolveOverlapByType(
            newBlock,
            existingBlock,
            newStart,
            exiStart,
        );
    }

    /**
     * Resuelve si hay solapamiento según la combinación de tipos
     */
    private resolveOverlapByType(
        newBlock: CreateBlockedTimeData,
        existingBlock: BlockedTime,
        newStart: Date,
        exiStart: Date,
    ): boolean {
        if (newBlock.type === 'HOUR' && existingBlock.type === 'HOUR') {
            return this.checkHourVsHour(newBlock, existingBlock, newStart, exiStart);
        }
        // DAY y PERIOD siempre solapan si las fechas se solapan
        return true;
    }

    /**
     * Valida solapamiento entre dos HOUR (debe ser mismo día + horas se solapan)
     */
    private checkHourVsHour(
        newBlock: CreateBlockedTimeData,
        existingBlock: BlockedTime,
        newStart: Date,
        exiStart: Date,
    ): boolean {
        const sameDay = newStart.toDateString() === exiStart.toDateString();
        if (!sameDay) return false;

        return this.checkHoursOverlap(
            newBlock.startTime || '00:00',
            newBlock.endTime || '23:59',
            this.timeToString(existingBlock.startTime),
            this.timeToString(existingBlock.endTime),
        );
    }

    /**
     * Verifica si dos rangos de fechas se solapan
     */
    private checkDatesOverlap(s1: Date, e1: Date, s2: Date, e2: Date): boolean {
        return s1 <= e2 && e1 >= s2;
    }

    /**
     * Verifica si dos rangos horarios (HH:MM) se solapan
     */
    private checkHoursOverlap(
        st1: string,
        et1: string,
        st2: string,
        et2: string,
    ): boolean {
        return st1 < et2 && et1 > st2;
    }

    /**
     * Convierte un Date (tiempo) a string HH:MM, o devuelve default si es null
     */
    private timeToString(time: Date | null): string {
        if (!time) return '00:00';
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
