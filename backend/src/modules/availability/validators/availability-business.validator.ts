import { Temporal } from 'temporal-polyfill';
import { IUserService } from '../../users/user.service.js';
import { IAvailabilityRepository } from '../availability.repository.js';
import {
    WorkingHourInput,
    BlockedTime,
    CreateRecurringTimeOffInput,
    CreateBlockedTimeData,
} from '../availability.types.js';
import { AVAILABILITY_ERRORS } from '../../../shared/constants/messages.js';
import {
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from '../../../shared/errors/domain.error.js';
import { BlockedTimeOverlapValidator } from './blocked-time-overlap.validator.js';
import { AuthContext } from '../../../shared/utils/request-parser.util.js';

export class AvailabilityBusinessValidator {
    private readonly overlapValidator = new BlockedTimeOverlapValidator();

    constructor(
        private readonly availabilityRepo: IAvailabilityRepository,
        private readonly userService: IUserService,
    ) {}

    async ensureWorkerExists(workerId: number): Promise<void> {
        if (!(await this.userService.existsByIdAndRole(workerId, 'WORKER'))) {
            throw new NotFoundError(AVAILABILITY_ERRORS.WORKER_NOT_FOUND);
        }
    }

    checkUniqueWorkingDays(workingHours: WorkingHourInput[]): void {
        const daysOfWeek = new Set<string>();
        for (const wh of workingHours) {
            if (daysOfWeek.has(wh.dayOfWeek)) {
                throw new ConflictError(
                    AVAILABILITY_ERRORS.DUPLICATE_DAYOFWEEK,
                );
            }
            daysOfWeek.add(wh.dayOfWeek);
        }
    }

    checkFutureDate(date: string): void {
        const dayOffDate = Temporal.PlainDate.from(date);
        const today = Temporal.Now.plainDateISO();
        if (Temporal.PlainDate.compare(dayOffDate, today) < 0)
            throw new ConflictError(AVAILABILITY_ERRORS.DAY_OFF_IN_PAST);
    }

    async checkOverlapping(block: CreateBlockedTimeData): Promise<void> {
        const blocks = await this.availabilityRepo.findBlockedTimesByWorkerId(
            block.workerId,
        );
        if (this.overlapValidator.overlaps(block, blocks)) {
            throw new ConflictError(AVAILABILITY_ERRORS.OVERLAPPING_DAY_OFF);
        }
    }

    async checkOverlappingRecurring(
        block: CreateRecurringTimeOffInput,
    ): Promise<void> {
        const blocks = await this.availabilityRepo.findBlockedTimesByWorkerId(
            block.workerId,
        );
        if (this.overlapValidator.overlapsRecurring(block, blocks)) {
            throw new ConflictError(AVAILABILITY_ERRORS.OVERLAPPING_DAY_OFF);
        }
    }

    validateOwnership(block: BlockedTime, auth: AuthContext): void {
        if (block.workerId !== auth.id) {
            throw new ForbiddenError(AVAILABILITY_ERRORS.OWNER_MISMATCH);
        }
    }

    validateCanView(workerId: number, auth: AuthContext): void {
        if (workerId !== auth.id) {
            throw new ForbiddenError(AVAILABILITY_ERRORS.CANNOT_VIEW);
        }
    }
}
