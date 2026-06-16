import { Slot } from '../../../shared/types/slots.types.js';
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
        const blockedSlots = blockedTimes
            .filter((bt) => bt.type === 'HOUR' || bt.type === 'DAY')
            .map(mapBlockedTimeToSlot);

        return this.subtractSlotsFromRange(workingRange, blockedSlots);
    }

    subtractOccupiedSlots(
        availableSlots: Slot[],
        occupiedSlots: Slot[],
    ): Slot[] {
        if (occupiedSlots.length === 0) return availableSlots;
        if (availableSlots.length === 0) return [];

        const result: Slot[] = [];
        for (const available of availableSlots) {
            const slotsAfterSubtraction = this.subtractSlotsFromRange(
                available,
                occupiedSlots,
            );
            result.push(...slotsAfterSubtraction);
        }

        return result;
    }

    private subtractSlotsFromRange(range: Slot, slots: Slot[]): Slot[] {
        if (slots.length === 0) return [{ start: range.start, end: range.end }];

        const slotsSorted = slots.toSorted(
            (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
        );
        const mergedBlocked = this.mergeOverlappingSlots(range, slotsSorted);

        return this.calculateRemainingSlots(range, mergedBlocked);
    }

    private mergeOverlappingSlots(range: Slot, slots: Slot[]): Slot[] {
        const merged: Slot[] = [];
        const rangeStart = timeToMinutes(range.start);
        const rangeEnd = timeToMinutes(range.end);

        for (const slot of slots) {
            const slotStart = timeToMinutes(slot.start);
            const slotEnd = timeToMinutes(slot.end);
            // Ignorar slots fuera del rango
            if (slotEnd <= rangeStart || slotStart >= rangeEnd) continue;
            // Recortar slot al rango
            const clippedStart = Math.max(slotStart, rangeStart);
            const clippedEnd = Math.min(slotEnd, rangeEnd);
            // Fusionar con el anterior si se superponen
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

    private calculateRemainingSlots(range: Slot, blockedSlots: Slot[]): Slot[] {
        const available: Slot[] = [];
        let currentStart = range.start;

        for (const blocked of blockedSlots) {
            // Si hay espacio antes de este bloque
            if (timeToMinutes(currentStart) < timeToMinutes(blocked.start)) {
                available.push({
                    start: currentStart,
                    end: blocked.start,
                });
            }
            currentStart = blocked.end;
        }
        // Si hay espacio después del último bloque
        if (timeToMinutes(currentStart) < timeToMinutes(range.end)) {
            available.push({
                start: currentStart,
                end: range.end,
            });
        }

        return available;
    }
}
