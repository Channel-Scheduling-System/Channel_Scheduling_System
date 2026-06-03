import prisma from '../../config/prisma.js';
import { Appointment, Prisma } from '@prisma/client.js';
import {
    ExtendedAppointment,
    CreateAppointmentData,
    OverlapFilter,
    Status,
    AppointmentFilter,
    AppointmentHistoryFilter,
    BasicAppointment,
    Role,
    NotifyAppointment,
    AppointmentCountFilter,
} from './appointment.types.js';

export interface IAppointmentRepository {
    create(data: CreateAppointmentData): Promise<Appointment>;
    findById(id: number): Promise<Appointment | null>;
    findExtendedById(id: number): Promise<ExtendedAppointment | null>;
    findForStatusChange(id: number): Promise<NotifyAppointment | null>;
    findByWorkerAndDate(workerId: number, date: string): Promise<Appointment[]>;
    count(filter: AppointmentCountFilter): Promise<number>;
    countOverlapsByWorker(filter: OverlapFilter): Promise<number>;
    countOverlapsByClient(filter: OverlapFilter): Promise<number>;
    findAllCalendar(
        filter: AppointmentFilter,
        role: Role,
    ): Promise<BasicAppointment[]>;
    findAllWithPagination(
        filter: AppointmentHistoryFilter,
    ): Promise<{ data: BasicAppointment[]; total: number }>;
    updateStatus(id: number, status: Status): Promise<void>;
}

export class AppointmentRepository implements IAppointmentRepository {
    async create(data: CreateAppointmentData): Promise<Appointment> {
        const { services, ...appointmentData } = data;
        return await prisma.appointment.create({
            data: {
                ...appointmentData,
                services: { create: services },
            },
        });
    }

    async findById(id: number): Promise<Appointment | null> {
        return await prisma.appointment.findUnique({ where: { id } });
    }

    async findExtendedById(id: number): Promise<ExtendedAppointment | null> {
        return await prisma.appointment.findUnique({
            where: { id },
            include: extendedInclude,
        });
    }

    async findForStatusChange(id: number): Promise<NotifyAppointment | null> {
        return await prisma.appointment.findUnique({
            where: { id },
            select: forStatusChangeSelect,
        });
    }

    async findByWorkerAndDate(
        workerId: number,
        date: string,
    ): Promise<Appointment[]> {
        return await prisma.appointment.findMany({
            where: {
                workerId,
                startAt: {
                    gte: new Date(`${date}T00:00:00.000Z`),
                    lt: new Date(`${date}T23:59:59.999Z`),
                },
            },
        });
    }

    async count(filter: AppointmentCountFilter): Promise<number> {
        return await prisma.appointment.count({
            where: {
                workerId: filter.workerId,
                clientId: filter.clientId,
                status: filter.status ? { in: filter.status } : undefined,
            }
        });
    }

    async countOverlapsByWorker(filter: OverlapFilter): Promise<number> {
        return await prisma.appointment.count({
            where: {
                workerId: filter.workerId,
                startAt: { lt: filter.endAt },
                endAt: { gt: filter.startAt },
                status: {
                    notIn: [Status.CANCELLED, Status.REJECTED, Status.PENDING],
                },
            },
        });
    }

    async countOverlapsByClient(filter: OverlapFilter): Promise<number> {
        return await prisma.appointment.count({
            where: {
                startAt: { lt: filter.endAt },
                endAt: { gt: filter.startAt },
                OR: [
                    {
                        status: {
                            notIn: [
                                Status.CANCELLED,
                                Status.REJECTED,
                                Status.PENDING,
                            ],
                        },
                    },
                    {
                        status: Status.PENDING,
                        clientId: filter.clientId,
                    },
                ],
            },
        });
    }

    async findAllCalendar(
        filter: AppointmentFilter,
        role: Role,
    ): Promise<BasicAppointment[]> {
        const where = this.buildWhere(filter);
        if (role === Role.WORKER)
            where.status = {
                in: [
                    Status.SCHEDULED,
                    Status.IN_PROGRESS,
                    Status.COMPLETED,
                    Status.NO_SHOW,
                ],
            };
        if (role === Role.CLIENT)
            where.status = {
                in: [
                    Status.PENDING,
                    Status.SCHEDULED,
                    Status.IN_PROGRESS,
                    Status.COMPLETED,
                ],
            };
        return await prisma.appointment.findMany({
            where,
            select: basicSelect,
            orderBy: { startAt: 'asc' },
        });
    }

    async findAllWithPagination(
        filter: AppointmentHistoryFilter,
    ): Promise<{ data: BasicAppointment[]; total: number }> {
        const limit = filter.limit || 10;
        const page = Math.max(1, filter.page || 1);
        const skip = (page - 1) * limit;

        const where = this.buildWhere(filter);
        const [data, total] = await Promise.all([
            prisma.appointment.findMany({
                skip,
                take: limit,
                where,
                select: basicSelect,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.appointment.count({ where }),
        ]);

        return { data, total };
    }

    async updateStatus(id: number, status: Status): Promise<void> {
        await prisma.appointment.update({
            where: { id },
            data: { status },
        });
    }

    private buildWhere(
        filter: AppointmentFilter,
    ): Prisma.AppointmentWhereInput {
        const where: Prisma.AppointmentWhereInput = {};
        if (filter.workerId) where.workerId = filter.workerId;
        if (filter.clientId) where.clientId = filter.clientId;
        if (filter.status) where.status = { in: filter.status };
        if (filter.from || filter.to) {
            where.startAt = {};
            if (filter.from) where.startAt.gte = new Date(filter.from);
            if (filter.to) where.startAt.lt = new Date(filter.to);
        }
        return where;
    }
}

const basicSelect = {
    id: true,
    startAt: true,
    endAt: true,
    status: true,
    notes: true,
    worker: {
        select: { id: true, firstName: true, lastName: true },
    },
    client: {
        select: { id: true, firstName: true, lastName: true },
    },
    services: {
        select: {
            service: {
                select: {
                    id: true,
                    name: true,
                    colorHex: true,
                },
            },
        },
    },
};

const extendedInclude = {
    worker: {
        select: { id: true, firstName: true, lastName: true },
    },
    client: {
        select: { id: true, firstName: true, lastName: true },
    },
    services: {
        select: {
            id: true,
            customDurationMin: true,
            customPrice: true,
            service: {
                select: {
                    id: true,
                    name: true,
                    colorHex: true,
                    defaultDurationMin: true,
                    defaultPrice: true,
                },
            },
        },
    },
};

const forStatusChangeSelect = {
    id: true,
    startAt: true,
    endAt: true,
    status: true,
    workerId: true,
    clientId: true,
    worker: {
        select: { firstName: true, lastName: true, email: true },
    },
    client: {
        select: { firstName: true, lastName: true, email: true },
    },
    services: {
        select: {
            service: { select: { name: true, colorHex: true } },
        },
    },
};
