import { IAppointmentRepository } from './appointment.repository.js';
import { IUserService } from '../users/user.service.js';
import { IServiceService } from '../services/service.service.js';
import { IAvailabilityService } from '../availability/availability.service.js';
import { AppointmentDomainService } from './appointment-domain.service.js';
import { AppointmentFiltersProcessor } from './util/appointment-filters.proccesor.js';
import {
    CreateAppointmentInput,
    CreateAppointmentResponse,
    Role,
    OverlapVerificationInput,
    OverlapVerificationResponse,
    ExtendedAppointmentResponse,
    AppointmentHistoryFilter,
    PaginatedAppointmentResponse,
    AppointmentCalendarResponse,
    ApppointmentCalendarFilter,
    Status,
    CancelAppointmentInput,
    ChangeAppointmentStatusInput,
    AppointmentCountFilter,
} from './appointment.types.js';
import {
    mapToAppointmentData,
    mapToAppointmentExtendedResponse,
    mapToCreateAppointmentResponse,
    mapToNotifyAppointmentResponse,
    mapToVerifyOverlapInput,
} from './appointment.mapper.js';
import { Slot } from '../../shared/types/slots.types.js';
import { AuthContext } from '../../shared/utils/request-parser.util.js';
import { ConflictError } from '../../shared/errors/domain.error.js';
import { APPOINTMENT_ERRORS } from '../../shared/constants/messages.js';
import { AppointmentNotifier } from './util/appointment.notifier.js';

export interface IAppointmentService {
    verifyOverlap(
        input: OverlapVerificationInput,
    ): Promise<OverlapVerificationResponse>;
    add(
        input: CreateAppointmentInput,
        auth: AuthContext,
    ): Promise<CreateAppointmentResponse>;
    getById(
        id: number,
        auth: AuthContext,
    ): Promise<ExtendedAppointmentResponse>;
    getSlots(workerId: number, date: string): Promise<Slot[]>;
    getHistory(
        filters: AppointmentHistoryFilter,
        auth: AuthContext,
    ): Promise<PaginatedAppointmentResponse>;
    getCalendar(
        filters: ApppointmentCalendarFilter,
        auth: AuthContext,
    ): Promise<AppointmentCalendarResponse>;
    getCount(
        auth: AuthContext,
        filter: AppointmentCountFilter,
    ): Promise<number>;
    approve(id: number, auth: AuthContext): Promise<void>;
    reject(id: number, auth: AuthContext): Promise<void>;
    cancel(input: CancelAppointmentInput, auth: AuthContext): Promise<void>;
    changeStatus(
        input: ChangeAppointmentStatusInput,
        auth: AuthContext,
    ): Promise<void>;
}

export class AppointmentService implements IAppointmentService {
    private readonly appointmentDomain: AppointmentDomainService;
    private readonly filtersProcessor: AppointmentFiltersProcessor;
    private readonly notifier = new AppointmentNotifier();

    constructor(
        private readonly appointmentRepo: IAppointmentRepository,
        private readonly userService: IUserService,
        private readonly serviceService: IServiceService,
        private availabilityService: () => IAvailabilityService,
    ) {
        this.appointmentDomain = new AppointmentDomainService(
            appointmentRepo,
            userService,
            serviceService,
            availabilityService,
        );
        this.filtersProcessor = new AppointmentFiltersProcessor(
            appointmentRepo,
        );
    }

    async verifyOverlap(
        input: OverlapVerificationInput,
    ): Promise<OverlapVerificationResponse> {
        return await this.appointmentDomain.verifyOverlaps(
            mapToVerifyOverlapInput(input),
        );
    }

    async add(
        input: CreateAppointmentInput,
        auth: AuthContext,
    ): Promise<CreateAppointmentResponse> {
        const workerId = input.workerId;
        const clientId = input.clientId;

        await this.appointmentDomain.ensureWorkerExists(workerId);
        await this.appointmentDomain.ensureClientExists(clientId);
        await this.appointmentDomain.ensureServicesExist(input.services);
        this.appointmentDomain.checkCreator(auth, workerId, clientId);
        this.appointmentDomain.checkFutureDate(input.startAt);
        await this.appointmentDomain.ensureNoOverlaps(
            mapToVerifyOverlapInput(input),
            auth.role as Role,
        );

        const appointmentData = mapToAppointmentData(input, auth.role as Role);
        const appointment = await this.appointmentRepo.create(appointmentData);
        await this.sendAddedNotifications(appointment.id, input.notes);

        return mapToCreateAppointmentResponse(appointment);
    }

    async getById(
        id: number,
        auth: AuthContext,
    ): Promise<ExtendedAppointmentResponse> {
        const apm =
            await this.appointmentDomain.getExtendedAppointmentOrFail(id);
        this.appointmentDomain.checkOwnership(auth, apm.workerId, apm.clientId);
        return mapToAppointmentExtendedResponse(apm);
    }

