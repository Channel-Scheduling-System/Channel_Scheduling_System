import prisma from '../../config/prisma.js';
import { Appointment } from '@prisma/client.js';
import {
    ExtendedAppointment,
    CreateAppointmentData,
    OverlapFilter,
    Status,
} from './appointment.types.js';

export interface IAppointmentRepository {
    create(data: CreateAppointmentData): Promise<Appointment>;
    findById(id: number): Promise<Appointment | null>;
    findExtendedById(id: number): Promise<ExtendedAppointment | null>;
    findByWorkerAndDate(workerId: number, date: string): Promise<Appointment[]>;
    countOverlapsByWorker(filter: OverlapFilter): Promise<number>;
    countOverlapsByClient(filter: OverlapFilter): Promise<number>;
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
            include: {
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
            },
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
}
