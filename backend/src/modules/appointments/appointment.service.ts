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
} from './appointment.types.js';
import {
    mapToAppointmentData,
    mapToAppointmentExtendedResponse,
    mapToCreateAppointmentResponse,
    mapToVerifyOverlapInput,
} from './appointment.mapper.js';
import { Slot } from '../../shared/types/slots.types.js';
import { AuthContext } from '../../shared/utils/request-parser.util.js';

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
}

export class AppointmentService implements IAppointmentService {
    private readonly appointmentDomain: AppointmentDomainService;
    private readonly filtersProcessor: AppointmentFiltersProcessor;

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
        await this.sendNotifications(appointment.id);
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

    async sendNotifications(_appointmentId: number): Promise<void> {
        // TODO: Implement notification logic to inform worker and client about the appointment details and any updates.
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
}
