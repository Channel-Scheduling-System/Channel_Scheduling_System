import { Slot } from '../../../shared/types/slots.types.js';
import { timeToMinutes } from '../../../shared/utils/times-parser.util.js';
import { mapToSlots } from '../appointment.mapper.js';
import { Appointment } from '../appointment.types.js';

export class SlotCalculator {
    calculateSlots(appointments: Appointment[]): Slot[] {
        const slots = mapToSlots(appointments);
        return this.mergeOverlappingSlots(slots);
    }

    private mergeOverlappingSlots(slots: Slot[]): Slot[] {
        if (slots.length === 0) return [];
        const sortedSlots = slots.toSorted(
            (a, b) => timeToMinutes(a.start) - timeToMinutes(b.start),
        );
        const mergedSlots: Slot[] = [sortedSlots[0]];

        for (let i = 1; i < sortedSlots.length; i++) {
            const currentSlot = sortedSlots[i];
            const lastMergedSlot = mergedSlots.at(-1)!;
            const lastMergedSlotEndMin = timeToMinutes(lastMergedSlot.end);

            if (timeToMinutes(currentSlot.start) <= lastMergedSlotEndMin) {
                lastMergedSlot.end =
                    lastMergedSlotEndMin > timeToMinutes(currentSlot.end)
                        ? lastMergedSlot.end
                        : currentSlot.end;
            } else {
                mergedSlots.push(currentSlot);
            }
        }

        return mergedSlots;
    }
}
