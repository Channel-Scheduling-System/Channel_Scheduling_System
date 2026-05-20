import { dateTimeToIsoTime } from '../../../shared/utils/iso-to-datetime.util.js';
import { dayOfWeekToNumber } from '../availability.mapper.js';
import {
    BlockedTime,
    CreateBlockedTimeData,
    CreateRecurringTimeOffInput,
} from '../availability.types.js';

/**
 * Valida solapamientos entre BlockedTimes
 * Modelo FLEXIBLE: RECURRING coexiste con DAY/PERIOD (excepciones), pero conflicta con HOUR RECURRING
 */
export class BlockedTimeOverlapValidator {
    overlaps(
        input: CreateBlockedTimeData,
        blockedTimes: BlockedTime[],
    ): boolean {
        for (const block of blockedTimes) {
            if (!this.checkDatesOverlap(input, block)) continue;

            if (input.type === 'HOUR') {
                if (this.checkHourSpecOverlap(input, block)) return true;
                continue;
            }

            if (input.type === 'DAY' || input.type === 'PERIOD')
                return !this.isRecurringHour(block);
        }
        return false;
    }

    overlapsRecurring(
        input: CreateRecurringTimeOffInput,
        blockedTimes: BlockedTime[],
    ): boolean {
        const inputDow = dayOfWeekToNumber[input.dayOfWeek];

        for (const block of blockedTimes) {
            if (block.type !== 'HOUR') continue;
            if (!this.isRecurringHour(block)) continue;
            if (block.dayOfWeek !== inputDow) continue;

            const { startTime, endTime } = this.getBlockTimeRange(block);
            if (
                this.checkHoursOverlap(
                    input.startTime,
                    input.endTime,
                    startTime,
                    endTime,
                )
            ) {
                return true;
            }
        }
        return false;
    }

    private checkDatesOverlap(
        date1: CreateBlockedTimeData,
        date2: BlockedTime,
    ): boolean {
        const start1 = new Date(date1.startDate);
        const end1 = date1.endDate ? new Date(date1.endDate) : start1;
        return (
            start1 <= (date2.endDate || date2.startDate) &&
            end1 >= date2.startDate
        );
    }

    private checkHourSpecOverlap(
        input: CreateBlockedTimeData,
        exiBlock: BlockedTime,
    ): boolean {
        if (this.isRecurringHour(exiBlock)) return false;
        if (exiBlock.type === 'DAY' || exiBlock.type === 'PERIOD') return true;

        const sameDay =
            new Date(input.startDate).toDateString() ===
            exiBlock.startDate.toDateString();
        if (!sameDay) return false;

        const { startTime: exiStart, endTime: exiEnd } =
            this.getBlockTimeRange(exiBlock);
        const inputStart = dateTimeToIsoTime(input.startTime);
        const inputEnd = dateTimeToIsoTime(input.endTime);

        return this.checkHoursOverlap(inputStart, inputEnd, exiStart, exiEnd);
    }

    private checkHoursOverlap(
        st1: string,
        et1: string,
        st2: string,
        et2: string,
    ): boolean {
        return st1 < et2 && et1 > st2;
    }

    private isRecurringHour(block: BlockedTime): boolean {
        return block.type === 'HOUR' && block.dayOfWeek !== null;
    }

    private getBlockTimeRange(block: BlockedTime): {
        startTime: string;
        endTime: string;
    } {
        return {
            startTime: this.timeToString(block.startTime),
            endTime: this.timeToString(block.endTime),
        };
    }

    private timeToString(time: Date | null): string {
        if (!time) return '00:00';
        const match = time.toISOString().match(/T(\d{2}):(\d{2})/);
        return match ? `${match[1]}:${match[2]}` : '00:00';
    }
}
