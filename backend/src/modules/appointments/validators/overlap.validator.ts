import { IAppointmentRepository } from '../appointment.repository.js';
import { IAvailabilityService } from '../../availability/availability.service.js';
import { Slot } from '../../availability/availability.types.js';
import {
    OverlapVerificationResponse,
    Role,
    VerifyOverlapInput,
} from '../appointment.types.js';
import {
    isoDateTimeToDayMinutes,
    timeToMinutes,
} from '../../../shared/utils/times-parser.util.js';
import {
    APPOINTMENT_ERRORS,
    APPOINTMENT_MESSAGES,
} from '../../../shared/constants/messages.js';
import { Temporal } from 'temporal-polyfill';

const MAX_OVERLAPS_ALLOWED = 2;

export class OverlapValidator {
    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly availabilityService: IAvailabilityService,
    ) {}

    async verify(
        input: VerifyOverlapInput,
        role: Role,
    ): Promise<OverlapVerificationResponse> {
        const isWithinAvailableSlots = await this.isWithinAvailableSlots(input);
        const overlapCount =
            role === Role.WORKER
                ? await this.appointmentRepo.countOverlapsByWorker(input)
                : await this.appointmentRepo.countOverlapsByClient(input);

        const overlapInfo = this.buildOverlapInfo(
            isWithinAvailableSlots,
            overlapCount,
        );

        return {
            allowed:
                isWithinAvailableSlots && overlapCount < MAX_OVERLAPS_ALLOWED,
            needsConfirmation:
                isWithinAvailableSlots &&
                overlapCount > 0 &&
                overlapCount < MAX_OVERLAPS_ALLOWED,
            message: overlapInfo,
        };
    }

    private async isWithinAvailableSlots(
        input: VerifyOverlapInput,
    ): Promise<boolean> {
        const startInstant = Temporal.Instant.from(input.startAt);
        const startZoned = startInstant.toZonedDateTimeISO('UTC');

        const availableSlots = await this.availabilityService.getAvailableSlots(
            input.workerId,
            startZoned.toPlainDate().toString(),
        );
        if (!availableSlots) return false;

        return this.isAppointmentInSlots(
            input.startAt,
            input.endAt,
            availableSlots,
        );
    }

    private isAppointmentInSlots(
        start: string,
        end: string,
        availableSlots: Slot[],
    ): boolean {
        const startMinutes = isoDateTimeToDayMinutes(start);
        const endMinutes = isoDateTimeToDayMinutes(end);
        for (const slot of availableSlots) {
            const slotStart = timeToMinutes(slot.start);
            const slotEnd = timeToMinutes(slot.end);

            if (startMinutes >= slotStart && endMinutes <= slotEnd) {
                return true;
            }
        }
        return false;
    }

    private buildOverlapInfo(
        isWithinSlots: boolean,
        overlapCount: number,
    ): string {
        if (!isWithinSlots) return APPOINTMENT_ERRORS.OUT_OF_WORKING_HOURS;
        if (overlapCount === 0) return APPOINTMENT_MESSAGES.CAN_BE_CREATED;
        if (overlapCount >= MAX_OVERLAPS_ALLOWED)
            return APPOINTMENT_ERRORS.MAX_OVERLAPS_ALLOWED;
        return APPOINTMENT_MESSAGES.CONFIRMATION_NEEDED(overlapCount);
    }
}
