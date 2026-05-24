import { Slot } from '../availability.types.js';
import { BlockedTime, WorkingHour } from '../availability.types.js';
import {
    mapBlockedTimeToSlot,
    mapWorkingHourToSlot,
} from '../availability.mapper.js';

export class SlotCalculator {
    calculateAvailableSlots(
        workingHour: WorkingHour,
        blockedTimes: BlockedTime[],
    ): Slot[] {
        const workingRange = mapWorkingHourToSlot(workingHour);
        const blockedRanges = blockedTimes
            .filter((bt) => bt.type === 'HOUR' || bt.type === 'DAY')
            .map(mapBlockedTimeToSlot);

        const availableSlots = this.subtractBlockedFromSlot(
            workingRange,
            blockedRanges,
        );
        return availableSlots;
    }

    private subtractBlockedFromSlot(working: Slot, blocked: Slot[]): Slot[] {
        if (blocked.length === 0)
            return [{ start: working.start, end: working.end }];

        const sortedBlocked = blocked.sort(
            (a, b) => this.timeToMinutes(a.start) - this.timeToMinutes(b.start),
        );
        // Fusionar bloques superpuestos
        const mergedBlocked = this.mergeOverlappingRanges(
            working,
            sortedBlocked,
        );
        // Calcular slots disponibles entre los bloques
        const available: Slot[] = [];
        let curStart = working.start; // Current

        for (const bl of mergedBlocked) {
            // Si hay espacio antes de este bloque
            if (this.timeToMinutes(curStart) < this.timeToMinutes(bl.start)) {
                available.push({
                    start: curStart,
                    end: bl.start,
                });
            }
            // Actualizar el inicio para después del bloque
            curStart = bl.end;
        }

        // Si hay espacio después del último bloque
        if (this.timeToMinutes(curStart) < this.timeToMinutes(working.end)) {
            available.push({
                start: curStart,
                end: working.end,
            });
        }

        return available;
    }

    private mergeOverlappingRanges(working: Slot, blocked: Slot[]): Slot[] {
        const merged: Slot[] = [];
        const workingStart = this.timeToMinutes(working.start);
        const workingEnd = this.timeToMinutes(working.end);

        for (const bl of blocked) {
            const blockedStart = this.timeToMinutes(bl.start);
            const blockedEnd = this.timeToMinutes(bl.end);

            // Ignorar bloques que no intersectan con el rango de trabajo
            if (blockedEnd <= workingStart || blockedStart >= workingEnd)
                continue;

            // Recortar el bloque al rango de trabajo
            const clippedStart = Math.max(blockedStart, workingStart);
            const clippedEnd = Math.min(blockedEnd, workingEnd);

            if (merged.length > 0) {
                const lastMerged = merged[merged.length - 1];
                const lastEnd = this.timeToMinutes(lastMerged.end);

                // Si se superpone con el anterior, fusionar
                if (clippedStart <= lastEnd) {
                    lastMerged.end = this.minutesToTime(
                        Math.max(lastEnd, clippedEnd),
                    );
                    continue;
                }
            }

            merged.push({
                start: this.minutesToTime(clippedStart),
                end: this.minutesToTime(clippedEnd),
            });
        }

        return merged;
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
}
