import { Slot } from '../availability.types.js';
import { BlockedTime, WorkingHour } from '../availability.types.js';
import {
    mapBlockedTimeToSlot,
    mapWorkingHourToSlot,
} from '../availability.mapper.js';
import {
    minutesToTime,
    timeToMinutes,
} from '../../../shared/utils/times-parser.util.js';

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
            (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
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
            if (timeToMinutes(curStart) < timeToMinutes(bl.start)) {
                available.push({
                    start: curStart,
                    end: bl.start,
                });
            }
            // Actualizar el inicio para después del bloque
            curStart = bl.end;
        }

        // Si hay espacio después del último bloque
        if (timeToMinutes(curStart) < timeToMinutes(working.end)) {
            available.push({
                start: curStart,
                end: working.end,
            });
        }

        return available;
    }

    private mergeOverlappingRanges(working: Slot, blocked: Slot[]): Slot[] {
        const merged: Slot[] = [];
        const workingStart = timeToMinutes(working.start);
        const workingEnd = timeToMinutes(working.end);

        for (const bl of blocked) {
            const blockedStart = timeToMinutes(bl.start);
            const blockedEnd = timeToMinutes(bl.end);

            // Ignorar bloques que no intersectan con el rango de trabajo
            if (blockedEnd <= workingStart || blockedStart >= workingEnd)
                continue;

            // Recortar el bloque al rango de trabajo
            const clippedStart = Math.max(blockedStart, workingStart);
            const clippedEnd = Math.min(blockedEnd, workingEnd);

            if (merged.length > 0) {
                const lastMerged = merged[merged.length - 1];
                const lastEnd = timeToMinutes(lastMerged.end);

                // Si se superpone con el anterior, fusionar
                if (clippedStart <= lastEnd) {
                    lastMerged.end = minutesToTime(
                        Math.max(lastEnd, clippedEnd),
                    );
                    continue;
                }
            }

            merged.push({
                start: minutesToTime(clippedStart),
                end: minutesToTime(clippedEnd),
            });
        }

        return merged;
    }
}