    async getSlots(workerId: number, date: string): Promise<Slot[]> {
        await this.appointmentDomain.ensureWorkerExists(workerId);
        return await this.appointmentDomain.getSlots(workerId, date);
    }

    async getHistory(
        filter: AppointmentHistoryFilter,
        auth: AuthContext,
    ): Promise<PaginatedAppointmentResponse> {
        await this.validateAndNormalizeFilters(filter, auth);
        return await this.filtersProcessor.processHistoryFilters(filter);
    }

    async getCalendar(
        filter: ApppointmentCalendarFilter,
        auth: AuthContext,
    ): Promise<AppointmentCalendarResponse> {
        await this.validateAndNormalizeFilters(filter, auth);
        return await this.filtersProcessor.processCalendarFilters(
            filter,
            auth.role as Role,
        );
    }

    async getCount(
        auth: AuthContext,
        filter: AppointmentCountFilter,
    ): Promise<number> {
        if (auth.role === Role.WORKER) filter.workerId = auth.id;
        if (auth.role === Role.CLIENT) filter.clientId = auth.id;
        return await this.appointmentRepo.count(filter);
    }

    async approve(id: number, auth: AuthContext): Promise<void> {
        const apm = await this.appointmentDomain.getNotifyAppointmentOrFail(id);

        this.appointmentDomain.checkStatusChangeAuthorship(auth, apm.workerId);
        if (apm.status !== Status.PENDING)
            throw new ConflictError(APPOINTMENT_ERRORS.STATUS_MISMATCH);
        this.appointmentDomain.checkExpiredDate(apm.startAt.toISOString());

        await this.appointmentDomain.ensureNoOverlaps(
            mapToVerifyOverlapInput(apm),
            auth.role as Role,
        );

        await this.appointmentRepo.updateStatus(id, Status.SCHEDULED);
        await this.notifier.sendApprovedNotification(
            mapToNotifyAppointmentResponse(apm),
        );
    }

    async reject(id: number, auth: AuthContext): Promise<void> {
        const apm = await this.appointmentDomain.getNotifyAppointmentOrFail(id);

        this.appointmentDomain.checkStatusChangeAuthorship(auth, apm.workerId);
        if (apm.status !== Status.PENDING)
            throw new ConflictError(APPOINTMENT_ERRORS.STATUS_MISMATCH);

        await this.appointmentRepo.updateStatus(id, Status.REJECTED);
        await this.notifier.sendRejectedNotification(
            mapToNotifyAppointmentResponse(apm),
        );
    }

    async cancel(
        input: CancelAppointmentInput,
        auth: AuthContext,
    ): Promise<void> {
        const apm = await this.appointmentDomain.getNotifyAppointmentOrFail(
            input.id,
        );

        this.appointmentDomain.checkOwnership(auth, apm.clientId, apm.workerId);
        this.validateCancelTransition(auth.role as Role, apm.status);

        await this.appointmentRepo.updateStatus(input.id, Status.CANCELLED);
        await this.notifier.sendCancelledNotification(
            mapToNotifyAppointmentResponse(apm),
            auth.role as Role,
            input.reason,
        );
    }

    async changeStatus(
        input: ChangeAppointmentStatusInput,
        auth: AuthContext,
    ): Promise<void> {
        const apm = await this.appointmentDomain.getNotifyAppointmentOrFail(
            input.id,
        );
        this.appointmentDomain.checkStatusChangeAuthorship(auth, apm.workerId);
        await this.appointmentRepo.updateStatus(input.id, input.status);
    }

    private async sendAddedNotifications(id: number, notes?: string) {
        const apm = await this.appointmentDomain.getNotifyAppointmentOrFail(id);
        if (apm.status === Status.SCHEDULED)
            await this.notifier.sendScheduledNotification(
                mapToNotifyAppointmentResponse(apm),
                notes,
            );
        else if (apm.status === Status.PENDING)
            await this.notifier.sendRequestedNotification(
                mapToNotifyAppointmentResponse(apm),
            );
    }

    private async validateAndNormalizeFilters(
        filter: {
            workerId?: number;
            clientId?: number;
        },
        auth: AuthContext,
    ): Promise<void> {
        if (auth.role === Role.WORKER) filter.workerId = auth.id;
        if (auth.role === Role.CLIENT) filter.clientId = auth.id;
        if (filter.clientId)
            await this.appointmentDomain.ensureClientExists(filter.clientId);
        if (filter.workerId)
            await this.appointmentDomain.ensureWorkerExists(filter.workerId);
    }

    private validateCancelTransition(role: Role, status: Status): void {
        if (role === Role.WORKER && status !== Status.SCHEDULED)
            throw new ConflictError(APPOINTMENT_ERRORS.STATUS_MISMATCH);
        if (
            role === Role.CLIENT &&
            status !== Status.SCHEDULED &&
            status !== Status.PENDING
        )
            throw new ConflictError(APPOINTMENT_ERRORS.STATUS_MISMATCH);
    }
}
